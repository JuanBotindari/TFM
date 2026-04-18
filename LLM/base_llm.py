import os
import json
from abc import ABC, abstractmethod
from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate, HumanMessagePromptTemplate
from langchain_core.messages import SystemMessage
from dotenv import load_dotenv

# Nota: Estas librerías son necesarias para el RAG avanzado. 
# Si no las tienes, ejecuta: pip install langchain-chroma langchain-huggingface pypdf
try:
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    from langchain_community.vectorstores import Chroma
    from langchain_huggingface import HuggingFaceEmbeddings
    from pypdf import PdfReader
except ImportError as e:
    print(f"⚠️ Librerías faltantes: {e}. El sistema funcionará con capacidades reducidas.")

load_dotenv()

class BaseModel(ABC):
    """Clase Madre Orquestadora Pro: Maneja identidad y RAG vectorial."""

    def __init__(self, path_cliente):
        """
        Args:
            path_cliente: Ruta a la carpeta del cliente (ej: 'RAG-docs/client-banco')
        """
        self.path_cliente = path_cliente
        self.nombre_cliente = os.path.basename(path_cliente)
        
        # Cargar configuraciones del cliente
        self.config_tech = self._cargar_json("config/settings.json")
        self.manifiesto = self._cargar_json("config/rag.json")
        
        # Inicializar Componentes
        self.llm = self._inicializar_llm()
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        self.vector_store = None
        self.chat_prompt = None

    def _cargar_json(self, relative_path):
        full_path = os.path.join(self.path_cliente, relative_path)
        if os.path.exists(full_path):
            with open(full_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}

    def _inicializar_llm(self):
        model = self.config_tech.get("modelo", "phi3")
        url = self.config_tech.get("url_llm", "http://localhost:11434")
        return OllamaLLM(model=model, base_url=url, temperature=0)

    def configurar_conocimiento(self, force_rebuild=False):
        """Prepara el vector store y configura el System Prompt."""
        db_path = os.path.join(self.path_cliente, "db/vector_store")
        
        # Si la DB no existe o forzamos reconstrucción
        if not os.path.exists(db_path) or force_rebuild:
            self._crear_vector_db(db_path)
        
        # Cargar base de datos existente
        self.vector_store = Chroma(
            persist_directory=db_path,
            embedding_function=self.embeddings
        )
        
        # Configurar el Role-Play y las instrucciones del LLM
        self._establecer_prompt_dinamico()
        print(f"🧠 Sistema de {self.nombre_cliente} listo para operar.")

    def _crear_vector_db(self, db_path):
        """Lee los documentos de las rutas del manifiesto y crea los vectores."""
        all_chunks = []
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
        
        # Recorrer los módulos definidos en el rag.json
        for modulo in self.manifiesto.get("indice_conocimiento", {}).get("modulos", []):
            dir_path = os.path.join(self.path_cliente, modulo.get("directorio"))
            if os.path.exists(dir_path):
                for file in os.listdir(dir_path):
                    if file.endswith(".pdf"):
                        full_file_path = os.path.join(dir_path, file)
                        reader = PdfReader(full_file_path)
                        text = "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
                        chunks = text_splitter.split_text(text)
                        # Agregar metadatos para trazabilidad
                        for chunk in chunks:
                            all_chunks.append({"text": chunk, "metadata": {"source": file, "modulo": modulo['nombre']}})
        
        if all_chunks:
            texts = [c["text"] for c in all_chunks]
            metadatas = [c["metadata"] for c in all_chunks]
            Chroma.from_texts(
                texts=texts,
                metadatas=metadatas,
                embedding=self.embeddings,
                persist_directory=db_path
            )
            print(f"✅ Base de datos vectorial creada con {len(all_chunks)} fragmentos.")

    def _establecer_prompt_dinamico(self):
        """Construye el System Prompt basado en el manifiesto rag.json."""
        m = self.manifiesto
        instrucciones = m.get("instrucciones_sistema", {})
        cliente = m.get("cliente", {})
        
        prompt_sys = f"""Eres {cliente.get('rol_llm_personalizado')}. 
        Trabajas para {cliente.get('nombre')} en el sector de {cliente.get('sector')}.
        
        OBJETIVO: {instrucciones.get('objetivo_principal')}
        REGLAS: {', '.join(instrucciones.get('reglas_oro', []))}
        ESTILO: {instrucciones.get('estilo_respuesta')}
        
        Responde utilizando ÚNICAMENTE el contexto proporcionado. Si la información no está en el contexto, 
        indícalo de forma profesional sugiriendo consultar el manual correspondiente."""

        self.chat_prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=prompt_sys),
            HumanMessagePromptTemplate.from_template("CONOCIMIENTO RELEVANTE:\n{context}\n\nPREGUNTA DEL USUARIO: {pregunta}")
        ])

    def responder(self, pregunta):
        """Realiza búsqueda semántica y genera respuesta."""
        if not self.vector_store:
            yield "Error: Base de conocimiento no inicializada."
            return

        # 1. Recuperar los 4 fragmentos más relevantes
        docs = self.vector_store.similarity_search(pregunta, k=4)
        contexto = "\n\n".join([f"--- Fuente: {d.metadata['source']} ---\n{d.page_content}" for d in docs])
        
        # 2. Streaming de respuesta
        chain = self.chat_prompt | self.llm
        for chunk in chain.stream({"context": contexto, "pregunta": pregunta}):
            yield chunk
