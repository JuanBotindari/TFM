import os
import io
import logging
from dotenv import load_dotenv
from supabase import create_client
from pypdf import PdfReader

class SupabaseDocumentLoader:
    """Clase premium para cargar y extraer texto de PDFs directamente desde Supabase Storage
    para un tenant específico (org_id), eliminando la necesidad de tener archivos locales.
    """
    
    def __init__(self):
        # Localizamos la raíz del repositorio para cargar las variables de entorno
        # Sube un nivel desde 'modelo_sentence_similarity' a la raíz
        base_dir = os.path.dirname(os.path.abspath(__file__))
        repo_root = os.path.abspath(os.path.join(base_dir, ".."))
        
        # Cargamos credenciales desde plataforma-oficial/.env.local o desde .env de la raíz
        env_path_local = os.path.join(repo_root, 'plataforma-oficial', '.env.local')
        env_path_root = os.path.join(repo_root, '.env')
        
        if os.path.exists(env_path_local):
            load_dotenv(env_path_local)
        elif os.path.exists(env_path_root):
            load_dotenv(env_path_root)
            
        self.url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        self.key = os.getenv("otra_key_supabase") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
        self.bucket_name = "company-documents"
        
        if not self.url or not self.key:
            raise ValueError(
                "❌ Error: No se encontraron las credenciales de Supabase en .env o .env.local.\n"
                "Asegúrate de configurar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY."
            )
            
        self.supabase = create_client(self.url, self.key)
        logging.info("⚡ Conexión con Supabase establecida correctamente.")

    def load_documents(self, org_id: str = "org-banco") -> str:
        """Descarga todos los PDFs del bucket en el folder asociado al org_id,
        extrae el texto legible de cada página y lo concatena en un solo string.
        """
        logging.info(f"🔍 Buscando documentos en la nube para la organización: '{org_id}'...")
        
        # Intentar obtener los metadatos desde la tabla 'documents' para mayor precisión
        documents_list = []
        try:
            response = self.supabase.table("documents").select("*").eq("org_id", org_id).execute()
            documents_list = response.data
        except Exception as e:
            logging.warning(f"⚠️ No se pudo consultar la tabla 'documents': {e}. Se intentará listar el storage directamente.")

        # Si no pudimos obtener registros de la base de datos, listamos los archivos del storage en el folder 'org_id'
        if not documents_list:
            try:
                # El folder en storage coincide con el org_id
                storage_files = self.supabase.storage.from_(self.bucket_name).list(org_id)
                for f in storage_files:
                    if f.get("name") and f["name"].lower().endswith(".pdf"):
                        documents_list.append({
                            "name": f["name"],
                            "storage_path": f"{org_id}/{f['name']}"
                        })
            except Exception as e:
                logging.error(f"❌ Error al listar archivos en storage para '{org_id}': {e}")
                return ""

        if not documents_list:
            logging.warning(f"⚠️ No se encontraron documentos para la organización '{org_id}' en Supabase.")
            return ""

        logging.info(f"📥 Se encontraron {len(documents_list)} documentos en la nube. Iniciando descarga y extracción de texto...")
        
        full_text_chunks = []
        total_paginas = 0
        
        for doc in documents_list:
            name = doc.get("name")
            storage_path = doc.get("storage_path")
            
            logging.info(f"  📄 Procesando: '{name}'...")
            try:
                # 1. Descargar el archivo PDF como bytes desde storage
                file_bytes = self.supabase.storage.from_(self.bucket_name).download(storage_path)
                
                # 2. Extraer texto usando PdfReader en memoria
                reader = PdfReader(io.BytesIO(file_bytes))
                doc_pages_text = []
                
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text and page_text.strip():
                        doc_pages_text.append(page_text)
                        
                paginas_leidas = len(doc_pages_text)
                total_paginas += paginas_leidas
                
                if doc_pages_text:
                    full_text_chunks.append("\n".join(doc_pages_text))
                    logging.info(f"    ✅ Descargado y leído con éxito ({paginas_leidas} páginas extraídas).")
                else:
                    logging.warning(f"    ⚠️ No se pudo extraer texto de '{name}' (puede estar vacío o escaneado sin OCR).")
                    
            except Exception as e:
                logging.error(f"    ❌ Error al descargar o leer '{name}': {e}")

        combined_text = "\n\n".join(full_text_chunks)
        logging.info(f"\n🎉 Extracción completa. Total páginas procesadas: {total_paginas}. Caracteres totales: {len(combined_text)}")
        return combined_text

if __name__ == "__main__":
    # Configurar logger para ejecución independiente de prueba
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    
    try:
        loader = SupabaseDocumentLoader()
        texto_completo = loader.load_documents("org-banco")
        
        print("\n" + "="*60)
        print("MUESTRA DE TEXTO EXTRAÍDO (Primeros 500 caracteres):")
        print("="*60)
        print(texto_completo[:500])
        print("="*60)
        
    except Exception as e:
        print(f"❌ Error en la ejecución de prueba: {e}")
