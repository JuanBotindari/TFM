import os
import sys
from supabase import create_client
from dotenv import load_dotenv
from pypdf import PdfReader

# 1. Cargar configuración
load_dotenv('plataforma-oficial/.env.local')
URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
KEY = os.getenv("otra_key_supabase") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase = create_client(URL, KEY)

BUCKET_NAME = "company-documents"
ORG_ID = "org-banco"

def upload_and_process(file_path):
    if not os.path.exists(file_path):
        print(f"Error: El archivo {file_path} no existe.")
        return

    file_name = os.path.basename(file_path)
    print(f"--- Procesando: {file_name} ---")

    # A. Subir al Storage
    with open(file_path, 'rb') as f:
        storage_path = f"{ORG_ID}/{file_name}"
        try:
            supabase.storage.from_(BUCKET_NAME).upload(storage_path, f, {"upsert": "true"})
            print(f"1. Subido a Storage: {storage_path}")
        except Exception as e:
            print(f"Error en Storage: {e}")
            return

    # B. Crear registro en tabla 'documents'
    doc_data = {
        "name": file_name,
        "storage_path": storage_path,
        "file_type": "pdf",
        "size_bytes": os.path.getsize(file_path),
        "org_id": ORG_ID,
        "status": "indexed"
    }
    
    doc_response = supabase.table("documents").upsert(doc_data).execute()
    doc_id = doc_response.data[0]['id']
    print(f"2. Registro creado en tabla 'documents' (ID: {doc_id})")

    # C. Extraer texto y crear Chunks (Trozos)
    print("3. Extrayendo texto y creando fragmentos...")
    reader = PdfReader(file_path)
    chunks = []
    
    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        if text.strip():
            chunks.append({
                "document_id": doc_id,
                "content": f"[Página {i+1}] {text[:2000]}", # Trozo de la página
                "org_id": ORG_ID
            })

    if chunks:
        supabase.table("document_chunks").insert(chunks).execute()
        print(f"4. ¡Éxito! Se han creado {len(chunks)} fragmentos para la IA.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python upload_docs.py <ruta_del_pdf>")
    else:
        upload_and_process(sys.argv[1])
