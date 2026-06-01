"""
Telemetría del agente: trazas paso a paso y métricas de la base vectorial.
"""

from __future__ import annotations

import random
from typing import Any


class AgenteTracer:
    """Imprime el razonamiento del agente numerado en cada pregunta."""

    def __init__(self):
        self._paso = 0

    def reiniciar(self):
        self._paso = 0
        print(f"\n{'─' * 60}\n🔎 TRAZA DE RAZONAMIENTO\n{'─' * 60}")

    def paso(self, titulo: str, detalle: str | None = None):
        self._paso += 1
        print(f"\n  Paso {self._paso} — {titulo}")
        if detalle:
            for linea in detalle.strip().splitlines():
                print(f"           {linea}")


def metricas_supabase(
    fetcher,
    tabla: str,
    org_id: str,
    modo: str,
    *,
    fragmentos_indexados: int | None = None,
    fuente: str | None = None,
) -> dict[str, Any]:
    """Métricas leyendo la tabla vectorial en Supabase."""
    stats: dict[str, Any] = {
        "modo": modo,
        "supabase_table": tabla,
        "org_id": org_id,
        "total_vectores": 0,
        "fuentes_unicas": [],
        "muestras": [],
        "fragmentos_indexados": fragmentos_indexados,
        "fuente_datos": fuente,
    }

    try:
        stats["total_vectores"] = fetcher.contar_vectores(tabla, org_id)
        filas = fetcher.obtener_muestras(tabla, org_id, limite=80)

        fuentes = sorted({
            (f.get("metadata") or {}).get("source", "?")
            for f in filas
        })
        stats["fuentes_unicas"] = [x for x in fuentes if x != "?"]

        random.shuffle(filas)
        for fila in filas[:3]:
            meta = fila.get("metadata") or {}
            if isinstance(meta, str):
                meta = {}
            texto = (fila.get("content") or "").replace("\n", " ").strip()
            stats["muestras"].append({
                "source": meta.get("source", "?"),
                "modulo": meta.get("modulo", "?"),
                "preview": texto[:140] + ("…" if len(texto) > 140 else ""),
            })
    except Exception as e:
        stats["error"] = str(e)

    return stats


def imprimir_modelos(modelo_llm: str, modelo_embeddings: str):
    print(f"  🧠 LLM:        {modelo_llm}")
    print(f"  📐 Embeddings: {modelo_embeddings}")


def imprimir_estado_vectorial(stats: dict[str, Any], vector_db_name: str):
    modo = stats.get("modo", "?")
    etiquetas = {
        "cargada": "♻️  BASE VECTORIAL — cargada desde Supabase (ya tenía datos)",
        "creada":  "🆕 BASE VECTORIAL — creada en Supabase ahora",
        "vacia":   "⚠️  BASE VECTORIAL — vacía en Supabase (sin documentos)",
    }
    print(f"\n{etiquetas.get(modo, '☁️  BASE VECTORIAL (Supabase)')}")
    print(f"  Tabla Supabase:   {stats.get('supabase_table', vector_db_name)}")
    print(f"  Organización:     {stats.get('org_id', '—')}")
    print(f"  Total vectores:   {stats.get('total_vectores', 0)}")

    if stats.get("fragmentos_indexados") is not None:
        print(f"  Fragmentos indexados: {stats['fragmentos_indexados']}")
    if stats.get("fuente_datos"):
        print(f"  Origen de datos:  {stats['fuente_datos']}")

    fuentes = stats.get("fuentes_unicas") or []
    if fuentes:
        print(f"  Documentos únicos (muestra): {len(fuentes)}")
        for f in fuentes[:5]:
            print(f"    · {f}")
        if len(fuentes) > 5:
            print(f"    · … y {len(fuentes) - 5} más")

    muestras = stats.get("muestras") or []
    if muestras:
        print("  Verificación aleatoria (3 fragmentos):")
        for i, m in enumerate(muestras, 1):
            print(f"    {i}. [{m.get('source')}] ({m.get('modulo')})")
            print(f"       \"{m.get('preview', '')}\"")

    if stats.get("error"):
        print(f"  ⚠️  No se pudieron leer métricas: {stats['error']}")
