import sys
import os
import shutil
import json
import pandas as pd
import re
from abc import ABC, abstractmethod

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder
from langchain_core.messages import SystemMessage, HumanMessage, ToolMessage
from dotenv import load_dotenv
from tabulate import tabulate

# Librerías para procesamiento RAG
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from pypdf import PdfReader

# Cargar variables de entorno desde la raíz del repositorio
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

class BaseModel(ABC):
    """Clase Madre Agéntica: Optimizada para Tool-Calling por Protocolo de Etiquetas."""

    def __init__(self, path_cliente):
        self.path_cliente = path_cliente
        self.nombre_cliente = os.path.basename(path_cliente)
        
        self._telemetria("header")

        # Configs
        self.config_tech = self._cargar_json("config/settings.json")
        self.manifiesto = self._cargar_json("config/rag.json")
        self.ejemplos_qa = self._cargar_json("config/ejemplos_qa.json")
        
        # IA Components
        self.llm = self._inicializar_llm()
        # Cargamos el modelo de embeddings desde la configuración (por defecto el de Google)
        modelo_embeddings = self.config_tech.get("modelo_embeddings", "models/gemini-embedding-001")
        self.embeddings = GoogleGenerativeAIEmbeddings(model=modelo_embeddings)
        self.vector_store = None
        self.chat_prompt = None
        self.archivos_reporte = []

    def _inicializar_llm(self):
        # Usamos el modelo configurado en settings.json (por defecto gemini-2.0-flash)
        model_name = self.config_tech.get("modelo", "gemini-2.0-flash")
        return ChatGoogleGenerativeAI(
            model=model_name, 
            temperature=0,
            convert_system_message_to_human=True # Por compatibilidad con algunos modelos de Google
        )

    ################################################################################
    # 1. Metodos de utilidad y Telemetría
    ################################################################################
    '''
    Esta seccion es solo de metodos que se usan para cargar archivos y mostrar informacion
    '''

    def _cargar_json(self, relative_path):
        full_path = os.path.join(self.path_cliente, relative_path)
        if os.path.exists(full_path):
            with open(full_path, 'r', encoding='utf-8') as f:
                try: return json.load(f)
                except: return []
        return []

    def _telemetria(self, estado, data=None):
        if estado == "header":
            print(f"\n{'='*60}\n🤖 AGENTE ACTIVO: {self.nombre_cliente.upper()}\n{'='*60}")
        elif estado == "auditoria":
            print(f"🔍 Auditando mapas de conocimiento...")
        elif estado == "tabla_conocimiento":
            print("\n📊 REPORTE DE CAPACIDADES:")
            headers = ["Recurso", "Área", "Acceso", "Estado"]
            print(tabulate(self.archivos_reporte, headers=headers, tablefmt="fancy_grid"))
        elif estado == "listo":
            print(f"\n🧠 Motor IA listo. Usando protocolo [USAR_TABLA].\n")
        elif estado == "pensando":
            p = data.get("pregunta")
            docs_scores = data.get("docs_with_scores")
            print(f"\n🤔 ANALIZANDO PREGUNTA: \"{p}\"")
            print(f"   > CERCANÍA CON DOCUMENTOS (Score):")
            for doc, score in docs_scores:
                # El modelo multilingue devuelve L2 entre 10 y ~20+.
                status = "✅ CERCANO" if score < 16.5 else "⚠️ REGULAR" if score < 19.0 else "❌ LEJOS"
                print(f"     - [{doc.metadata['source']}]: {score:.4f} ({status})")
        elif estado == "intencion":
            print(f"\n🧠 [BRAIN RAW OUTPUT]:")
            print(f"{'-'*40}\n{data.get('raw_content')}\n{'-'*40}")
        elif estado == "ejecutando_tool":
            print(f"🛠️  [TOOL EXECUTION] Buscando en tablas: '{data.get('termino')}'...")

    ################################################################################
    # TEMPORAL: FUNCION PARA GUARDAR LAS RESPUESTAS EN UN JSON
    ################################################################################

    def _guardar_log(self, datos):
        log_path = os.path.join(self.path_cliente, "evaluaciones_pendientes.json")
        os.makedirs(os.path.dirname(log_path), exist_ok=True)
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(datos, ensure_ascii=False) + "\n")

    ################################################################################
    # 2. GESTIÓN DE CONOCIMIENTO (INDEXACIÓN)
    ################################################################################
    '''
    Esta seccion es solo de metodos que se usan para gestionar el conocimiento. 
    En esta seccion se define el prompt dinámico que se usa para generar la respuesta.
    '''

    def configurar_conocimiento(self, force_rebuild=False):
        db_path = os.path.join(self.path_cliente, "db/vector_store")
        self._telemetria("auditoria")
        
        # 1. Intentar descargar, fragmentar y generar embeddings dinámicamente desde Supabase Storage (On-the-fly RAG)
        all_chunks = []
        try:
            from supabase import create_client
            import io
            
            # Cargar credenciales
            load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'plataforma-oficial', '.env.local'))
            url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
            key = os.getenv("otra_key_supabase") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
            
            if url and key:
                supabase_client = create_client(url, key)
                org_id = "org-banco" if "banco" in self.nombre_cliente else "org-estudio"
                
                print(f"☁️ [Supabase RAG] Descargando y procesando documentos para {org_id}...")
                
                # Consultar los documentos cargados por la web de esta organización
                res_docs = supabase_client.table("documents").select("*").eq("org_id", org_id).execute()
                docs = res_docs.data
                
                if docs:
                    print(f"📥 Encontrados {len(docs)} documentos en la nube. Extrayendo texto y dividiendo en fragmentos en caliente...")
                    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
                    
                    for doc in docs:
                        name = doc.get("name")
                        storage_path = doc.get("storage_path")
                        print(f"  📄 Ingestando: {name}...")
                        
                        try:
                            # Descargar PDF desde Supabase Storage
                            file_bytes = supabase_client.storage.from_("company-documents").download(storage_path)
                            
                            # Extraer texto usando pypdf
                            reader = PdfReader(io.BytesIO(file_bytes))
                            text = "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
                            
                            if text.strip():
                                # Fragmentar el texto plano
                                chunks = text_splitter.split_text(text)
                                for chunk in chunks:
                                    all_chunks.append({
                                        "text": chunk,
                                        "metadata": {
                                            "source": name,
                                            "modulo": "Supabase Cloud"
                                        }
                                    })
                            else:
                                print(f"  ⚠️ Advertencia: No se extrajo texto legible en {name} (puede ser escaneado o vacío).")
                        except Exception as e:
                            print(f"  ❌ Error al procesar {name} desde Storage: {e}")
            else:
                print("⚠️ No se encontraron credenciales válidas de Supabase en .env.local.")
        except Exception as e:
            print(f"⚠️ Error durante la inicialización de RAG en la nube: {e}")

        # 2. Si se encontraron chunks en Supabase, generar embeddings y construir base de vectores
        if all_chunks:
            print(f"🔮 [Generación de Embeddings] Generando vectores para {len(all_chunks)} fragmentos y construyendo base RAG en memoria...")
            texts = [c["text"] for c in all_chunks]
            metadatas = [c["metadata"] for c in all_chunks]
            
            # Limpiar vector store previo e indexar de nuevo con los embeddings de Gemini
            if os.path.exists(db_path):
                shutil.rmtree(db_path, ignore_errors=True)
                
            self.vector_store = Chroma.from_texts(
                texts=texts,
                metadatas=metadatas,
                embedding=self.embeddings,
                persist_directory=db_path
            )
            
            # Actualizar reporte de capacidades para la telemetría
            self.archivos_reporte = []
            sources_unicos = set(c["metadata"]["source"] for c in all_chunks)
            for src in sources_unicos:
                self.archivos_reporte.append([src, "Supabase Cloud", "RAG Vectorial", "Listo (Embeddings calculados) 🔮"])
        else:
            # Fallback a archivos locales si no hay documentos en la nube o falló Supabase
            print("💾 [Fallback RAG] Usando base de datos y archivos locales...")
            if force_rebuild and os.path.exists(db_path):
                shutil.rmtree(db_path, ignore_errors=True)
                
            if not os.path.exists(db_path) or force_rebuild:
                self._crear_vector_db(db_path)
            else:
                self._escanear_archivos_para_reporte()
                
            self.vector_store = Chroma(persist_directory=db_path, embedding_function=self.embeddings)

        self._establecer_prompt_dinamico()
        self._telemetria("tabla_conocimiento")
        self._telemetria("listo")

    def _escanear_archivos_para_reporte(self):
        for modulo in self.manifiesto.get("indice_conocimiento", {}).get("modulos", []):
            dir_path = os.path.join(self.path_cliente, modulo.get("directorio"))
            if os.path.exists(dir_path):
                for f in os.listdir(dir_path):
                    self.archivos_reporte.append([f, modulo['nombre'], "Indirecto", "Listo 💾"])

    def _crear_vector_db(self, db_path):
        all_chunks = []
        self._telemetria("inicio_ingesta")
        
        for modulo in self.manifiesto.get("indice_conocimiento", {}).get("modulos", []):
            dir_path = os.path.join(self.path_cliente, modulo.get("directorio"))
            tipo = modulo.get("tipo", "pdf").lower()
            if not os.path.exists(dir_path): continue
            
            if tipo == "pdf": all_chunks.extend(self._procesar_pdf(dir_path, modulo))
            elif tipo == "web": all_chunks.extend(self._procesar_web(dir_path, modulo))
            elif tipo == "tablas":
                for f in os.listdir(dir_path):
                    self.archivos_reporte.append([f, modulo['nombre'], "AGENTE", "Listo 🛠️"])

        if all_chunks:
            texts = [c["text"] for c in all_chunks]
            metadatas = [c["metadata"] for c in all_chunks]
            Chroma.from_texts(texts=texts, metadatas=metadatas, embedding=self.embeddings, persist_directory=db_path)

    ################################################################################
    # 3. PROCESADORES (LOGICA DE INGESTA)
    ################################################################################

    def _procesar_pdf(self, path, modulo):
        chunks_modulo = []
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
        for file in os.listdir(path):
            if file.endswith(".pdf"):
                try:
                    full_path = os.path.join(path, file)
                    reader = PdfReader(full_path)
                    text = "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
                    chunks = text_splitter.split_text(text)
                    for chunk in chunks:
                        chunks_modulo.append({"text": chunk, "metadata": {"source": file, "modulo": modulo['nombre']}})
                    self.archivos_reporte.append([file, modulo['nombre'], "RAG PDF", "Nuevo ✅"])
                except: pass
        return chunks_modulo

    def _procesar_web(self, path, modulo):
        chunks_modulo = []
        for file in os.listdir(path):
            if file.endswith((".txt", ".html", ".json")):
                with open(os.path.join(path, file), 'r', encoding='utf-8') as f:
                    text = f.read()
                    chunks_modulo.append({"text": text, "metadata": {"source": file, "modulo": modulo['nombre']}})
                    self.archivos_reporte.append([file, modulo['nombre'], "RAG Web", "Nuevo ✅"])
        return chunks_modulo

    def _procesar_imagenes(self, path, modulo):
        pass

    ################################################################################
    # 4. LÓGICA AGÉNTICA (PROTOCOLOS Y HERRAMIENTAS)
    ################################################################################

    def _establecer_prompt_dinamico(self):
        m = self.manifiesto
        instr = m.get("instrucciones_sistema", {})
        
        prompt_sys = f"""{instr.get('prompt_maestro')}
        ESTILO REQUERIDO: {instr.get('estilo_respuesta')}
        REGLAS DE ORO: {', '.join(instr.get('reglas_oro', []))}
        
        PROTOCOLO DE ACCESO A DATOS ESTRUCTURADOS (TABLAS):
        Si necesitas datos precisos como CUITs, saldos, nombres técnicos o detalles de la base de datos de seguros que NO están en el conocimiento RAG de abajo, debes solicitar la herramienta de tablas escribiendo:
        [USAR_TABLA: término_de_búsqueda]
        
        Ejemplo: Si te piden el CUIT de Leonel y no aparece abajo, escribe "[USAR_TABLA: Leonel]". No des respuestas aproximadas ni inventes datos."""

        self.chat_prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=prompt_sys),
            MessagesPlaceholder(variable_name="history", optional=True),
            HumanMessagePromptTemplate.from_template("CONOCIMIENTO RAG DISPONIBLE:\n{context}\n\nPREGUNTA USUARIO: {pregunta}")
        ])

    def consultar_tablas_y_db(self, consulta):
        """Busca directamente en los archivos físicos de tablas y bases de datos."""
        self._telemetria("ejecutando_tool", {"termino": consulta})
        resultados = []
        for modulo in self.manifiesto.get("indice_conocimiento", {}).get("modulos", []):
            if modulo.get("tipo") == "tablas":
                dir_path = os.path.join(self.path_cliente, modulo.get("directorio"))
                if not os.path.exists(dir_path): continue
                for file in os.listdir(dir_path):
                    f_path = os.path.join(dir_path, file)
                    if file.endswith((".txt", ".md", ".csv")):
                        with open(f_path, 'r', encoding='utf-8', errors='ignore') as f:
                            cuerpo = f.read()
                            if consulta.lower() in cuerpo.lower():
                                # Devolver el bloque donde se encontró la coincidencia
                                pos = cuerpo.lower().find(consulta.lower())
                                start, end = max(0, pos-1000), pos+3000
                                resultados.append(f"ORIGEN: {file}\nDATOS:\n{cuerpo[start:end]}")
        return "\n".join(resultados) if resultados else "No se hallaron coincidencias en las tablas físicas."

    def responder(self, pregunta):
        if not self.vector_store:
            yield "Error de sistema: Base no cargada."
            return

        # 1. Recuperar con Scores (ver que tan cerca está)
        # Traemos 10 para ver la comparativa de cercanía
        docs_scores = self.vector_store.similarity_search_with_score(pregunta, k=10)
        self._telemetria("pensando", {"pregunta": pregunta, "docs_with_scores": docs_scores})
        
        # 2. Nos quedamos con los 5 mejores documentos que provee la búsqueda vectorial
        # (El nuevo modelo multilingüe tiene una escala de distancia L2 diferente, oscila aprox entre 10 y 20)
        docs_validos = [doc for doc, score in docs_scores[:5]]
        
        contexto_rag = ""
        if docs_validos:
            contexto_rag = "\n\n".join([f"[{d.metadata['source']}] {d.page_content}" for d in docs_validos])
        else:
            contexto_rag = "NO SE DETECTÓ CONOCIMIENTO RELEVANTE PARA ESTA PREGUNTA."

        # 3. Generación
        prompt_mensajes = self.chat_prompt.format_messages(context=contexto_rag, pregunta=pregunta)
        respuesta_ia = self.llm.invoke(prompt_mensajes)
        
        self._telemetria("intencion", {"raw_content": respuesta_ia.content})
        
        match = re.search(r"\[USAR_TABLA:\s*(.*?)\]", respuesta_ia.content)

        respuesta_final_texto = "" # Variable para acumular la respuesta

        if match:
            termino = match.group(1).strip()
            datos_tablas = self.consultar_tablas_y_db(termino)
            contexto_enriquecido = contexto_rag + f"\n\nDATOS OBTENIDOS DE LAS TABLAS DE NEGOCIO:\n{datos_tablas}"
            prompt_actualizado = self.chat_prompt.format_messages(context=contexto_enriquecido, pregunta=pregunta)
            for chunk in self.llm.stream(prompt_actualizado):
                respuesta_final_texto += chunk.content
                yield chunk.content
        else:
            respuesta_final_texto += respuesta_ia.content
            yield respuesta_final_texto
        
        # --- GUARDAR RESPUESTA PARA EL SEGUNDO LLM ---
        self.ultima_interaccion = {
            "pregunta": pregunta,
            "respuesta": respuesta_final_texto
        }
        # Guardar en log
        self._guardar_log(self.ultima_interaccion)
