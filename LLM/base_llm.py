import os
from langchain_ollama import OllamaLLM
from dotenv import load_dotenv

load_dotenv()

class BaseRAG:
    """Clase Madre que define la infraestructura base del LLM."""
    
    def __init__(self, model_name="phi3"):
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.model_name = model_name
        self.llm = self._inicializar_llm()
        
    def _inicializar_llm(self):
        """Configura la conexión con el contenedor de Ollama."""
        try:
            return OllamaLLM(
                            model=self.model_name, 
                            base_url=self.base_url, 
                            temperature=0
                            )
        except Exception as e:
            print(f"❌ Error conectando a Ollama: {e}")
            return None

    def generar_respuesta(self, prompt_final):
        """Método genérico para obtener respuesta del modelo."""
        if self.llm:
            return self.llm.invoke(prompt_final)
        return "El modelo no está disponible."


    