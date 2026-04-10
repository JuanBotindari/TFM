from ..base_llm import BaseModel


class ClienteBanco(BaseModel):
    """Cliente específico: Banco X.
    
    Hereda de BaseRAG e implementa los métodos abstractos
    para personalizar el prompt y la carga de conocimiento.
    """

    def __init__(self, model_name="phi3"):
        super().__init__(nombre_cliente="Banco X", model_name=model_name)
        self.configurar_conocimiento()

    # ── Métodos abstractos obligatorios ──────────────────────────────────────

    def _get_template_prompt(self) -> str:
        return """Eres un Auditor Senior del Banco X. 
        Tu base de conocimiento actual es la siguiente:
        {JSON_CONTEXTO}

        Responde siempre de forma profesional y citando la fuente si está disponible."""

    def _get_metodos_carga(self) -> list:
        return [
            lambda: self._cargar_documentos(path="./docs/banco/legal"),
            lambda: self._procesar_imagenes(path="./docs/banco/organigramas"),
        ]
