import os
import json
from ..base_llm import BaseModel

# Path absoluto al directorio RAG del banco, calculado relativamente a este archivo:
# banco.py  →  clientes/  →  LLM/  →  TFM/  →  RAG-docs/client-banco
_RAGDOC_BANCO = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "RAG-docs", "client-banco")
)


class ClienteBanco(BaseModel):
    """Cliente específico: Banco.

    Hereda de BaseModel e implementa los métodos abstractos
    para personalizar el prompt y la carga de conocimiento.

    RAG-docs esperados en:
        RAG-docs/client-banco/  (busca PDFs de forma recursiva)
    """

    def __init__(self):
        # 1. Leer configuración externa
        config_path = os.path.join(_RAGDOC_BANCO, "config.json")
        try:
            with open(config_path, "r", encoding="utf-8") as f:
                self.config = json.load(f)
        except Exception as e:
            print(f"⚠️ No se pudo leer {config_path}. Usando valores por defecto.")
            self.config = {}

        # 2. Inicializar clase base con los valores de config
        super().__init__(
            nombre_cliente="Banco", 
            model_name=self.config.get("modelo", "phi3"),
            base_url=self.config.get("url_llm", "http://localhost:11434")
        )
        self.configurar_conocimiento()

    # ── Métodos abstractos obligatorios ──────────────────────────────────────

    def _get_template_prompt(self) -> str:
        # Retorna el prompt desde el JSON. Soporta {JSON_CONTEXTO} como variable.
        default_prompt = f"Eres el {self.nombre_cliente}. Contexto: {{JSON_CONTEXTO}}"
        return self.config.get("prompt", default_prompt)

    def _get_metodos_carga(self) -> list:
        return [
            # Búsqueda recursiva de PDFs en todo el directorio RAG del banco
            lambda: self._cargar_documentos(path=_RAGDOC_BANCO),
        ]
