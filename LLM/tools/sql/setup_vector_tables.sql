-- Bases vectoriales por cliente en Supabase
-- Modelo: gemini-embedding-2 con output_dimensionality = 1536
-- Ejecutar en el SQL Editor de Supabase (idempotente: IF NOT EXISTS).
-- Comprobar después: LLM/tools/sql/verify_vector_setup.sql
-- O en local: python LLM/tools/sql/run_vector_setup.py

CREATE EXTENSION IF NOT EXISTS vector;

-- ── Banco (org-banco) ────────────────────────────────────────────────────────
-- Equivalente a documentos_proyectos: contenido + embedding + filtro por cliente.
-- Columnas content/metadata/org_id: requeridas por LangChain SupabaseVectorStore.

CREATE TABLE IF NOT EXISTS public.database_vector_banco (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content         TEXT NOT NULL,              -- chunk / contenido_original
    metadata        JSONB DEFAULT '{}',
    embedding       VECTOR(1536),               -- gemini-embedding-2 @ 1536 dims
    org_id          TEXT NOT NULL DEFAULT 'org-banco',
    fecha_creacion  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_database_vector_banco_org
    ON public.database_vector_banco (org_id);

CREATE INDEX IF NOT EXISTS idx_database_vector_banco_embedding
    ON public.database_vector_banco
    USING hnsw (embedding vector_cosine_ops);

CREATE OR REPLACE FUNCTION public.match_database_vector_banco(
    query_embedding VECTOR(1536),
    filter JSONB DEFAULT '{}'
)
RETURNS TABLE (
    id         UUID,
    content    TEXT,
    metadata   JSONB,
    similarity FLOAT
)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        v.id,
        v.content,
        v.metadata,
        1 - (v.embedding <=> query_embedding) AS similarity
    FROM public.database_vector_banco v
    WHERE v.org_id = COALESCE(filter->>'org_id', v.org_id)
    ORDER BY v.embedding <=> query_embedding
    LIMIT 10;
END;
$$;

-- ── Estudio contable (org-estudio) ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.database_vector_estudiocontable (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content         TEXT NOT NULL,
    metadata        JSONB DEFAULT '{}',
    embedding       VECTOR(1536),
    org_id          TEXT NOT NULL DEFAULT 'org-estudio',
    fecha_creacion  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_database_vector_estudiocontable_org
    ON public.database_vector_estudiocontable (org_id);

CREATE INDEX IF NOT EXISTS idx_database_vector_estudiocontable_embedding
    ON public.database_vector_estudiocontable
    USING hnsw (embedding vector_cosine_ops);

CREATE OR REPLACE FUNCTION public.match_database_vector_estudiocontable(
    query_embedding VECTOR(1536),
    filter JSONB DEFAULT '{}'
)
RETURNS TABLE (
    id         UUID,
    content    TEXT,
    metadata   JSONB,
    similarity FLOAT
)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        v.id,
        v.content,
        v.metadata,
        1 - (v.embedding <=> query_embedding) AS similarity
    FROM public.database_vector_estudiocontable v
    WHERE v.org_id = COALESCE(filter->>'org_id', v.org_id)
    ORDER BY v.embedding <=> query_embedding
    LIMIT 10;
END;
$$;

-- Migración desde embedding-001 (3072 dims):
-- Si las tablas ya existían con VECTOR(3072), pgvector no las altera con IF NOT EXISTS.
-- Opción A (reindexar desde cero): descomenta y ejecuta UNA vez por tabla:
-- DROP TABLE IF EXISTS public.database_vector_banco CASCADE;
-- DROP TABLE IF EXISTS public.database_vector_estudiocontable CASCADE;
-- Luego vuelve a ejecutar este script completo.
