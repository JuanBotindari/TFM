import os
import json
import pandas as pd
from abc import ABC, abstractmethod
from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate, HumanMessagePromptTemplate
from langchain_core.messages import SystemMessage
from dotenv import load_dotenv
from tabulate import tabulate

# Librerías para procesamiento RAG
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from pypdf import PdfReader

load_dotenv()

class BaseModel(ABC):
    """Clase Madre Orquestadora: Motor RAG multimodal con Telemetría Centralizada."""

    ################################################################################
    # 1. INICIALIZACIÓN Y CONSTRUCTOR
    ################################################################################

    def __init__(self, path_cliente):
        self.path_cliente = path_cliente
        self.nombre_cliente = os.path.basename(path_cliente)
        
        self._telemetria("header")

        # Cargar configuraciones
        self.config_tech = self._cargar_json("config/settings.json")
        self.manifiesto = self._cargar_json("config/rag.json")
        
        # Inicializar Componentes de IA
        self.llm = self._inicializar_llm()
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        self.vector_store = None
        self.chat_prompt = None
        self.archivos_reporte = [] # Buffer para la tabla final

    def _inicializar_llm(self):
        model = self.config_tech.get("modelo", "phi3")
        url = self.config_tech.get("url_llm", "http://localhost:11434")
        return OllamaLLM(model=model, base_url=url, temperature=0)

    def _cargar_json(self, relative_path):
        full_path = os.path.join(self.path_cliente, relative_path)
        if os.path.exists(full_path):
            with open(full_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}

    ################################################################################
    # 2. MOTOR RAG MULTIMODAL
    ################################################################################

    def configurar_conocimiento(self, force_rebuild=False):
        db_path = os.path.join(self.path_cliente, "db/vector_store")
        
        self._telemetria("auditoria")
        
        if not os.path.exists(db_path) or force_rebuild:
            self._crear_vector_db(db_path)
        else:
            self._escanear_archivos_para_reporte()

        self.vector_store = Chroma(
            persist_directory=db_path,
            embedding_function=self.embeddings
        )
        
        self._telemetria("tabla_conocimiento")
        self._establecer_prompt_dinamico()
        self._telemetria("listo")

    def _escanear_archivos_para_reporte(self):
        """Prepara el reporte de archivos si la DB ya existe."""
        for modulo in self.manifiesto.get("indice_conocimiento", {}).get("modulos", []):
            dir_path = os.path.join(self.path_cliente, modulo.get("directorio"))
            if os.path.exists(dir_path):
                for f in os.listdir(dir_path):
                    self.archivos_reporte.append([f, modulo['nombre'], modulo.get("tipo", "pdf").upper(), "Existente 💾"])

    def _crear_vector_db(self, db_path):
        all_chunks = []
        self._telemetria("inicio_ingesta")
        
        for modulo in self.manifiesto.get("indice_conocimiento", {}).get("modulos", []):
            dir_path = os.path.join(self.path_cliente, modulo.get("directorio"))
            tipo = modulo.get("tipo", "pdf").lower()
            
            if not os.path.exists(dir_path): continue

            res = []
            if tipo == "pdf": res = self._procesar_pdf(dir_path, modulo)
            elif tipo == "tablas": res = self._procesar_tablas(dir_path, modulo)
            elif tipo == "web": res = self._procesar_web(dir_path, modulo)
            elif tipo == "imagenes": res = self._procesar_imagenes(dir_path, modulo)
            
            all_chunks.extend(res)
        
        if all_chunks:
            texts = [c["text"] for c in all_chunks]
            metadatas = [c["metadata"] for c in all_chunks]
            Chroma.from_texts(texts=texts, metadatas=metadatas, embedding=self.embeddings, persist_directory=db_path)

    ################################################################################
    # 3. MÉTODOS DE PROCESAMIENTO (LIMPIOS)
    ################################################################################

    def _procesar_pdf(self, path, modulo):
        chunks_modulo = []
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
        for file in os.listdir(path):
            if file.endswith(".pdf"):
                full_path = os.path.join(path, file)
                reader = PdfReader(full_path)
                text = "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
                chunks = text_splitter.split_text(text)
                for chunk in chunks:
                    chunks_modulo.append({"text": chunk, "metadata": {"source": file, "modulo": modulo['nombre']}})
                self.archivos_reporte.append([file, modulo['nombre'], "PDF Extractor", "Nuevo ✅"])
        return chunks_modulo

    def _procesar_tablas(self, path, modulo):
        chunks_modulo = []
        for file in os.listdir(path):
            full_path = os.path.join(path, file)
            df = None
            if file.endswith(".csv"): df = pd.read_csv(full_path)
            elif file.endswith((".xlsx", ".xls")): df = pd.read_excel(full_path)
            if df is not None:
                text = f"Tabla: {file}. Módulo: {modulo['nombre']}\n\n" + df.to_markdown(index=False)
                chunks_modulo.append({"text": text, "metadata": {"source": file, "modulo": modulo['nombre']}})
                self.archivos_reporte.append([file, modulo['nombre'], "Pandas Engine", "Nuevo ✅"])
        return chunks_modulo

    def _procesar_web(self, path, modulo):
        chunks_modulo = []
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
        for file in os.listdir(path):
            if file.endswith((".txt", ".html", ".json")):
                with open(os.path.join(path, file), 'r', encoding='utf-8') as f:
                    text = f.read()
                    chunks = text_splitter.split_text(text)
                    for chunk in chunks:
                        chunks_modulo.append({"text": chunk, "metadata": {"source": file, "modulo": modulo['nombre']}})
                    self.archivos_reporte.append([file, modulo['nombre'], "Web Crawler Data", "Nuevo ✅"])
        return chunks_modulo

    def _procesar_imagenes(self, path, modulo):
        chunks_modulo = []
        imgs = [f for f in os.listdir(path) if f.lower().endswith((".png", ".jpg", ".jpeg"))]
        for img in imgs:
            text = f"RECURSO VISUAL: {img} en {modulo['nombre']}."
            chunks_modulo.append({"text": text, "metadata": {"source": img, "modulo": modulo['nombre']}})
            self.archivos_reporte.append([img, modulo['nombre'], "Visual Entry", "Nuevo ✅"])
        return chunks_modulo

    ################################################################################
    # 4. LÓGICA DE PROMPTS Y GENERACIÓN
    ################################################################################

    def _establecer_prompt_dinamico(self):
        m = self.manifiesto
        instr = m.get("instrucciones_sistema", {})
        relaciones = m.get("indice_conocimiento", {}).get("relaciones_tematicas", [])
        
        mapa_relaciones = ""
        if relaciones:
            mapa_relaciones = "\n\nMAPA DE RELACIONES:\n"
            for r in relaciones:
                recursos = ", ".join([f"{rec['archivo']} ({rec['rol']})" for rec in r['recursos_vinculados']])
                mapa_relaciones += f"- TEMA: {r['tema']}. {r['descripcion']} Recursos: {recursos}\n"

        prompt_final = f"""{instr.get('prompt_maestro')}
        ESTILO REQUERIDO: {instr.get('estilo_respuesta')}
        REGLAS DE ORO: {', '.join(instr.get('reglas_oro', []))}
        {mapa_relaciones}
        
        Usa el MAPA DE RELACIONES para sugerir recursos si es necesario."""

        self.chat_prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=prompt_final),
            HumanMessagePromptTemplate.from_template("CONOCIMIENTO:\n{context}\n\nPREGUNTA: {pregunta}")
        ])

    def responder(self, pregunta):
        if not self.vector_store:
            yield "Error: No inicializado."
            return

        docs = self.vector_store.similarity_search(pregunta, k=4)
        self._telemetria("pensando", {"pregunta": pregunta, "docs": docs})
        
        contexto = "\n\n".join([f"[{d.metadata['source']}] {d.page_content}" for d in docs])
        chain = self.chat_prompt | self.llm
        for chunk in chain.stream({"context": contexto, "pregunta": pregunta}):
            yield chunk

    ################################################################################
    # 5. SISTEMA CENTRALIZADO DE TELEMETRÍA (LOGS ESTÉTICOS)
    ################################################################################

    def _telemetria(self, estado, data=None):
        """Gestiona toda la visualización por pantalla de forma centralizada."""
        if estado == "header":
            print(f"\n{'='*60}\n🚀 INICIALIZANDO CLIENTE: {self.nombre_cliente.upper()}\n{'='*60}")
        
        elif estado == "auditoria":
            print(f"🔍 Auditando base de conocimiento para {self.nombre_cliente}...")
        
        elif estado == "inicio_ingesta":
            print("⚡ DB no detectada. Iniciando fase de aprendizaje profundo...")
        
        elif estado == "tabla_conocimiento":
            print("\n📊 REPORTE DE RECURSOS VINCULADOS:")
            headers = ["Archivo", "Carpeta/Módulo", "Motor de Carga", "Estado"]
            print(tabulate(self.archivos_reporte, headers=headers, tablefmt="fancy_grid"))
            print(f"✨ Total de activos aprendidos: {len(self.archivos_reporte)}")
        
        elif estado == "listo":
            print(f"\n🧠 Motor IA preparado. Listo para recibir consultas.\n")
            
        elif estado == "pensando":
            p = data.get("pregunta")
            docs = data.get("docs")
            fuentes = list(set([d.metadata['source'] for d in docs]))
            print(f"\n🤔 PENSANDO...")
            print(f"   > Pregunta: \"{p}\"")
            print(f"   > Extrayendo conocimiento de: {fuentes}")
            print(f"   > Generando respuesta final...\n")
