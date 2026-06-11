import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'plataforma-oficial'))
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), 'plataforma-oficial', '.env.local'))

print('=== TEST CONEXION OLLAMA ===')
try:
    from langchain_ollama import ChatOllama, OllamaEmbeddings
    print('OK: langchain_ollama importado')

    llm = ChatOllama(model='llama3.2:latest', base_url='http://localhost:11434', temperature=0)
    resp = llm.invoke('Di solo OK')
    print(f'OK: LLM respondio: {resp.content[:80]}')
except Exception as e:
    print(f'ERROR LLM: {type(e).__name__}: {e}')

print()
try:
    from langchain_ollama import OllamaEmbeddings
    emb = OllamaEmbeddings(model='nomic-embed-text', base_url='http://localhost:11434')
    v = emb.embed_query('test')
    print(f'OK: Embeddings funcionan, dims={len(v)}')
except Exception as e:
    print(f'ERROR EMBEDDINGS: {type(e).__name__}: {e}')

print()
print('=== TEST CLIENTE BANCO COMPLETO ===')
try:
    from BaseModelLLM.clientes.banco import ClienteBanco
    cliente = ClienteBanco()
    print('OK: ClienteBanco inicializado correctamente')
except Exception as e:
    import traceback
    print(f'ERROR CLIENTE: {type(e).__name__}: {e}')
    traceback.print_exc()
