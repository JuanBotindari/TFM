"""
KnowledgeIndexer — Supabase + pgvector + indexación RAG en una sola clase.

Flujo build():
  1. Contar vectores del org_id en la tabla vectorial
  2. Si hay datos → abrir SupabaseVectorStore
  3. Si no → cargar desde document_chunks o PDFs locales → indexar
"""

from __future__ import annotations

import os
import sys

from dotenv import load_dotenv
from langchain_community.vectorstores import SupabaseVectorStore
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pypdf import PdfReader
from supabase import Client, create_client

from .telemetry import metricas_supabase

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


class KnowledgeIndexer:
    """Cliente Supabase unificado: chunks de texto, vectores e indexación."""

    CHUNK_SIZE = 1000
    CHUNK_OVERLAP = 150

    # ── Inicialización ───────────────────────────────────────────────────────

    def __init__(
        self,
        path_cliente: str,
        config: dict,
        embeddings,
        tech: dict | None = None,
        client: Client | None = None,
    ):
        self.path_cliente = path_cliente
        self.config = config if isinstance(config, dict) else {}
        self.tech = tech if isinstance(tech, dict) else {}
        self.embeddings = embeddings
        self.vector_db_name = self._resolver_vector_db_name()
        self.org_id = self.tech.get("org_id", "")
        self.last_stats: dict = {}
        self._client = client

    def build(self, force_rebuild: bool = False):
        """Devuelve (vector_store, estadísticas)."""
        if not self.org_id:
            raise ValueError(
                f"Falta org_id en config/settings.json para {self.path_cliente}"
            )

        tabla = self.vector_db_name
        count = self.contar_vectores(tabla, self.org_id)

        if force_rebuild and count > 0:
            print(f"🗑️  Limpiando tabla Supabase [{tabla}] para {self.org_id}...")
            self.eliminar_vectores_org(tabla, self.org_id)
            count = 0

        if count > 0 and not force_rebuild:
            print(f"☁️  [Supabase] Base [{tabla}] con {count} vectores — conectando...")
            vs = self.abrir_vector_store(tabla)
            self.last_stats = metricas_supabase(
                self, tabla, self.org_id, modo="cargada",
            )
            self.last_stats["vector_db_name"] = tabla
            return vs, self.last_stats

        print(f"☁️  [Supabase] Tabla [{tabla}] vacía — creando índice...")
        chunks, fuente = self._obtener_chunks_para_indexar()

        if chunks:
            print(f"🔮 Indexando {len(chunks)} fragmentos en Supabase [{tabla}]...")
            vs = self.indexar_chunks(chunks, tabla)
            self.last_stats = metricas_supabase(
                self, tabla, self.org_id, modo="creada",
                fragmentos_indexados=len(chunks),
                fuente=fuente,
            )
        else:
            print("⚠️  Sin documentos en Supabase ni locales. Base vectorial vacía.")
            vs = self.abrir_vector_store(tabla)
            self.last_stats = metricas_supabase(
                self, tabla, self.org_id, modo="vacia",
                fragmentos_indexados=0,
            )

        self.last_stats["vector_db_name"] = tabla
        return vs, self.last_stats

    # ── Conexión Supabase ────────────────────────────────────────────────────

    @property
    def supabase(self) -> Client:
        if self._client is None:
            self._client = self.crear_cliente()
        return self._client

    @staticmethod
    def crear_cliente() -> Client:
        repo_root = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "..")
        )
        load_dotenv(os.path.join(repo_root, ".env"))
        load_dotenv(os.path.join(repo_root, "plataforma-oficial", ".env.local"))

        url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        key = os.getenv("otra_key_supabase") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

        if not url or not key:
            raise ValueError(
                "Faltan credenciales de Supabase. "
                "Configura NEXT_PUBLIC_SUPABASE_URL y la clave en plataforma-oficial/.env.local"
            )
        return create_client(url, key)

    # ── document_chunks (texto fuente) ───────────────────────────────────────

    def get_document_chunks(self, org_id: str) -> list[dict]:
        try:
            respuesta = (
                self.supabase.table("document_chunks")
                .select("content, documents(name)")
                .eq("org_id", org_id)
                .execute()
            )
            fragmentos = []
            for row in respuesta.data or []:
                docs = row.get("documents") or {}
                source_name = (
                    docs.get("name", "Documento_Nube")
                    if isinstance(docs, dict)
                    else "Documento_Nube"
                )
                fragmentos.append({
                    "text": row["content"],
                    "metadata": {
                        "source": source_name,
                        "modulo": "Supabase",
                        "org_id": org_id,
                    },
                })
            return fragmentos
        except Exception as e:
            print(f"Error al descargar document_chunks para {org_id}: {e}")
            return []

    # ── Tablas vectoriales (lectura / escritura) ─────────────────────────────

    def contar_vectores(self, tabla: str, org_id: str) -> int:
        try:
            r = (
                self.supabase.table(tabla)
                .select("id", count="exact", head=True)
                .eq("org_id", org_id)
                .execute()
            )
            return r.count or 0
        except Exception:
            return 0

    def obtener_muestras(self, tabla: str, org_id: str, limite: int = 80) -> list[dict]:
        try:
            r = (
                self.supabase.table(tabla)
                .select("content, metadata")
                .eq("org_id", org_id)
                .limit(limite)
                .execute()
            )
            return r.data or []
        except Exception:
            return []

    def eliminar_vectores_org(self, tabla: str, org_id: str) -> None:
        self.supabase.table(tabla).delete().eq("org_id", org_id).execute()

    def _match_fn(self, tabla: str) -> str:
        return self.tech.get("vector_match_fn") or f"match_{tabla}"

    def abrir_vector_store(self, tabla: str) -> SupabaseVectorStore:
        return SupabaseVectorStore(
            client=self.supabase,
            embedding=self.embeddings,
            table_name=tabla,
            query_name=self._match_fn(tabla),
        )

    def indexar_chunks(self, chunks: list[dict], tabla: str) -> SupabaseVectorStore:
        documentos = [
            Document(
                page_content=c["text"],
                metadata={**c["metadata"], "org_id": self.org_id},
            )
            for c in chunks
        ]
        return SupabaseVectorStore.from_documents(
            documentos,
            self.embeddings,
            client=self.supabase,
            table_name=tabla,
            query_name=self._match_fn(tabla),
        )

    # ── Orquestación de fuentes ──────────────────────────────────────────────

    def _obtener_chunks_para_indexar(self) -> tuple[list, str | None]:
        print(f"☁️  Descargando document_chunks para {self.org_id}...")
        chunks = self.get_document_chunks(self.org_id)
        if chunks:
            print(f"📥 {len(chunks)} fragmentos desde document_chunks.")
            return chunks, "Supabase (document_chunks)"

        print("💾 Sin chunks en document_chunks — leyendo PDFs locales...")
        chunks = self._obtener_chunks_locales()
        if chunks:
            return chunks, "archivos locales (PDF/web) → Supabase"
        return [], None

    def _resolver_vector_db_name(self) -> str:
        nombre = self.tech.get("vector_db_name")
        if nombre:
            return nombre
        slug = os.path.basename(self.path_cliente).lower()
        if "banco" in slug:
            return "database_vector_banco"
        if "contable" in slug or "estudio" in slug:
            return "database_vector_estudiocontable"
        return f"database_vector_{slug.replace('client-', '')}"

    # ── Fuentes locales (PDF / web) ──────────────────────────────────────────

    def _obtener_chunks_locales(self) -> list:
        all_chunks = []
        for modulo in self.config.get("indice_conocimiento", {}).get("modulos", []):
            dir_path = os.path.join(self.path_cliente, modulo.get("directorio", ""))
            tipo = modulo.get("tipo", "pdf").lower()
            if not os.path.exists(dir_path):
                continue
            if tipo == "pdf":
                all_chunks.extend(self._leer_pdfs(dir_path, modulo))
            elif tipo == "web":
                all_chunks.extend(self._leer_web(dir_path, modulo))
        return all_chunks

    def _leer_pdfs(self, path: str, modulo: dict) -> list:
        chunks = []
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.CHUNK_SIZE, chunk_overlap=self.CHUNK_OVERLAP
        )
        for file in os.listdir(path):
            if not file.endswith(".pdf"):
                continue
            try:
                reader = PdfReader(os.path.join(path, file))
                text = "\n".join(
                    p.extract_text() for p in reader.pages if p.extract_text()
                )
                for chunk in splitter.split_text(text):
                    chunks.append({
                        "text": chunk,
                        "metadata": {
                            "source": file,
                            "modulo": modulo["nombre"],
                            "org_id": self.org_id,
                        },
                    })
            except Exception:
                pass
        return chunks

    def _leer_web(self, path: str, modulo: dict) -> list:
        chunks = []
        for file in os.listdir(path):
            if file.endswith((".txt", ".html", ".json")):
                with open(os.path.join(path, file), "r", encoding="utf-8") as f:
                    text = f.read()
                chunks.append({
                    "text": text,
                    "metadata": {
                        "source": file,
                        "modulo": modulo["nombre"],
                        "org_id": self.org_id,
                    },
                })
        return chunks
