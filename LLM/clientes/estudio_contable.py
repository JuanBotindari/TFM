import os
from ..base_llm import BaseModel

# Path absoluto al directorio RAG del estudio contable, calculado relativamente a este archivo:
# estudio_contable.py  →  clientes/  →  LLM/  →  TFM/  →  RAG-docs/client-contable
_RAGDOC_CONTABLE = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "RAG-docs", "client-contable")
)


class ClienteEstudioContable(BaseModel):
    """Cliente específico: Estudio Contable.

    Hereda de BaseModel e implementa los métodos abstractos
    para personalizar el prompt y la carga de conocimiento.

    RAG-docs esperados en:
        RAG-docs/client-contable/pdfs/      → documentos PDF
        RAG-docs/client-contable/imagenes/  → organigramas e imágenes de referencia
    """

    def __init__(self, model_name="phi3"):
        super().__init__(nombre_cliente="Estudio Contable", model_name=model_name)
        self.configurar_conocimiento()

    # ── Métodos abstractos obligatorios ──────────────────────────────────────

    def _get_template_prompt(self) -> str:
        # Nota: {{JSON_CONTEXTO}} en f-string → renderiza como {JSON_CONTEXTO}
        # para que el .replace() en configurar_conocimiento() lo sustituya.
        return f"""Eres un experto en normativa fiscal y contable para {self.nombre_cliente}.
Tu base de conocimiento actual es la siguiente:
{{JSON_CONTEXTO}}

Responde de forma directa y basada en la documentación disponible.
Cita siempre el documento fuente cuando esté disponible.
Si no encuentras la información, indícalo claramente."""

    def _get_metodos_carga(self) -> list:
        pdfs_path = os.path.join(_RAGDOC_CONTABLE, "pdfs")
        imagenes_path = os.path.join(_RAGDOC_CONTABLE, "imagenes")
        return [
            lambda: self._cargar_documentos(path=pdfs_path),
            lambda: self._procesar_imagenes(path=imagenes_path),
        ]
