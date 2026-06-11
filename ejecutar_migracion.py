"""
Script para ejecutar la migración de tablas vectoriales directamente desde Python.
Usar solo si no podés acceder al SQL Editor de Supabase.
"""
import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'plataforma-oficial'))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), 'plataforma-oficial', '.env.local'))

from supabase import create_client

url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
key = os.getenv("otra_key_supabase") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

print(f"Conectando a Supabase: {url}")
client = create_client(url, key)

SQL = """
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP FUNCTION IF EXISTS match_database_vector_banco(vector, int, float);
DROP FUNCTION IF EXISTS match_database_vector_banco(vector(1536), int, float);
DROP FUNCTION IF EXISTS match_database_vector_banco(vector(768), int, float);
DROP TABLE IF EXISTS database_vector_banco CASCADE;

CREATE TABLE database_vector_banco (
    id        uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    content   text,
    metadata  jsonb,
    embedding vector(768)
);

CREATE OR REPLACE FUNCTION match_database_vector_banco(
    query_embedding vector(768),
    match_count     int     DEFAULT 5,
    match_threshold float   DEFAULT 0.3,
    filter          jsonb   DEFAULT '{}'
)
RETURNS TABLE (id uuid, content text, metadata jsonb, similarity float)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT t.id, t.content, t.metadata,
           (1 - (t.embedding <=> query_embedding))::float AS similarity
    FROM database_vector_banco t
    WHERE 1 - (t.embedding <=> query_embedding) > match_threshold
    ORDER BY t.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

DROP FUNCTION IF EXISTS match_database_vector_estudiocontable(vector, int, float);
DROP FUNCTION IF EXISTS match_database_vector_estudiocontable(vector(1536), int, float);
DROP FUNCTION IF EXISTS match_database_vector_estudiocontable(vector(768), int, float);
DROP TABLE IF EXISTS database_vector_estudiocontable CASCADE;

CREATE TABLE database_vector_estudiocontable (
    id        uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    content   text,
    metadata  jsonb,
    embedding vector(768)
);

CREATE OR REPLACE FUNCTION match_database_vector_estudiocontable(
    query_embedding vector(768),
    match_count     int     DEFAULT 5,
    match_threshold float   DEFAULT 0.3,
    filter          jsonb   DEFAULT '{}'
)
RETURNS TABLE (id uuid, content text, metadata jsonb, similarity float)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT t.id, t.content, t.metadata,
           (1 - (t.embedding <=> query_embedding))::float AS similarity
    FROM database_vector_estudiocontable t
    WHERE 1 - (t.embedding <=> query_embedding) > match_threshold
    ORDER BY t.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
"""

# Supabase Python client no soporta ejecutar SQL DDL directamente con .rpc()
# La forma correcta es usar postgrest con el endpoint de administración
# Esto requiere la service_role key (que ya tenemos en otra_key_supabase)
try:
    result = client.rpc("exec_sql", {"sql": SQL}).execute()
    print("OK:", result)
except Exception as e:
    print(f"No se pudo ejecutar via RPC: {e}")
    print()
    print("=" * 60)
    print("INSTRUCCIONES MANUALES:")
    print("1. Ve a https://supabase.com/dashboard/project/wwnnrtuoomgjgdryxzks/sql/new")
    print("2. Pega el contenido de: plataforma-oficial/RAG-docs/MIGRACION_OLLAMA_VECTORES.sql")
    print("3. Haz click en 'Run'")
    print("=" * 60)
