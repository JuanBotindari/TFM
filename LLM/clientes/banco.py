import os
from ..base_llm import BaseModel

# Path absoluto al directorio RAG del banco
_RAGDOC_BANCO = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "RAG-docs", "client-banco")
)

class ClienteBanco(BaseModel):
    """Cliente específico: Banco.
    
    Ahora toda la configuración (prompt, archivos, rol) 
    se maneja desde RAG-docs/client-banco/config/rag.json
    """

    def __init__(self):
        # Inicializar clase base pasando únicamente la ruta del cliente
        super().__init__(path_cliente=_RAGDOC_BANCO)
        
        # Carga vectores y configura el prompt automáticamente
        self.configurar_conocimiento()
