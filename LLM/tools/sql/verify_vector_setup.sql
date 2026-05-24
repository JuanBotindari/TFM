-- Comprueba que el esquema RAG en Supabase está listo (solo lectura).
-- Ejecutar en el SQL Editor de Supabase después de setup_vector_tables.sql.

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
            WHEN r.objeto LIKE '%match_%' THEN 'Función de búsqueda semántica'
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

-- Resumen: 0 = todo correcto
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
                    SELECT 1 FROM pg_proc p
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
