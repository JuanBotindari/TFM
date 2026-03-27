import sys
import os
# Esto añade la carpeta LLM al buscador de Python
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from base_llm import BaseRAG

class ClienteEstudioContable(BaseRAG):
    # Clase heradada de BaseRAG
    def __init__(self, model_name="phi3"):                  # Constructor con modelo configurable (por defecto "phi3")
        super().__init__(model_name=model_name)             # Inicializa el padre (LLM, conexión, etc.)
        self.nombre_cliente = "Estudio Contable"            # Nombre del cliente para personalización
        self.docs_path = "./RAG-docs/02_Silver/Contable"    # Ruta de los documentos para el RAG
        self.vector_collection = "contable_vectors"         # Nombre de la colección de embeddings
        
    def get_system_prompt(self, contexto, pregunta):        
        # Método para obtener el prompt del sistema
        
        return f"""Eres un experto en normativa fiscal para {self.nombre_cliente}.
        Basado en el contexto: {contexto}
        Analiza la siguiente consulta: {pregunta}
        Respuesta directa y basada en leyes:"""


        
