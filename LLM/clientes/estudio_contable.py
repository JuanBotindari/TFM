from ..base_llm import BaseModel


class ClienteEstudioContable(BaseModel):
    """Cliente específico: Estudio Contable.
    
    Hereda de BaseModel e implementa los métodos abstractos
    para personalizar el prompt y la carga de conocimiento.
    """

    def __init__(self, model_name="phi3"):
        super().__init__(nombre_cliente="Estudio Contable", model_name=model_name)
        self.configurar_conocimiento()

    # ── Métodos abstractos obligatorios ──────────────────────────────────────

    def _get_template_prompt(self) -> str:
        return f"""Eres un experto en normativa fiscal para {self.nombre_cliente}.
        Tu base de conocimiento actual es la siguiente:
        {{JSON_CONTEXTO}}

        Responde de forma directa y basada en leyes. Cita la fuente cuando esté disponible."""

    def _get_metodos_carga(self) -> list:
        return [
            lambda: self._cargar_documentos(path=self.docs_path),
        ]
