-- Comprueba el esquema RAG en Supabase (solo lectura).
-- Ejecutar después de setup_vector_tables.sql

-- ── 1. Objetos requeridos (extensión, tablas, funciones) ─────────────────────

WITH requeridos AS (
    SELECT unnest(ARRAY[
        'vector',
        'public.database_vector_banco',
        'public.database_vector_estudiocontable',
        'public.document_chunks',
        'public.match_database_vector_banco',
        'public.match_database_vector_estudiocontable'
    ]) AS objeto
),
comprobacion AS (
    SELECT
        r.objeto,
        CASE
            WHEN r.objeto = 'vector' THEN
                EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector')
            WHEN r.objeto LIKE 'public.%' AND r.objeto LIKE '%match_%' THEN
                EXISTS (
                    SELECT 1
                    FROM pg_proc p
                    JOIN pg_namespace n ON n.oid = p.pronamespace
                    WHERE n.nspname = 'public'
                      AND p.proname = replace(r.objeto, 'public.', '')
                )
            WHEN r.objeto LIKE 'public.%' THEN
                to_regclass(r.objeto) IS NOT NULL
            ELSE false
        END AS existe,
        CASE
            WHEN r.objeto = 'vector' THEN 'Extensión pgvector'
            WHEN r.objeto LIKE '%match_%' THEN 'Función match (1536 dims)'
            WHEN r.objeto = 'public.document_chunks' THEN 'Chunks de documentos (plataforma)'
            ELSE 'Tabla vectorial por cliente'
        END AS detalle
    FROM requeridos r
)
SELECT
    objeto,
    existe,
    detalle,
    CASE WHEN existe THEN 'OK' ELSE 'FALTA — ejecuta setup_vector_tables.sql' END AS estado
FROM comprobacion
ORDER BY existe ASC, objeto;

-- ── 2. Dimensiones del embedding (debe ser 1536) ─────────────────────────────

SELECT
    c.relname AS tabla,
    a.attname AS columna,
    CASE
        WHEN a.atttypmod = -1 THEN NULL
        ELSE a.atttypmod
    END AS typmod_pg,
    CASE
        WHEN a.atttypmod > 0 THEN a.atttypmod
        ELSE NULL
    END AS dimensiones_embedding,
    CASE
        WHEN a.atttypmod = 1536 THEN 'OK (gemini-embedding-2 @ 1536)'
        WHEN to_regclass('public.' || c.relname) IS NULL THEN 'tabla no existe'
        ELSE 'REVISAR — esperado 1536; migrar o recrear tabla'
    END AS estado_dims
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_attribute a ON a.attrelid = c.oid
JOIN pg_type t ON t.oid = a.atttypid
WHERE n.nspname = 'public'
  AND c.relname IN ('database_vector_banco', 'database_vector_estudiocontable')
  AND a.attname = 'embedding'
  AND NOT a.attisdropped
ORDER BY c.relname;

-- ── 3. Índices HNSW y por org_id ─────────────────────────────────────────────

SELECT
    t.relname AS tabla,
    i.relname AS indice,
    am.amname AS metodo,
    CASE
        WHEN i.relname LIKE '%embedding%' AND am.amname = 'hnsw' THEN 'OK'
        WHEN i.relname LIKE '%org%' THEN 'OK'
        ELSE 'revisar'
    END AS estado
FROM pg_index ix
JOIN pg_class i ON i.oid = ix.indexrelid
JOIN pg_class t ON t.oid = ix.indrelid
JOIN pg_am am ON am.oid = i.relam
JOIN pg_namespace n ON n.oid = t.relnamespace
WHERE n.nspname = 'public'
  AND t.relname IN ('database_vector_banco', 'database_vector_estudiocontable')
  AND (
      i.relname LIKE 'idx_database_vector_%'
  )
ORDER BY t.relname, i.relname;

-- ── 4. Resumen: objetos faltantes (0 = todo correcto) ────────────────────────

WITH requeridos AS (
    SELECT unnest(ARRAY[
        'vector',
        'public.database_vector_banco',
        'public.database_vector_estudiocontable',
        'public.document_chunks',
        'public.match_database_vector_banco',
        'public.match_database_vector_estudiocontable'
    ]) AS objeto
),
comprobacion AS (
    SELECT
        CASE
            WHEN r.objeto = 'vector' THEN
                EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector')
            WHEN r.objeto LIKE 'public.%' AND r.objeto LIKE '%match_%' THEN
                EXISTS (
                    SELECT 1
                    FROM pg_proc p
                    JOIN pg_namespace n ON n.oid = p.pronamespace
                    WHERE n.nspname = 'public'
                      AND p.proname = replace(r.objeto, 'public.', '')
                )
            WHEN r.objeto LIKE 'public.%' THEN
                to_regclass(r.objeto) IS NOT NULL
            ELSE false
        END AS existe
    FROM requeridos r
)
SELECT count(*) FILTER (WHERE NOT existe) AS objetos_faltantes
FROM comprobacion;

-- ── 5. Vista rápida del esquema (columnas) ───────────────────────────────────

SELECT
    table_name,
    column_name,
    data_type,
    udt_name,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('database_vector_banco', 'database_vector_estudiocontable')
ORDER BY table_name, ordinal_position;
