from fastapi import FastAPI, Request
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

@app.post("/api/chat")
async def chat_endpoint(request: QueryRequest):
    cliente = obtener_cliente(request.org_id)
    
    # Recolectar la respuesta completa
    respuesta_completa = ""
    for chunk in cliente.responder(request.message):
        respuesta_completa += chunk

    return {"content": respuesta_completa, "sources": []}
