import os
import sys
from dotenv import load_dotenv
from supabase import create_client

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

class SupabaseKnowledgeFetcher:
    """
    Clase de utilidad exclusiva para descargar información de Supabase.
    No realiza cálculos matemáticos (embeddings) ni búsqueda por similitud.
    """
    
    def __init__(self):
        # Localizamos la raíz del repositorio
        repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
        
        # Cargamos credenciales
        load_dotenv(os.path.join(repo_root, 'plataforma-oficial', '.env.local'))
        
        url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
        key = os.getenv("otra_key_supabase") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
        
        if not url or not key:
            raise ValueError("Faltan credenciales de Supabase en plataforma-oficial/.env.local")
            
        self.supabase = create_client(url, key)

    def get_document_chunks(self, org_id: str):
        """
        Descarga todos los fragmentos (chunks) de texto asociados a un cliente (org_id).
        Devuelve una lista de diccionarios con el texto y metadatos.
        """
        try:
            # Hacemos un join con la tabla documents para obtener el nombre del archivo original
            respuesta = self.supabase.table("document_chunks") \
                .select("content, documents(name)") \
                .eq("org_id", org_id) \
                .execute()
            
            datos = respuesta.data
            if not datos:
                return []
            
            fragmentos = []
            for row in datos:
                source_name = row.get("documents", {}).get("name", "Documento_Nube") if row.get("documents") else "Documento_Nube"
                fragmentos.append({
                    "text": row["content"],
                    "metadata": {
                        "source": source_name,
                        "modulo": "Supabase"
                    }
                })
                
            return fragmentos
            
        except Exception as e:
            print(f"Error al descargar chunks de Supabase para {org_id}: {e}")
            return []

# --- Ejemplo de Uso ---
if __name__ == "__main__":
    fetcher = SupabaseKnowledgeFetcher()
    chunks = fetcher.get_document_chunks("org-banco")
    
    print(f"✅ Se descargaron {len(chunks)} fragmentos.")
    if chunks:
        print("\nEjemplo del primer fragmento:")
        print(f"Origen: {chunks[0]['metadata']['source']}")
        print(f"Contenido: {chunks[0]['text'][:150]}...")
