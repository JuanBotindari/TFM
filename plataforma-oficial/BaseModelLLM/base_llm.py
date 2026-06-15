import sys
import os
import json
from abc import ABC

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from langchain_core.prompts import ChatPromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder
from langchain_core.messages import SystemMessage, HumanMessage
from dotenv import load_dotenv

# Imports condicionales: se cargan según el backend elegido
try:
    from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
    _GOOGLE_AVAILABLE = True
except ImportError:
    _GOOGLE_AVAILABLE = False

try:
    from langchain_ollama import ChatOllama, OllamaEmbeddings
    _OLLAMA_AVAILABLE = True
except ImportError:
    _OLLAMA_AVAILABLE = False

from .tools import KnowledgeIndexer
from .handlers import DirectoHandler, VectorStoreHandler, TablasHandler, InternetHandler, OtroHandler
from .tools.telemetry import AgenteTracer, imprimir_modelos, imprimir_estado_vectorial

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

def analizar_error_conexion(e: Exception) -> str:
    """Analiza una excepción y devuelve un mensaje en español comprensible."""
    err_msg = str(e)
    err_lower = err_msg.lower()

    # Errores Ollama / LLM local
    if "connection refused" in err_lower or ("connect" in err_lower and "11434" in err_lower):
        return "No se pudo conectar con Ollama en localhost:11434. Asegúrate de que Ollama esté ejecutándose ('ollama serve')."
    elif "model" in err_lower and ("not found" in err_lower or "pull" in err_lower):
        return "El modelo local solicitado no está disponible en Ollama. Ejecuta 'ollama pull <nombre_modelo>' para descargarlo."

    # Errores Google Gemini
    if "api_key_invalid" in err_lower or "api key not valid" in err_lower or "invalid api key" in err_lower or "key is invalid" in err_lower:
        return "La clave API provista es inválida (API_KEY_INVALID). Verifica que la clave en tus archivos .env o .env.local sea correcta."
    elif "resource_exhausted" in err_lower or "quota" in err_lower or "429" in err_lower or "rate limit" in err_lower:
        return "Se ha agotado la cuota de la API de Gemini (RESOURCE_EXHAUSTED). Espera un momento antes de reintentar."
    elif "location" in err_lower or "blocked" in err_lower or "user_location_blocked" in err_lower:
        return "El acceso a la API de Gemini está bloqueado desde tu ubicación geográfica actual (USER_LOCATION_BLOCKED)."
    elif "not_found" in err_lower or "model" in err_lower and "not found" in err_lower or "404" in err_lower:
        return "El modelo especificado no existe o no está disponible. Verifica la configuración en settings.json."
    elif "conn" in err_lower or "timeout" in err_lower or "dns" in err_lower or "socket" in err_lower or "resolved" in err_lower or "unreachable" in err_lower:
        return "No se pudo establecer conexión de red. Comprueba tu conexión a internet o que el servidor local esté activo."
    else:
        return f"Error de conexión: {err_msg}"

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

        # Validación de conexiones y manejo de cuotas
        self.validar_conexion_ia()
        self.validar_conexion_embeddings()

        self.tracer     = AgenteTracer()

        self.vector_store     = None
        self.chat_prompt      = None
        self._handlers        = None
        self.vector_db_stats  = {}

    def _es_local(self) -> bool:
        """Devuelve True si hay una URL de LLM local configurada (modo Ollama)."""
        return bool(self.tech.get("url_llm", "").strip())

    def _inicializar_llm(self):
        if self._es_local():
            if not _OLLAMA_AVAILABLE:
                raise ImportError(
                    "langchain-ollama no está instalado. Ejecuta: pip install langchain-ollama"
                )
            url = self.tech["url_llm"].rstrip("/")
            print(f"🏠 Modo LOCAL activo — Ollama en {url}")
            return ChatOllama(
                model=self.modelo_llm,
                base_url=url,
                temperature=self.tech.get("temperature", 0),
            )
        else:
            if not _GOOGLE_AVAILABLE:
                raise ImportError(
                    "langchain-google-genai no está instalado. Ejecuta: pip install langchain-google-genai"
                )
            print(f"☁️  Modo CLOUD activo — Google Gemini")
            return ChatGoogleGenerativeAI(
                model=self.modelo_llm,
                temperature=self.tech.get("temperature", 0),
                convert_system_message_to_human=True,
            )

    def _inicializar_embeddings(self):
        if self._es_local():
            if not _OLLAMA_AVAILABLE:
                raise ImportError(
                    "langchain-ollama no está instalado. Ejecuta: pip install langchain-ollama"
                )
            url = self.tech["url_llm"].rstrip("/")
            return OllamaEmbeddings(
                model=self.modelo_embeddings,
                base_url=url,
            )
        else:
            if not _GOOGLE_AVAILABLE:
                raise ImportError(
                    "langchain-google-genai no está instalado. Ejecuta: pip install langchain-google-genai"
                )
            dim = self.tech.get("dimensiones_embeddings")
            kwargs: dict = {"model": self.modelo_embeddings}
            if dim:
                kwargs["output_dimensionality"] = int(dim)
            return GoogleGenerativeAIEmbeddings(**kwargs)

    def validar_conexion_ia(self):
        """Valida la conexión con el LLM (local u online)."""
        if self._es_local():
            self._validar_conexion_ollama()
        else:
            self._validar_conexion_gemini()

    def _validar_conexion_ollama(self):
        """Prueba la conexión con Ollama local."""
        print(f"🔄 Probando conexión con Ollama ({self.modelo_llm})...")
        try:
            self.llm.invoke("Responder únicamente 'OK'")
            print(f"✅ Conexión con Ollama ({self.modelo_llm}) exitosa.")
        except Exception as e:
            error_categorizado = analizar_error_conexion(e)
            print(f"❌ Error con Ollama: {error_categorizado}")
            raise RuntimeError(
                f"No se pudo conectar con Ollama. {error_categorizado}"
            ) from e

    def _validar_conexion_gemini(self):
        """Valida la clave API de Gemini con fallback automático de modelos."""
        api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
        if not api_key:
            error_msg = "No se detectó GOOGLE_API_KEY ni GEMINI_API_KEY en las variables de entorno."
            print(f"❌ ERROR: {error_msg}")
            raise ValueError(
                f"{error_msg} Asegúrate de configurar GOOGLE_API_KEY en tu archivo .env o .env.local"
            )

        modelos_a_probar = [self.modelo_llm]
        fallbacks = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-flash-latest"]
        for fb in fallbacks:
            if fb != self.modelo_llm:
                modelos_a_probar.append(fb)

        ultimo_error_msg = None
        ultimo_error = None
        for mod in modelos_a_probar:
            print(f"🔄 Probando conexión con LLM ({mod})...")
            try:
                test_llm = ChatGoogleGenerativeAI(
                    model=mod,
                    temperature=0,
                    convert_system_message_to_human=True,
                )
                test_llm.invoke("Responder únicamente 'OK'")
                if mod != self.modelo_llm:
                    print(f"⚠️  ADVERTENCIA: El modelo configurado '{self.modelo_llm}' falló. "
                          f"Se seleccionó automáticamente el fallback '{mod}'.")
                    self.modelo_llm = mod
                    self.llm = test_llm
                else:
                    print(f"✅ Conexión con LLM ({mod}) exitosa.")
                return
            except Exception as e:
                err_msg = str(e)
                error_categorizado = analizar_error_conexion(e)
                print(f"❌ Error con el modelo {mod}: {error_categorizado}")
                ultimo_error_msg = error_categorizado
                ultimo_error = e
                if "API_KEY_INVALID" in err_msg or "Invalid API Key" in err_msg or "key is invalid" in err_msg.lower():
                    print("❌ ERROR CRÍTICO: La clave API de Gemini provista es inválida.")
                    raise ValueError(error_categorizado) from e

        print(f"❌ ERROR CRÍTICO: Ningún modelo de Gemini pudo establecer conexión. Último error: {ultimo_error_msg}")
        raise RuntimeError(
            f"No se pudo conectar a la API de Gemini. Detalle: {ultimo_error_msg}"
        ) from ultimo_error

    def validar_conexion_embeddings(self):
        """Valida que el servicio de Embeddings funcione correctamente."""
        backend = "Ollama" if self._es_local() else "Google Gemini"
        print(f"🔄 Probando conexión con Embeddings ({self.modelo_embeddings}) [{backend}]...")
        try:
            self.embeddings.embed_query("Test connection")
            print(f"✅ Conexión con Embeddings ({self.modelo_embeddings}) exitosa.")
        except Exception as e:
            error_categorizado = analizar_error_conexion(e)
            print(f"❌ Error con Embeddings ({self.modelo_embeddings}): {error_categorizado}")
            raise RuntimeError(
                f"Fallo al conectar con el servicio de Embeddings [{backend}]: {error_categorizado}"
            ) from e

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
