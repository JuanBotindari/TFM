import os

def check_folders():
    # En el contenedor, la raíz del TFM es /app
    paths = {
        "Documentos Silver": "/app/RAG-docs/client-banco",
        "Base de Datos": "/app/database",
        "Scripts LLM": "/app/LLM/ingestion"
    }
    
    print("--- Verificando Acceso a la Arquitectura ---")
    for name, path in paths.items():
        if os.path.exists(path):
            print(f"✅ {name}: Conectado correctamente")
        else:
            print(f"❌ {name}: No se encuentra en {path}")

if __name__ == "__main__":
    check_folders()