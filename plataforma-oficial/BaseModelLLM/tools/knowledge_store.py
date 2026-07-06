"""
KnowledgeIndexer — Supabase + pgvector + indexación RAG.

Estructura:
  KnowledgeIndexer
  ├── DocumentProcessor  → Storage (PDFs) → chunks → embeddings → database_vector_*
  └── VectorStore        → conecta a la tabla vectorial y recupera por similitud

Tabla vectorial por org_id:
  org-banco    → database_vector_banco
  org-estudio  → database_vector_estudiocontable
"""

from __future__ import annotations

import io
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


class SafeSupabaseVectorStore(SupabaseVectorStore):
    """
    Subclase de SupabaseVectorStore que evita el error 'SyncRPCFilterRequestBuilder object has no attribute params'
    al realizar la búsqueda de similitud, realizando la llamada RPC directamente.
    """

    def similarity_search_by_vector(
        self,
        embedding: list[float],
        k: int = 4,
        filter: dict | None = None,
        **kwargs
    ) -> list[Document]:
        rpc_params = {
            "query_embedding": embedding,
            "match_count": k,
            "filter": filter or {}
        }
        res = self._client.rpc(self.query_name, rpc_params).execute()
        
        docs = []
        data = res.data or []
        for row in data[:k]:
            content = row.get("content", "")
            metadata = row.get("metadata", {})
            if isinstance(metadata, str):
                import ast
                try:
                    metadata = ast.literal_eval(metadata)
                except Exception:
                    try:
                        import json
                        metadata = json.loads(metadata)
                    except Exception:
                        metadata = {}
            docs.append(Document(page_content=content, metadata=metadata))
        return docs

    def similarity_search_with_score(
        self,
        query: str,
        k: int = 4,
        filter: dict | None = None,
        **kwargs
    ) -> list[tuple[Document, float]]:
        embedding = self._embedding.embed_query(query)
        rpc_params = {
            "query_embedding": embedding,
            "match_count": k,
            "filter": filter or {}
        }
        print(f"\n🔍 [RPC] Llamando a '{self.query_name}' | filter={filter} | k={k} | embedding_dim={len(embedding)}")
        try:
            res = self._client.rpc(self.query_name, rpc_params).execute()
        except Exception as rpc_err:
            import traceback
            print(f"❌ [RPC ERROR] Función: {self.query_name}")
            print(f"   Mensaje: {rpc_err}")
            traceback.print_exc()
            raise
        
        results = []
        data = res.data or []
        for row in data[:k]:
            content = row.get("content", "")
            metadata = row.get("metadata", {})
            if isinstance(metadata, str):
                import ast
                try:
                    metadata = ast.literal_eval(metadata)
                except Exception:
                    try:
                        import json
                        metadata = json.loads(metadata)
                    except Exception:
                        metadata = {}
            similarity = float(row.get("similarity", 0.0))
            doc = Document(page_content=content, metadata=metadata)
            results.append((doc, similarity))
        return results

# ── Constantes ───────────────────────────────────────────────────────────────

_BUCKET = "company-documents"

_TABLA_POR_ORG: dict[str, str] = {
    "org-banco":   "database_vector_banco",
    "org-estudio": "database_vector_estudiocontable",
}


# ════════════════════════════════════════════════════════════════════════════
# CLASE PRINCIPAL
# ════════════════════════════════════════════════════════════════════════════

class KnowledgeIndexer:
    """
    Orquestador RAG.

    Uso básico:
        ki = KnowledgeIndexer(org_id="org-banco", embeddings=my_embeddings)
        ki.processor.process_and_index()          # carga PDFs y vectoriza
        docs = ki.store.similarity_search(query)  # búsqueda semántica
    """

    # ── Constructor ──────────────────────────────────────────────────────────

    def __init__(
        self,
        org_id: str = "org-banco",
        embeddings=None,
        chunk_size: int = 1000,
        chunk_overlap: int = 150,
        client: Client | None = None,
        # Parámetros de compatibilidad con la API anterior
        path_cliente: str = "",
        config: dict | None = None,
        tech: dict | None = None,
    ):
        self.org_id = org_id
        self.embeddings = embeddings
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self._client = client
        self.last_stats: dict = {}
        # compat
        self.path_cliente = path_cliente
        self.config = config or {}
        self.tech = tech or {}

    # ── Tabla vectorial ──────────────────────────────────────────────────────

    @property
    def tabla(self) -> str:
        """Nombre de la tabla vectorial según el org_id."""
        nombre = self.tech.get("vector_db_name") if self.tech else None
        if nombre:
            return nombre
        return _TABLA_POR_ORG.get(
            self.org_id,
            f"database_vector_{self.org_id.replace('org-', '')}",
        )

    # ── Sub-clases lazy ──────────────────────────────────────────────────────

    @property
    def processor(self) -> "KnowledgeIndexer.DocumentProcessor":
        """Sub-clase encargada de cargar PDFs y generar vectores."""
        return KnowledgeIndexer.DocumentProcessor(self)

    @property
    def store(self) -> "KnowledgeIndexer.VectorStore":
        """Sub-clase encargada de la búsqueda semántica."""
        return KnowledgeIndexer.VectorStore(self)

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

    # ── API de compatibilidad ─────────────────────────────────────────────────

    def get_document_chunks(self, org_id: str) -> list[dict]:
        """Lee chunks crudos de la tabla `document_chunks` (sin vectores)."""
        try:
            r = (
                self.supabase.table("document_chunks")
                .select("content, documents(name)")
                .eq("org_id", org_id)
                .execute()
            )
            result = []
            for row in r.data or []:
                docs = row.get("documents") or {}
                source = (
                    docs.get("name", "Documento_Nube")
                    if isinstance(docs, dict)
                    else "Documento_Nube"
                )
                result.append({
                    "text": row["content"],
                    "metadata": {
                        "source": source,
                        "modulo": "Supabase",
                        "org_id": org_id,
                    },
                })
            return result
        except Exception as e:
            print(f"Error al descargar document_chunks para {org_id}: {e}")
            return []

    def contar_vectores(self, tabla: str, org_id: str) -> int:
        """Cuenta los vectores en la tabla (cada tabla es por cliente, no filtra org_id)."""
        try:
            r = (
                self.supabase.table(tabla)
                .select("id", count="exact", head=True)
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
                .limit(limite)
                .execute()
            )
            return r.data or []
        except Exception as e:
            print(f"Error al obtener muestras de {tabla}: {e}")
            return []

    def build(self, force_rebuild: bool = False):
        """API de compatibilidad — construye o reutiliza el vector store."""
        if force_rebuild:
            self.processor.limpiar_vectores()

        count = self.contar_vectores(self.tabla, self.org_id)
        if count > 0 and not force_rebuild:
            print(f"☁️  [{self.tabla}] {count} vectores — conectando...")
            vs = self.store.as_langchain_store()
            self.last_stats = metricas_supabase(
                self, self.tabla, self.org_id, modo="cargada"
            )
            self.last_stats["vector_db_name"] = self.tabla
            return vs, self.last_stats

        print(f"☁️  [{self.tabla}] vacía — indexando desde Storage...")
        n = self.processor.process_and_index()
        vs = self.store.as_langchain_store()
        self.last_stats = metricas_supabase(
            self, self.tabla, self.org_id, modo="creada",
            fragmentos_indexados=n,
        )
        self.last_stats["vector_db_name"] = self.tabla
        return vs, self.last_stats

    # ════════════════════════════════════════════════════════════════════════
    # SUB-CLASE 1: DocumentProcessor
    # ════════════════════════════════════════════════════════════════════════

    class DocumentProcessor:
        """
        Descarga PDFs del Storage de Supabase, los divide en chunks
        según los hiperparámetros y genera embeddings en la tabla vectorial.

        Se invoca desde el botón "Cargar documentos" del frontend.

        Flujo:
            Storage (org-banco/) → texto → chunks → embeddings → database_vector_banco
        """

        def __init__(self, indexer: "KnowledgeIndexer"):
            self._ki = indexer

        # ── API pública ──────────────────────────────────────────────────────

        def process_and_index(self) -> int:
            """
            Descarga todos los PDFs del Storage para el org_id,
            genera chunks con embeddings y los inserta en la tabla vectorial.

            Returns:
                Número de chunks indexados.
            """
            print(f"📥 Descargando PDFs de Storage [{self._ki.org_id}]...")
            documentos = self._download_pdfs_from_storage()

            if not documentos:
                print("⚠️  No hay PDFs en el Storage para este org_id.")
                return 0

            chunks = self._split_documents(documentos)
            print(
                f"✂️  {len(chunks)} chunks generados "
                f"(size={self._ki.chunk_size}, overlap={self._ki.chunk_overlap})"
            )

            self._insert_to_vector_table(chunks)
            print(f"✅ {len(chunks)} chunks indexados en [{self._ki.tabla}]")
            return len(chunks)

        def limpiar_vectores(self) -> None:
            """Elimina todos los vectores de la tabla vectorial del cliente."""
            self._ki.supabase.table(self._ki.tabla).delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
            print(
                f"🗑️  Tabla [{self._ki.tabla}] vaciada"
            )

        # ── Pasos internos ───────────────────────────────────────────────────

        def _download_pdfs_from_storage(self) -> list[dict]:
            """
            Lista el bucket `company-documents` bajo el prefijo org_id/
            y descarga cada PDF. Retorna lista de {name, text}.
            """
            bucket = self._ki.supabase.storage.from_(_BUCKET)
            try:
                files = bucket.list(self._ki.org_id)
            except Exception as e:
                print(f"Error listando Storage: {e}")
                return []

            documentos = []
            for file_info in files:
                name = file_info.get("name", "")
                if not name.lower().endswith(".pdf"):
                    continue
                path = f"{self._ki.org_id}/{name}"
                try:
                    raw = bucket.download(path)
                    reader = PdfReader(io.BytesIO(raw))
                    text = "\n".join(
                        p.extract_text() for p in reader.pages if p.extract_text()
                    )
                    if text.strip():
                        documentos.append({"name": name, "text": text})
                        print(f"  📄 {name} ({len(reader.pages)} páginas)")
                except Exception as e:
                    print(f"  ⚠️  Error con {name}: {e}")

            return documentos

        def _split_documents(self, documentos: list[dict]) -> list[Document]:
            """Divide cada documento en chunks con RecursiveCharacterTextSplitter."""
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=self._ki.chunk_size,
                chunk_overlap=self._ki.chunk_overlap,
                separators=["\n\n", "\n", ".", " ", ""],
            )
            chunks = []
            for doc in documentos:
                for i, chunk_text in enumerate(splitter.split_text(doc["text"])):
                    chunks.append(Document(
                        page_content=chunk_text,
                        metadata={
                            "source": doc["name"],
                            "org_id": self._ki.org_id,
                            "chunk_index": i,
                        },
                    ))
            return chunks

        def _insert_to_vector_table(self, chunks: list[Document]) -> None:
            """Genera embeddings e inserta en la tabla vectorial."""
            SafeSupabaseVectorStore.from_documents(
                chunks,
                self._ki.embeddings,
                client=self._ki.supabase,
                table_name=self._ki.tabla,
                query_name=f"match_{self._ki.tabla}",
            )

    # ════════════════════════════════════════════════════════════════════════
    # SUB-CLASE 2: VectorStore
    # ════════════════════════════════════════════════════════════════════════

    class VectorStore:
        """
        Conecta con la tabla vectorial del org_id y permite
        búsqueda semántica por similitud de coseno (pgvector).
        """

        def __init__(self, indexer: "KnowledgeIndexer"):
            self._ki = indexer
            self._store: SafeSupabaseVectorStore | None = None

        def _get_store(self) -> SafeSupabaseVectorStore:
            if self._store is None:
                self._store = SafeSupabaseVectorStore(
                    client=self._ki.supabase,
                    embedding=self._ki.embeddings,
                    table_name=self._ki.tabla,
                    query_name=f"match_{self._ki.tabla}",
                )
            return self._store

        def as_langchain_store(self) -> SafeSupabaseVectorStore:
            """Devuelve el SupabaseVectorStore listo para LangChain."""
            return self._get_store()

        def similarity_search(self, query: str, k: int = 5) -> list[Document]:
            """
            Busca los k documentos más similares a la query.

            Args:
                query: Texto de búsqueda.
                k:     Número de resultados.

            Returns:
                Lista de Documents con page_content y metadata.
            """
            return self._get_store().similarity_search(query, k=k)

        def as_retriever(self, k: int = 5):
            """Devuelve un retriever compatible con LangChain chains."""
            return self._get_store().as_retriever(search_kwargs={"k": k})
