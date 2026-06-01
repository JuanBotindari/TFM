#!/usr/bin/env python3
"""
Verifica y crea (si faltan) las tablas vectoriales en Supabase.

Uso:
  python LLM/tools/sql/run_vector_setup.py
  python LLM/tools/sql/run_vector_setup.py --solo-verificar

Variables de entorno (plataforma-oficial/.env.local o .env en la raiz):
  SUPABASE_DB_HOST, SUPABASE_DB_PORT, SUPABASE_DB_USER,
  SUPABASE_DB_PASSWORD, SUPABASE_DB_NAME
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

from dotenv import load_dotenv

SQL_DIR = Path(__file__).resolve().parent
REPO_ROOT = SQL_DIR.parents[2]


def _cargar_env() -> None:
    load_dotenv(REPO_ROOT / ".env")
    load_dotenv(REPO_ROOT / "plataforma-oficial" / ".env.local")


def _conectar():
    try:
        import psycopg2
    except ImportError:
        print("Instala: pip install psycopg2-binary python-dotenv sqlparse")
        sys.exit(1)

    host = os.getenv("SUPABASE_DB_HOST", "aws-0-eu-west-1.pooler.supabase.com")
    port = int(os.getenv("SUPABASE_DB_PORT", "6543"))
    user = os.getenv("SUPABASE_DB_USER")
    password = os.getenv("SUPABASE_DB_PASSWORD") or os.getenv("CONTRA_SUPABASE")
    dbname = os.getenv("SUPABASE_DB_NAME", "postgres")

    if not user or not password:
        print(
            "Faltan SUPABASE_DB_USER y SUPABASE_DB_PASSWORD (o CONTRA_SUPABASE).\n"
            "Configuralos en plataforma-oficial/.env.local"
        )
        sys.exit(1)

    return psycopg2.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        dbname=dbname,
        sslmode="require",
    )


def _split_sql(path: Path) -> list[str]:
    """Divide un .sql en sentencias (respeta bloques $$ de plpgsql)."""
    try:
        import sqlparse
    except ImportError:
        print("Instala sqlparse: pip install sqlparse")
        sys.exit(1)

    raw = path.read_text(encoding="utf-8")
    sin_comentarios = sqlparse.format(raw, strip_comments=True)
    return [s.strip() for s in sqlparse.split(sin_comentarios) if s.strip()]


def _ejecutar_archivo(conn, path: Path, etiqueta: str) -> None:
    print(f"\n{'=' * 60}\n{etiqueta} ({path.name})\n{'=' * 60}")
    for i, stmt in enumerate(_split_sql(path), 1):
        with conn.cursor() as cur:
            cur.execute(stmt)
            if cur.description:
                cols = [d[0] for d in cur.description]
                rows = cur.fetchall()
                print(f"\n-- consulta {i} ({len(rows)} filas) --")
                print(" | ".join(cols))
                for row in rows[:25]:
                    print(" | ".join(str(v) for v in row))
                if len(rows) > 25:
                    print(f"... ({len(rows) - 25} filas mas)")
    conn.commit()


def _contar_faltantes(conn) -> int:
    sql = """
    WITH requeridos AS (
        SELECT unnest(ARRAY[
            'vector',
            'public.database_vector_banco',
            'public.database_vector_estudiocontable'
        ]) AS objeto
    )
    SELECT count(*) FILTER (WHERE NOT (
        CASE
            WHEN objeto = 'vector' THEN
                EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector')
            ELSE to_regclass(objeto) IS NOT NULL
        END
    )) AS faltantes
    FROM requeridos;
    """
    with conn.cursor() as cur:
        cur.execute(sql)
        return int(cur.fetchone()[0])


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--solo-verificar", action="store_true")
    args = parser.parse_args()

    _cargar_env()
    conn = _conectar()

    verify_path = SQL_DIR / "verify_vector_setup.sql"
    setup_path = SQL_DIR / "setup_vector_tables.sql"

    print("[verify] Verificacion inicial...")
    _ejecutar_archivo(conn, verify_path, "Verificacion")

    faltantes = _contar_faltantes(conn)
    print(f"\n[resumen] Objetos criticos faltantes: {faltantes}")

    if not args.solo_verificar and faltantes > 0:
        print(f"\n[setup] Ejecutando creacion idempotente...")
        _ejecutar_archivo(conn, setup_path, "Setup")
        print("\n[verify] Verificacion tras setup...")
        _ejecutar_archivo(conn, verify_path, "Verificacion post-setup")
        faltantes = _contar_faltantes(conn)

    if faltantes == 0:
        print("\n[OK] Extension vector y tablas de ambos clientes listas.")
    elif args.solo_verificar:
        print("\n[warn] Faltan objetos. Ejecuta sin --solo-verificar para crear.")
    else:
        print(f"\n[warn] Aun faltan {faltantes} objeto(s). Revisa permisos o migracion 3072->1536.")

    conn.close()


if __name__ == "__main__":
    main()
