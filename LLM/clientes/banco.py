import os
from ..base_llm import BaseModel

# Path absoluto al directorio RAG del banco, calculado relativamente a este archivo:
# banco.py  →  clientes/  →  LLM/  →  TFM/  →  RAG-docs/client-santander
_RAGDOC_BANCO = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "RAG-docs", "client-santander")
)


class ClienteBanco(BaseModel):
    """Cliente específico: Banco Santander.

    Hereda de BaseModel e implementa los métodos abstractos
    para personalizar el prompt y la carga de conocimiento.

    RAG-docs esperados en:
        RAG-docs/client-santander/  (busca PDFs de forma recursiva)
    """

    def __init__(self, model_name="phi3"):
        super().__init__(nombre_cliente="Banco Santander", model_name=model_name)
        self.configurar_conocimiento()

    # ── Métodos abstractos obligatorios ──────────────────────────────────────

    def _get_template_prompt(self) -> str:
        return """Eres un Auditor Senior del Banco Santander.
Tu base de conocimiento actual es la siguiente:
{JSON_CONTEXTO}

Responde siempre de forma profesional y citando la fuente si está disponible.
Si no encuentras la información en tu base de conocimiento, indícalo claramente."""

    def _get_metodos_carga(self) -> list:
        return [
            # Búsqueda recursiva de PDFs en todo el directorio RAG del banco
            lambda: self._cargar_documentos(path=_RAGDOC_BANCO),
        ]
