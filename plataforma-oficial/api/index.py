from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import sys
import os

# Ajustamos el path para que Python pueda importar desde BaseModelLLM
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from dotenv import load_dotenv
load_dotenv(os.path.join(parent_dir, '.env.local'))

from BaseModelLLM.clientes.banco import ClienteBanco
from BaseModelLLM.base_llm import analizar_error_conexion
# from BaseModelLLM.clientes.estudio import ClienteEstudio

app = FastAPI(docs_url="/api/docs", openapi_url="/api/openapi.json")

# Instancias en memoria para no reconstruir la base en cada petición
clientes_instanciados = {}

def obtener_cliente(org_id: str):
    if org_id not in clientes_instanciados:
        if "banco" in org_id.lower():
            cli = ClienteBanco()
        else:
            cli = ClienteBanco() # fallback genérico para pruebas
        
        # En FastAPI, no necesitamos reconstruir siempre, solo conectamos
        clientes_instanciados[org_id] = cli
    return clientes_instanciados[org_id]

from typing import List, Dict, Any, Optional

class QueryRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, Any]]] = []
    org_id: str = "org-banco"

@app.get("/api/health")
async def health_endpoint():
    """Diagnóstico detallado de conectividad con LLM, Embeddings y Variables de Entorno."""
    reporte = {
        "status": "healthy",
        "app_status": "iniciado",
        "keys": {
            "GOOGLE_API_KEY_presente": bool(os.getenv("GOOGLE_API_KEY")),
            "GEMINI_API_KEY_presente": bool(os.getenv("GEMINI_API_KEY")),
            "SUPABASE_URL_presente": bool(os.getenv("NEXT_PUBLIC_SUPABASE_URL")),
            "SUPABASE_ANON_KEY_presente": bool(os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")),
        },
        "diagnostics": {}
    }
    
    # 1. Comprobar presencia de credenciales de LLM
    if not (os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")):
        reporte["status"] = "unhealthy"
        reporte["diagnostics"]["llm_error"] = "No se detectó GOOGLE_API_KEY ni GEMINI_API_KEY en las variables de entorno (.env.local)."
        return reporte

    # 2. Comprobar conectividad instanciando el cliente y probando llamadas
    try:
        # Esto valida LLM, Embeddings y base de conocimiento (Supabase)
        cliente = obtener_cliente("org-banco")
        
        reporte["diagnostics"]["llm"] = {
            "status": "connected",
            "model_configured": cliente.modelo_llm,
        }
        reporte["diagnostics"]["embeddings"] = {
            "status": "connected",
            "model_configured": cliente.modelo_embeddings,
        }
        
        # Si tiene estadísticas vectoriales
        if hasattr(cliente, "vector_db_stats") and cliente.vector_db_stats:
            reporte["diagnostics"]["database"] = {
                "status": "connected",
                "stats": cliente.vector_db_stats
            }
    except Exception as e:
        reporte["status"] = "unhealthy"
        interpreted_err = analizar_error_conexion(e)
        reporte["diagnostics"]["error"] = {
            "raw": str(e),
            "interpreted": interpreted_err
        }
        
    return reporte

@app.post("/api/chat")
async def chat_endpoint(request: QueryRequest):
    try:
        cliente = obtener_cliente(request.org_id)
    except Exception as e:
        interpreted_err = analizar_error_conexion(e)
        raise HTTPException(
            status_code=503, 
            detail=f"Error al inicializar el cliente IA: {interpreted_err}"
        )
    
    try:
        # Recolectar la respuesta completa
        respuesta_completa = ""
        for chunk in cliente.responder(request.message):
            respuesta_completa += chunk

        return {"content": respuesta_completa, "sources": []}
    except Exception as e:
        interpreted_err = analizar_error_conexion(e)
        raise HTTPException(
            status_code=500, 
            detail=f"Error durante la generación de respuesta: {interpreted_err}"
        )

@app.post("/api/embeddings/recompute")
async def embeddings_recompute(request: Request):
    """Trigger vector index rebuild"""
    try:
        data = await request.json()
        org_id = data.get("org_id", "org-banco")
    except Exception:
        org_id = "org-banco"
        
    try:
        cliente = obtener_cliente(org_id)
        cliente.configurar_conocimiento(force_rebuild=True)
        return {"success": True, "message": "Embeddings recomputed successfully"}
    except Exception as e:
        interpreted_err = analizar_error_conexion(e)
        raise HTTPException(
            status_code=500, 
            detail=f"Error al recomputar embeddings: {interpreted_err}"
        )

