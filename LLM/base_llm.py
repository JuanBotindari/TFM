import os
import json
from abc import ABC, abstractmethod
from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate, HumanMessagePromptTemplate
from langchain_core.messages import SystemMessage
from dotenv import load_dotenv

load_dotenv()


class BaseModel(ABC):
    """Clase Madre Orquestadora: Maneja la identidad y el conocimiento estructurado.
    
    Las clases hijas DEBEN implementar:
        - _get_template_prompt() -> str
        - _get_metodos_carga()  -> list
    """

    def __init__(self, nombre_cliente="Genérico", model_name="phi3"):
        self.nombre_cliente = nombre_cliente
        self.model_name = model_name
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.llm = self._inicializar_llm()
        self.manifiesto_json = []
        self.chat_prompt = None

    def _inicializar_llm(self):
        """Inicializa la conexión con Ollama."""
        try:
            return OllamaLLM(model=self.model_name, base_url=self.base_url, temperature=0)
        except Exception as e:
            print(f"❌ Error en Ollama: {e}")
            return None

    ################################################################################
    # ---        MÉTODOS ABSTRACTOS (las hijas DEBEN implementar)              --- #
    ################################################################################
    ''' Decorador @abstractmethod
    Cualquier clase que herede de mí ESTÁ OBLIGADA a escribir su propia versión de este método. 
    Si no lo hace, Python no la dejará funcionar'''


    @abstractmethod
    def _get_template_prompt(self) -> str:
        """Retorna el template del system prompt con {JSON_CONTEXTO} como placeholder.
        
        Ejemplo:
            return '''Eres un experto de {nombre}.
            Tu base de conocimiento es: {JSON_CONTEXTO}
            Responde de forma profesional.'''
        """
        pass

    @abstractmethod
    def _get_metodos_carga(self) -> list:
        """Retorna la lista de métodos (callables) de carga de conocimiento.
        
        Ejemplo:
            return [
                lambda: self._cargar_documentos(path="./docs/legal"),
                lambda: self._procesar_imagenes(path="./docs/organigramas"),
            ]
        """
        pass

    ################################################################################
    # ---                  CONFIGURACIÓN DEL CONOCIMIENTO                      --- #
    ################################################################################

    def configurar_conocimiento(self):
        """Orquesta la carga de conocimiento y configuración del prompt.
        
        1. Obtiene template y métodos de carga de la clase hija.
        2. Ejecuta las ingestas.
        3. Inyecta el JSON resultante en el template.
        4. Configura el prompt en el modelo.
        """
        self.manifiesto_json = []
        template_prompt = self._get_template_prompt()
        lista_metodos = self._get_metodos_carga()

        # Ejecución de cada lógica de carga (Drive, Imágenes, etc.)
        for metodo in lista_metodos:
            try:
                resultado = metodo()
                if resultado:
                    self.manifiesto_json.append(resultado)
            except Exception as e:
                print(f" Error en método de carga: {e}")

        # Transformamos la lista de diccionarios en un JSON legible para el LLM
        conocimiento_str = json.dumps(self.manifiesto_json, indent=2, ensure_ascii=False)

        # Creamos el System Prompt final insertando el JSON en el hueco del template
        prompt_final = template_prompt.replace("{JSON_CONTEXTO}", conocimiento_str)

        # Configuramos el prompt en el modelo
        self._establecer_prompt_en_modelo(prompt_final)

    def _establecer_prompt_en_modelo(self, prompt_listo):
        """Configura el Chat con el System Message definitivo.
        
        Usa SystemMessage directamente (no template) para evitar conflictos
        con las llaves {} del JSON inyectado en el contenido.
        """
        # SystemMessage con contenido ya formateado (sin interpretar {})
        # HumanMessagePromptTemplate para la variable {pregunta} del usuario
        self.chat_prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=prompt_listo),
            HumanMessagePromptTemplate.from_template("{pregunta}")
        ])

        print(f"🧠 Sistema de {self.nombre_cliente} inicializado y cargado en el modelo.")

    ################################################################################
    # ---                      MÉTODO PARA RESPONDER                           --- #
    ################################################################################

    def responder(self, pregunta):
        """Genera respuestas en streaming usando el prompt configurado.
        
        Args:
            pregunta: La consulta del usuario.
            
        Yields:
            Chunks de texto de la respuesta del modelo.
        """
        if self.chat_prompt is None:
            yield " Error: El modelo no tiene conocimiento cargado. Llama a configurar_conocimiento() primero."
            return

        chain = self.chat_prompt | self.llm

        for chunk in chain.stream({"pregunta": pregunta}):
            yield chunk

    ################################################################################
    # --- MÉTODOS DE INGESTA BASE (las hijas deben sobreescribir con lógica)   --- #
    ################################################################################

    def _cargar_documentos(self, path=None):
        """Carga y extrae texto de todos los PDFs encontrados en path (búsqueda recursiva).

        Requiere: pip install pypdf
        """
        if path is None:
            print(f" _cargar_documentos() llamado sin path para '{self.nombre_cliente}'.")
            return None
        if not os.path.exists(path):
            print(f" Path no encontrado: {path}")
            return None

        try:
            from pypdf import PdfReader
        except ImportError:
            print(" pypdf no instalado. Ejecuta: pip install pypdf")
            return None

        documentos = []
        for root, _, files in os.walk(path):
            for archivo in sorted(files):
                if archivo.lower().endswith(".pdf"):
                    ruta = os.path.join(root, archivo)
                    try:
                        reader = PdfReader(ruta)
                        texto = "\n".join(
                            page.extract_text() or "" for page in reader.pages
                        )
                        documentos.append({
                            "archivo": archivo,
                            "tipo": "PDF",
                            "contenido": texto[:5000],  # limitar tokens al LLM
                        })
                        print(f"   PDF cargado: {archivo}")
                    except Exception as e:
                        print(f"   Error leyendo {archivo}: {e}")

        if not documentos:
            print(f" No se encontraron PDFs en: {path}")
            return None

        print(f"📄 {len(documentos)} PDF(s) cargado(s) desde '{path}'.")
        return {
            "fuente": "documentos_pdf",
            "path": path,
            "total": len(documentos),
            "archivos": documentos,
        }

    def _procesar_imagenes(self, path=None):
        """Registra las imágenes disponibles en path como metadatos de contexto."""
        if path is None:
            print(f" _procesar_imagenes() llamado sin path para '{self.nombre_cliente}'.")
            return None
        if not os.path.exists(path):
            print(f" Path de imágenes no encontrado: {path}")
            return None

        extensiones_img = {".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"}
        imagenes = [
            f for f in os.listdir(path)
            if os.path.splitext(f.lower())[1] in extensiones_img
        ]

        if not imagenes:
            print(f" No se encontraron imágenes en: {path}")
            return None

        print(f" {len(imagenes)} imagen(es) registrada(s) desde '{path}'.")
        return {
            "fuente": "imagenes_referencia",
            "path": path,
            "total": len(imagenes),
            "archivos": imagenes,
            "nota": "Imágenes de referencia disponibles (organigramas, diagramas, etc.).",
        }

    def _conectar_fuentes_vivas(self, url=None):
        """Conecta a fuentes en vivo (APIs, DBs). Las hijas deben sobreescribir con lógica real."""
        print(f" _conectar_fuentes_vivas() no implementado para '{self.nombre_cliente}'. Sobreescribe este método.")
        return None
