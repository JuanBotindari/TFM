"""
KnowledgeIndexer
================
Responsabilidad única: construir y devolver la base vectorial (Chroma)
lista para ser usada por el agente.

Fuentes soportadas (en orden de prioridad):
  1. Supabase Cloud  → usa SupabaseKnowledgeFetcher del módulo tools
  2. Archivos locales → PDFs y ficheros web del manifiesto rag.json

La clase no sabe nada de LLMs ni de handlers; solo indexa.
"""

import os
import shutil
import io

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from pypdf import PdfReader

from LLM.tools import SupabaseKnowledgeFetcher


class KnowledgeIndexer:
    """
    Construye la base vectorial (Chroma) a partir de documentos de Supabase
    o de archivos locales (fallback).

    Uso:
        indexer = KnowledgeIndexer(path_cliente, nombre_cliente, manifiesto, embeddings)
        vector_store, archivos_reporte = indexer.build(force_rebuild=False)
    """

    CHUNK_SIZE    = 1000
    CHUNK_OVERLAP = 150

    def __init__(
        self,
        path_cliente:   str,
        nombre_cliente: str,
        manifiesto:     dict,
        embeddings,
    ):
        self.path_cliente   = path_cliente
        self.nombre_cliente = nombre_cliente
        self.manifiesto     = manifiesto
        self.embeddings     = embeddings
        self.archivos_reporte: list = []

    # ── Punto de entrada ─────────────────────────────────────────────────────

    def build(self, force_rebuild: bool = False) -> tuple[Chroma, list]:
        """
        Construye o carga la base vectorial.
        Devuelve (vector_store, archivos_reporte).
        """
        db_path = os.path.join(self.path_cliente, "db/vector_store")

        chunks = self._obtener_chunks_supabase()

        if chunks:
            vector_store = self._indexar(chunks, db_path, limpiar=True)
        else:
            print("💾 [Fallback RAG] Usando archivos locales...")
            if force_rebuild and os.path.exists(db_path):
                shutil.rmtree(db_path, ignore_errors=True)

            if not os.path.exists(db_path) or force_rebuild:
                chunks_locales = self._obtener_chunks_locales()
                if chunks_locales:
                    self._indexar(chunks_locales, db_path, limpiar=False)
                else:
                    self._registrar_tablas_en_reporte()
            else:
                self._escanear_para_reporte()

            vector_store = Chroma(
                persist_directory=db_path,
                embedding_function=self.embeddings,
            )

        return vector_store, self.archivos_reporte

    # ── Fuente 1: Supabase ───────────────────────────────────────────────────

    def _obtener_chunks_supabase(self) -> list:
        """
        Descarga los chunks pre-procesados desde Supabase usando SupabaseKnowledgeFetcher.
        Si falla o no hay datos, devuelve lista vacía.
        """
        try:
            fetcher = SupabaseKnowledgeFetcher()
            org_id  = "org-banco" if "banco" in self.nombre_cliente else "org-estudio"

            print(f"☁️  [Supabase] Descargando chunks para {org_id}...")
            chunks = fetcher.get_document_chunks(org_id)

            if chunks:
                print(f"📥 {len(chunks)} fragmentos descargados.")
                for src in set(c["metadata"]["source"] for c in chunks):
                    self.archivos_reporte.append(
                        [src, "Supabase Cloud", "RAG Vectorial", "Listo 🔮"]
                    )
            return chunks

        except Exception as e:
            print(f"⚠️  [Supabase] No disponible: {e}")
            return []

    # ── Fuente 2: Archivos locales ───────────────────────────────────────────

    def _obtener_chunks_locales(self) -> list:
        """Lee PDFs y ficheros web definidos en rag.json."""
        all_chunks = []
        for modulo in self.manifiesto.get("indice_conocimiento", {}).get("modulos", []):
            dir_path = os.path.join(self.path_cliente, modulo.get("directorio", ""))
            tipo     = modulo.get("tipo", "pdf").lower()

            if not os.path.exists(dir_path):
                continue

            if tipo == "pdf":
                all_chunks.extend(self._leer_pdfs(dir_path, modulo))
            elif tipo == "web":
                all_chunks.extend(self._leer_web(dir_path, modulo))
            elif tipo == "tablas":
                self._registrar_tablas_en_reporte(dir_path, modulo)

        return all_chunks

    def _leer_pdfs(self, path: str, modulo: dict) -> list:
        chunks   = []
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.CHUNK_SIZE, chunk_overlap=self.CHUNK_OVERLAP
        )
        for file in os.listdir(path):
            if not file.endswith(".pdf"):
                continue
            try:
                reader = PdfReader(os.path.join(path, file))
                text   = "\n".join([p.extract_text() for p in reader.pages if p.extract_text()])
                for chunk in splitter.split_text(text):
                    chunks.append({
                        "text":     chunk,
                        "metadata": {"source": file, "modulo": modulo["nombre"]},
                    })
                self.archivos_reporte.append([file, modulo["nombre"], "RAG PDF", "Nuevo ✅"])
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
                    "text":     text,
                    "metadata": {"source": file, "modulo": modulo["nombre"]},
                })
                self.archivos_reporte.append([file, modulo["nombre"], "RAG Web", "Nuevo ✅"])
        return chunks

    def _registrar_tablas_en_reporte(self, dir_path: str = "", modulo: dict = None):
        if not dir_path or not modulo or not os.path.exists(dir_path):
            return
        for f in os.listdir(dir_path):
            self.archivos_reporte.append([f, modulo["nombre"], "AGENTE", "Listo 🛠️"])

    def _escanear_para_reporte(self):
        """Registra archivos existentes sin reindexar (base ya existe)."""
        for modulo in self.manifiesto.get("indice_conocimiento", {}).get("modulos", []):
            dir_path = os.path.join(self.path_cliente, modulo.get("directorio", ""))
            if os.path.exists(dir_path):
                for f in os.listdir(dir_path):
                    self.archivos_reporte.append([f, modulo["nombre"], "Indirecto", "Listo 💾"])

    # ── Construcción del índice vectorial ────────────────────────────────────

    def _indexar(self, chunks: list, db_path: str, limpiar: bool) -> Chroma:
        print(f"🔮 Generando vectores para {len(chunks)} fragmentos...")

        if limpiar and os.path.exists(db_path):
            shutil.rmtree(db_path, ignore_errors=True)

        return Chroma.from_texts(
            texts     =[c["text"]     for c in chunks],
            metadatas =[c["metadata"] for c in chunks],
            embedding =self.embeddings,
            persist_directory=db_path,
        )
