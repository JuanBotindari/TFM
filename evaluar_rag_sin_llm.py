import sys
import os
import json
import argparse

# Asegurar que el proyecto esté en el Python path
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from LLM.clientes.banco import ClienteBanco

def principal():
    parser = argparse.ArgumentParser(description="Evaluar Retriever (Embeddings) RAG sin usar el LLM.")
    parser.add_argument("--rebuild", action="store_true", help="Fuerza la reconstrucción de la base de vectores.")
    args = parser.parse_args()

    print("Inicializando Cliente Banco para evaluar Embeddings...")
    cliente = ClienteBanco()
    
    # Forzar la re-creación si cambiamos el modelo de embeddings o se pide por argumento
    if args.rebuild:
        print("Reconstruyendo Vector Store...")
        cliente.configurar_conocimiento(force_rebuild=True)
    
    print("\n" + "="*50)
    print("🤖 MODO DE EVALUACIÓN DE EMBEDDINGS (SIN LLM) 🤖")
    print("="*50)
    print("Escribe tu pregunta para ver qué bloques de texto recupera el RAG.")
    print("Escribe 'salir' o 'exit' para terminar.\n")

    while True:
        try:
            pregunta = input("\nPregunta > ")
            if pregunta.lower() in ["salir", "exit", "quit"]:
                break
                
            if not pregunta.strip():
                continue

            if not cliente.vector_store:
                print("Error: Base de vectores no iniciada.")
                continue

            # Buscar sin LLM
            print("\nBuscando (top 5)...")
            docs_scores = cliente.vector_store.similarity_search_with_score(pregunta, k=5)
            
            for i, (doc, score) in enumerate(docs_scores, 1):
                # La distancia L2 o similar, depende de Chroma. 
                # La distancia L2 con paraphrase-multilingual-MiniLM-L12-v2 ronda entre 10 y 25.
                # Consideramos aceptable un score < 17 para este modelo.
                cercania = "✅ CERCANO" if score < 16.5 else "⚠️ REGULAR" if score < 19.0 else "❌ LEJOS"
                print(f"\n[{i}] Score: {score:.4f} ({cercania}) | Origen: {doc.metadata.get('source', '')}")
                print(f"Texto: {doc.page_content}")
                print("-" * 40)
                
        except (KeyboardInterrupt, EOFError):
            print("\nSaliendo...")
            break

if __name__ == "__main__":
    principal()
