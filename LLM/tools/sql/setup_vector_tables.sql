-- Bases vectoriales por cliente en Supabase (pgvector + Gemini embedding-001 = 3072 dims)
-- Ejecutar en el SQL Editor de Supabase.
-- Después, comprobar con: LLM/tools/sql/verify_vector_setup.sql

CREATE EXTENSION IF NOT EXISTS vector;

-- ── Banco ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.database_vector_banco (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content    TEXT NOT NULL,
    metadata   JSONB DEFAULT '{}',
    embedding  VECTOR(3072),
    org_id     TEXT NOT NULL DEFAULT 'org-banco'
);

CREATE INDEX IF NOT EXISTS idx_database_vector_banco_org
    ON public.database_vector_banco (org_id);

CREATE OR REPLACE FUNCTION public.match_database_vector_banco(
    query_embedding VECTOR(3072),
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

-- ── Estudio contable ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.database_vector_estudiocontable (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content    TEXT NOT NULL,
    metadata   JSONB DEFAULT '{}',
    embedding  VECTOR(3072),
    org_id     TEXT NOT NULL DEFAULT 'org-estudio'
);

CREATE INDEX IF NOT EXISTS idx_database_vector_estudiocontable_org
    ON public.database_vector_estudiocontable (org_id);

CREATE OR REPLACE FUNCTION public.match_database_vector_estudiocontable(
    query_embedding VECTOR(3072),
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
