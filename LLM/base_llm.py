import sys
import os
import json
from abc import ABC

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder
from langchain_core.messages import SystemMessage, HumanMessage
from dotenv import load_dotenv
from tabulate import tabulate

from .tools import KnowledgeIndexer
from .handlers import DirectoHandler, VectorStoreHandler, TablasHandler, InternetHandler, OtroHandler

# Variables de entorno desde la raíz del repositorio
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

# ── Router de intención ───────────────────────────────────────────────────────

_ROUTER_PROMPT = """\
Cuando recibas una pregunta del usuario, lo que tienes que hacer es evaluar lo siguiente estrictamente en este orden: 
1. Requiero buscar en documentos textuales (PDFs, políticas, manuales)? 
2. Requiero buscar en tablas de BBDD?
3. Requiere buscar en internet? 
4. Puedo responder directamente con el LLM? 
5. Estoy capacitado para respondar si no es ninguna de las anteriores?

Dependiendo de tu respuesta, debes llamar al handler correspondiente:
  DIRECTO  → el LLM puede responder sin buscar en ningún sistema externo
  RAG      → la respuesta requiere buscar en documentos textuales (PDFs, políticas, manuales)
  TABLA    → la respuesta requiere datos precisos y estructurados (buscar en tablas de BBDD)
  INTERNET → búsqueda en internet (pendiente de implementación)
  OTRO     → el LLM requiere otro tipo de acción (pendiente de implementación)
"""


################################################################################
# CLASE BASE
################################################################################

class BaseModel(ABC):
    """
    Orquestador principal del agente.

    Responsabilidades:
        1. Cargar configuración del cliente.
        2. Inicializar LLM y embeddings.
        3. Construir la base vectorial (delegado a KnowledgeIndexer).
        4. Evaluar la intención de cada pregunta (router).
        5. Delegar la respuesta al Handler correcto.
    """

    def __init__(self, path_cliente: str):
        self.path_cliente   = path_cliente
        self.nombre_cliente = os.path.basename(path_cliente)

        self._telemetria("header")

        # Configuración del cliente
        self.config_tech = self._cargar_json("config/settings.json")
        self.manifiesto  = self._cargar_json("config/rag.json")
        self.ejemplos_qa = self._cargar_json("config/ejemplos_qa.json")

        # Componentes IA
        self.llm        = self._inicializar_llm()
        self.embeddings = self._inicializar_embeddings()

        # Se completan al llamar a configurar_conocimiento()
        self.vector_store       = None
        self.chat_prompt        = None
        self._handlers          = None
        self.archivos_reporte   = []

    # ── Inicialización ────────────────────────────────────────────────────────

    def _inicializar_llm(self) -> ChatGoogleGenerativeAI:
        model_name = self.config_tech.get("modelo", "gemini-2.0-flash")
        return ChatGoogleGenerativeAI(
            model=model_name,
            temperature=0,
            convert_system_message_to_human=True,
        )

    def _inicializar_embeddings(self) -> GoogleGenerativeAIEmbeddings:
        modelo = self.config_tech.get("modelo_embeddings", "models/gemini-embedding-001")
        return GoogleGenerativeAIEmbeddings(model=modelo)

    def _inicializar_handlers(self):
        """Instancia los handlers una vez que vector_store y chat_prompt están listos."""
        tablas = TablasHandler(
            llm=self.llm,
            chat_prompt=self.chat_prompt,
            path_cliente=self.path_cliente,
            manifiesto=self.manifiesto,
        )
        self._handlers = {
            "DIRECTO":  DirectoHandler(self.llm, self.chat_prompt),
            "RAG":      VectorStoreHandler(self.llm, self.chat_prompt, self.vector_store, tablas_handler=tablas),
            "TABLA":    tablas,
            "INTERNET": InternetHandler(self.llm, self.chat_prompt),
            "OTRO":     OtroHandler(self.llm, self.chat_prompt),
        }

    # ── Utilidades ────────────────────────────────────────────────────────────

    def _cargar_json(self, relative_path: str) -> dict | list:
        full_path = os.path.join(self.path_cliente, relative_path)
        if os.path.exists(full_path):
            with open(full_path, 'r', encoding='utf-8') as f:
                try:
                    return json.load(f)
                except Exception:
                    return []
        return []

    def _telemetria(self, estado: str):
        if estado == "header":
            print(f"\n{'='*60}\n🤖 AGENTE ACTIVO: {self.nombre_cliente.upper()}\n{'='*60}")
        elif estado == "auditoria":
            print("🔍 Auditando mapas de conocimiento...")
        elif estado == "tabla_conocimiento":
            print("\n📊 REPORTE DE CAPACIDADES:")
            print(tabulate(self.archivos_reporte, headers=["Recurso", "Área", "Acceso", "Estado"], tablefmt="fancy_grid"))
        elif estado == "listo":
            print("\n🧠 Motor IA listo.\n")

    def _guardar_log(self, datos: dict):
        log_path = os.path.join(self.path_cliente, "evaluaciones_pendientes.json")
        os.makedirs(os.path.dirname(log_path), exist_ok=True)
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(datos, ensure_ascii=False) + "\n")

    # ── Conocimiento ──────────────────────────────────────────────────────────

    def configurar_conocimiento(self, force_rebuild: bool = False):
        """
        Construye la base vectorial y el prompt del sistema.
        Debe llamarse antes de responder().
        """
        self._telemetria("auditoria")

        indexer = KnowledgeIndexer(
            path_cliente=self.path_cliente,
            nombre_cliente=self.nombre_cliente,
            manifiesto=self.manifiesto,
            embeddings=self.embeddings,
        )
        self.vector_store, self.archivos_reporte = indexer.build(force_rebuild=force_rebuild)

        self._establecer_prompt_dinamico()
        self._inicializar_handlers()

        self._telemetria("tabla_conocimiento")
        self._telemetria("listo")

    def _establecer_prompt_dinamico(self):
        instr = self.manifiesto.get("instrucciones_sistema", {})
        prompt_sys = f"""{instr.get('prompt_maestro')}
                    ESTILO REQUERIDO: {instr.get('estilo_respuesta')}
                    REGLAS DE ORO: {', '.join(instr.get('reglas_oro', []))}

                    PROTOCOLO DE ACCESO A DATOS ESTRUCTURADOS (TABLAS):
                    Si necesitas datos precisos que NO están en el conocimiento RAG, escribe:
                    [USAR_TABLA: término_de_búsqueda]
                    No des respuestas aproximadas ni inventes datos."""

        self.chat_prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=prompt_sys),
            MessagesPlaceholder(variable_name="history", optional=True),
            HumanMessagePromptTemplate.from_template(
                "CONOCIMIENTO RAG DISPONIBLE:\n{context}\n\nPREGUNTA USUARIO: {pregunta}"
            ),
        ])

    # ── Router de intención ───────────────────────────────────────────────────

    def _evaluar_intencion(self, pregunta: str) -> str:
        """
        Micro-llamada al LLM: clasifica la pregunta en DIRECTO | RAG | TABLA | INTERNET | OTRO.
        Fallback: RAG.
        """
        try:
            resultado = self.llm.invoke([
                SystemMessage(content=_ROUTER_PROMPT),
                HumanMessage(content=f"Pregunta: {pregunta}"),
            ])
            intencion = resultado.content.strip().upper()
            for categoria in ("DIRECTO", "TABLA", "INTERNET", "OTRO", "RAG"):
                if categoria in intencion:
                    return categoria
        except Exception as e:
            print(f"⚠️ [Router] Error: {e}. Usando RAG por defecto.")
        return "RAG"

    # ── Punto de entrada principal ────────────────────────────────────────────

    def responder(self, pregunta: str):
        """
        1. Evalúa la intención.
        2. Delega al handler correspondiente.
        3. Guarda el log.

        Yields fragmentos de texto (str) para streaming.
        """
        if not self.vector_store or not self._handlers:
            yield "Error: ejecuta configurar_conocimiento() antes de responder."
            return

        intencion = self._evaluar_intencion(pregunta)
        print(f"\n🧭 [ROUTER] Intención: {intencion}")

        handler         = self._handlers.get(intencion, self._handlers["RAG"])
        respuesta_final = ""

        for chunk in handler.responder(pregunta):
            respuesta_final += chunk
            yield chunk

        self.ultima_interaccion = {
            "pregunta":  pregunta,
            "intencion": intencion,
            "respuesta": respuesta_final,
        }
        self._guardar_log(self.ultima_interaccion)
