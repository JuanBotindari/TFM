import os
from ..base_llm import BaseModel

# Path absoluto al directorio RAG del estudio contable
_RAGDOC_ESTUDIO = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "RAG-docs", "client-contable")
)

class ClienteEstudioContable(BaseModel):
    """Cliente específico: Estudio Contable.
    
    Configuración unificada en RAG-docs/client-contable/config/settings.json
    """

    def __init__(self):
        # Inicializar clase base con su ruta correspondiente
        super().__init__(path_cliente=_RAGDOC_ESTUDIO)
        self.configurar_conocimiento()
