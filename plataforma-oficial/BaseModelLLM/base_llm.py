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

from .tools import KnowledgeIndexer
from .handlers import DirectoHandler, VectorStoreHandler, TablasHandler, InternetHandler, OtroHandler
from .tools.telemetry import AgenteTracer, imprimir_modelos, imprimir_estado_vectorial

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

_ROUTER_PROMPT = """\
Cuando recibas una pregunta del usuario, evalúa estrictamente en este orden:
1. ¿Requiero buscar en documentos textuales (PDFs, políticas, manuales)?
2. ¿Requiero buscar en tablas de BBDD?
3. ¿Requiere buscar en internet?
4. ¿Puedo responder directamente con el LLM?
5. ¿Estoy capacitado para responder si no es ninguna de las anteriores?

Responde con UNA sola palabra de esta lista: DIRECTO, RAG, TABLA, INTERNET, OTRO
"""


class BaseModel(ABC):
    """
    Orquestador principal del agente.
    """

    @staticmethod
    def config_plano(config: dict) -> dict:
        """Vista plana de settings.json (unificado o legacy plano + rag.json)."""
        if not isinstance(config, dict):
            config = {}
        cliente = config.get("cliente") or {}
        llm = config.get("LLM") or {}
        emb = config.get("embeddings") or {}
        return {
            "org_id": cliente.get("org_id") or config.get("org_id", ""),
            "modelo": llm.get("modelo") or config.get("modelo", "gemini-2.0-flash"),
            "modelo_embeddings": emb.get("modelo") or config.get(
                "modelo_embeddings", "models/gemini-embedding-2"
            ),
            "dimensiones_embeddings": emb.get("dimensiones")
            or config.get("dimensiones_embeddings", 1536),
            "vector_db_name": emb.get("vector_db_name") or config.get("vector_db_name"),
            "vector_match_fn": emb.get("vector_match_fn") or config.get("vector_match_fn"),
            "url_llm": llm.get("url_llm") or config.get("url_llm", ""),
            "temperature": llm.get("temperature", config.get("temperature", 0)),
            "rol_llm_personalizado": llm.get("rol_llm_personalizado")
            or cliente.get("rol_llm_personalizado")
            or config.get("rol_llm_personalizado", ""),
        }

    def __init__(self, path_cliente: str):
        self.path_cliente   = path_cliente
        self.nombre_cliente = os.path.basename(path_cliente)

        self.config      = self._cargar_config_cliente()
        self.ejemplos_qa = self._cargar_json("config/ejemplos_qa.json")
        self.tech        = self.config_plano(self.config)

        self.modelo_llm        = self.tech["modelo"]
        self.modelo_embeddings = self.tech["modelo_embeddings"]

        print(f"\n{'=' * 60}\n🤖 AGENTE ACTIVO: {self.nombre_cliente.upper()}\n{'=' * 60}")
        imprimir_modelos(self.modelo_llm, self.modelo_embeddings)

        self.llm        = self._inicializar_llm()
        self.embeddings = self._inicializar_embeddings()
        self.tracer     = AgenteTracer()

        self.vector_store     = None
        self.chat_prompt      = None
        self._handlers        = None
        self.vector_db_stats  = {}

    def _inicializar_llm(self) -> ChatGoogleGenerativeAI:
        return ChatGoogleGenerativeAI(
            model=self.modelo_llm,
            temperature=self.tech.get("temperature", 0),
            convert_system_message_to_human=True,
        )

    def _inicializar_embeddings(self) -> GoogleGenerativeAIEmbeddings:
        dim = self.tech.get("dimensiones_embeddings")
        kwargs: dict = {"model": self.modelo_embeddings}
        if dim:
            kwargs["output_dimensionality"] = int(dim)
        return GoogleGenerativeAIEmbeddings(**kwargs)

    def _inicializar_handlers(self):
        tablas = TablasHandler(
            llm=self.llm,
            chat_prompt=self.chat_prompt,
            path_cliente=self.path_cliente,
            config=self.config,
            tracer=self.tracer,
        )
        self._handlers = {
            "DIRECTO":  DirectoHandler(self.llm, self.chat_prompt, tracer=self.tracer),
            "RAG":      VectorStoreHandler(
                self.llm, self.chat_prompt, self.vector_store,
                tablas_handler=tablas, tracer=self.tracer, org_id=self.tech["org_id"],
            ),
            "TABLA":    tablas,
            "INTERNET": InternetHandler(self.llm, self.chat_prompt, tracer=self.tracer),
            "OTRO":     OtroHandler(self.llm, self.chat_prompt, tracer=self.tracer),
        }

    def _cargar_json(self, relative_path: str) -> dict | list:
        full_path = os.path.join(self.path_cliente, relative_path)
        if os.path.exists(full_path):
            with open(full_path, 'r', encoding='utf-8') as f:
                try:
                    return json.load(f)
                except Exception:
                    return []
        return []

    def _cargar_config_cliente(self) -> dict:
        """settings.json unificado; si no hay manifiesto, fusiona rag.json legacy."""
        settings = self._cargar_json("config/settings.json")
        if not isinstance(settings, dict):
            settings = {}
        if settings.get("indice_conocimiento") or settings.get("instrucciones_sistema"):
            return settings
        rag = self._cargar_json("config/rag.json")
        if isinstance(rag, dict) and rag:
            return {**rag, **settings}
        return settings

    def _guardar_log(self, datos: dict):
        log_path = os.path.join(self.path_cliente, "evaluaciones_pendientes.json")
        os.makedirs(os.path.dirname(log_path), exist_ok=True)
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(datos, ensure_ascii=False) + "\n")

    def configurar_conocimiento(self, force_rebuild: bool = False):
        """Construye o carga la base vectorial y prepara handlers."""
        print("\n📚 Inicializando base de conocimiento vectorial...")

        indexer = KnowledgeIndexer(
            path_cliente=self.path_cliente,
            config=self.config,
            embeddings=self.embeddings,
            tech=self.tech,
        )
        self.vector_store, self.vector_db_stats = indexer.build(force_rebuild=force_rebuild)

        imprimir_estado_vectorial(
            self.vector_db_stats,
            self.vector_db_stats.get("vector_db_name", indexer.tabla),
        )

        self._establecer_prompt_dinamico()
        self._inicializar_handlers()
        print("\n✅ Motor IA listo.\n")

    def _establecer_prompt_dinamico(self):
        instr = self.config.get("instrucciones_sistema", {})
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

    def _evaluar_intencion(self, pregunta: str) -> tuple[str, str]:
        """Clasifica la pregunta. Devuelve (categoría, respuesta_cruda_del_router)."""
        try:
            resultado = self.llm.invoke([
                SystemMessage(content=_ROUTER_PROMPT),
                HumanMessage(content=f"Pregunta: {pregunta}"),
            ])
            raw = resultado.content.strip()
            intencion = raw.upper()
            for categoria in ("DIRECTO", "TABLA", "INTERNET", "OTRO", "RAG"):
                if categoria in intencion:
                    return categoria, raw
            return "RAG", raw
        except Exception as e:
            return "RAG", f"(error router: {e})"

    def responder(self, pregunta: str):
        if not self.vector_store or not self._handlers:
            yield "Error: ejecuta configurar_conocimiento() antes de responder."
            return

        self.tracer.reiniciar()
        self.tracer.paso("Pregunta recibida", pregunta)

        self.tracer.paso(
            "Router de intención",
            "El LLM clasifica si hace falta RAG, tablas, internet o respuesta directa.",
        )
        intencion, raw_router = self._evaluar_intencion(pregunta)
        self.tracer.paso(
            f"Intención seleccionada → {intencion}",
            f"Respuesta cruda del router:\n{raw_router}",
        )

        handler = self._handlers.get(intencion, self._handlers["RAG"])
        self.tracer.paso(
            f"Delegando al handler {intencion}",
            type(handler).__name__,
        )

        respuesta_final = ""
        for chunk in handler.responder(pregunta):
            respuesta_final += chunk
            yield chunk

        self.tracer.paso(
            "Respuesta completada",
            f"Caracteres generados: {len(respuesta_final)}",
        )

        self.ultima_interaccion = {
            "pregunta":  pregunta,
            "intencion": intencion,
            "respuesta": respuesta_final,
        }
        self._guardar_log(self.ultima_interaccion)
