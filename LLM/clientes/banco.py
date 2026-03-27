import sys
import os

# Esto añade la carpeta LLM al buscador de Python
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from base_llm import BaseRAG


class ClienteBanco(BaseRAG):  
    # Clase heradada de BaseRAG

    def __init__(self, model_name="phi3"):              # Constructor con modelo configurable (por defecto "phi3")
        super().__init__(model_name=model_name)         # Inicializa el padre (LLM, conexión, etc.)
        self.nombre_cliente = "Banco X"                 # Nombre del cliente para personalización
        self.docs_path = "./RAG-docs/02_Silver/BancoX"  # Ruta de los documentos para el RAG
        self.vector_collection = "banco_x_vectors"      # Nombre de la colección de embeddings


    def get_system_prompt(self, contexto, pregunta):  
        # Método para obtener el prompt del sistema
        return f"""Eres un auditor de cumplimiento para {self.nombre_cliente}. 
        Usa estrictamente este contexto: {contexto}
        Pregunta del usuario: {pregunta}
        Respuesta formal y técnica:"""
