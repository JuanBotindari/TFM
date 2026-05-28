import os
import time
import logging
import random
import numpy as np
import pandas as pd
import psutil
from typing import List, Dict, Any
from tabulate import tabulate
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from transformers import AutoTokenizer
try:
    from google import genai
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

from dotenv import load_dotenv
from supabase_document_loader import SupabaseDocumentLoader

# ============================================================================
# 1. CONFIGURACIÓN Y CONSTANTES DEL EXPERIMENTO
# ============================================================================

# Carga de variables de entorno y logger
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

def setup_logger():
    """Configura un logger limpio para la terminal."""
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)
    console = logging.StreamHandler()
    console.setLevel(logging.INFO)
    formatter = logging.Formatter('%(message)s')
    console.setFormatter(formatter)
    logger.addHandler(console)

# Suprimir logs ruidosos de librerías externas
for lib in ["urllib3", "httpx", "sentence_transformers", "huggingface_hub", "transformers"]:
    logging.getLogger(lib).setLevel(logging.WARNING)

# --- Constantes Globales ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ORG_ID = "org-banco"

CHUNK_SIZES = [500, 1000, 1500]
OVERLAPS = [50, 150, 300]
MODELS = [
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
    "intfloat/multilingual-e5-small",
    "intfloat/multilingual-e5-base",
    "sentence-transformers/distiluse-base-multilingual-cased-v1",
    "jinaai/jina-embeddings-v3",
    "jinaai/jina-embeddings-v2-base-es",
    "sentence-transformers/LaBSE"
]
TOP_K = 3 

# AGREGAR LA CANTIDAD DE DIMENSIONES UQE TIENE CADA MODELO
# metrica de rendimiento segun dimensiones 
# halucination Rate
#  tokens



# ============================================================================
# 2. FUNCIONES DE UTILIDAD (Procesamiento de Datos)
# ============================================================================

def cosine_similarity(a, b):
    """Calcula la matriz de similitud del coseno entre dos conjuntos de vectores."""
    a_norm = a / np.linalg.norm(a, axis=1)[:, np.newaxis]
    b_norm = b / np.linalg.norm(b, axis=1)[:, np.newaxis]
    return np.dot(a_norm, b_norm.T)

def get_word_counts(chunks: List[str]) -> Dict[str, float]:
    """Estadísticas básicas de palabras por fragmento."""
    words_per_chunk = [len(chunk.split()) for chunk in chunks]
    return {
        "min_words": min(words_per_chunk) if words_per_chunk else 0,
        "max_words": max(words_per_chunk) if words_per_chunk else 0,
        "avg_words": sum(words_per_chunk) / len(words_per_chunk) if words_per_chunk else 0
    }

def generate_test_queries(text: str, num_queries: int = 10) -> List[str]:
    """
    Genera consultas aleatorias extrayendo frases reales del texto (Ground Truth sintético).
    Para saber si un modelo es bueno, necesitas preguntas cuya respuesta conozcas de antemano (esto se llama Ground Truth).
    """

    # Divide el texto: Corta todo el documento cada vez que encuentra un punto (.) para obtener frases.
    sentences = text.split('.')
    # Limpia y filtra: Borra espacios vacíos y descarta frases muy cortas (menos de 30 letras) para que no se cuelen trozos de texto sin sentido.
    sentences = [s.strip() for s in sentences if len(s.strip()) > 30]
    # Elige al azar: Selecciona un grupo pequeño de esas frases (por defecto 10) para usarlas como las preguntas del "examen" para la IA.
    return random.sample(sentences, min(num_queries, len(sentences)))

# ============================================================================
# 3. MARCO DE EVALUACIÓN (Métricas Matemáticas)
# ============================================================================

class MRREvaluator:
    """Calcula el Mean Reciprocal Rank: 1/posición del acierto."""
    @staticmethod
    def evaluate(similarity_matrix: np.ndarray, correct_indices: List[int]) -> float:
        mrr_score = 0.0
        for i, correct_idx in enumerate(correct_indices):
            ranked_indices = np.argsort(similarity_matrix[i])[::-1]
            rank = np.where(ranked_indices == correct_idx)[0][0] + 1
            mrr_score += 1.0 / rank
        return mrr_score / len(correct_indices) if correct_indices else 0.0

class ChunkAccuracyEvaluator:
    """Calcula Precision@1 y Recall@K (Top-K Accuracy)."""
    def __init__(self, k: int = 3):
        self.k = k

    def evaluate(self, similarity_matrix: np.ndarray, correct_indices: List[int]) -> Dict[str, float]:
        correct_top_1 = 0
        correct_in_top_k = 0
        for i, correct_idx in enumerate(correct_indices):
            ranked_indices = np.argsort(similarity_matrix[i])[::-1]
            if ranked_indices[0] == correct_idx:
                correct_top_1 += 1
            if correct_idx in ranked_indices[:self.k]:
                correct_in_top_k += 1
        return {
            "Acc_Top_1": correct_top_1 / len(correct_indices),
            f"Acc_Top_{self.k}": correct_in_top_k / len(correct_indices)
        }

class LLMJudgeEvaluator:
    """Evaluación cualitativa usando un LLM (Gemini) como Juez."""
    def __init__(self):
        try:
            api_key = os.getenv("GOOGLE_API_KEY")
            if api_key and HAS_GENAI:
                self.client = genai.Client(api_key=api_key)
                self.model_id = 'gemini-2.5-flash'
                self.available = True
            else:
                if not HAS_GENAI and api_key:
                    logging.warning("⚠️ La librería 'google-genai' no está instalada. El LLM Judge no estará disponible, pero el resto de métricas funcionarán.")
                self.available = False
        except Exception:
            self.available = False

    def evaluate(self, queries: List[str], top_chunks: List[str]) -> float:
        if not self.available: return 0.0
        correct_count = 0
        for q, c in zip(queries, top_chunks):
            prompt = (f"¿Contiene el 'Contexto' la información de la 'Consulta'? Responde solo SI o NO.\n\n"
                      f"Consulta: {q}\nContexto: {c}")
            try:
                response = self.client.models.generate_content(model=self.model_id, contents=prompt)
                res_text = response.text.upper().replace("Í", "I").strip()
                if "SI" in res_text or "YES" in res_text:
                    correct_count += 1
                time.sleep(0.35)
            except Exception as e:
                logging.warning(f"⚠️ Error al llamar a Gemini ({self.model_id}): {e}")
        return correct_count / len(queries) if queries else 0.0


# ============================================================================
# 4. PIPELINE DE EJECUCIÓN (Main Experiment Loop)
# ============================================================================

def main():
    setup_logger()
    logging.info("="*80)
    logging.info("INICIANDO PIPELINE DE EVALUACIÓN MULTI-MÉTRICA")
    logging.info("="*80)

    # 4.1. Carga de Modelos y Tokenizers en Memoria
    logging.info("\n[1/3] Cargando modelos de embedding...")
    loaded_models = {}
    loaded_tokenizers = {}
    for model_name in MODELS:
        try:
            loaded_models[model_name] = HuggingFaceEmbeddings(model_name=model_name)
            loaded_tokenizers[model_name] = AutoTokenizer.from_pretrained(model_name)
            _ = loaded_models[model_name].embed_query("test") 
        except Exception as e:
            logging.error(f"Error cargando {model_name}: {e}")

    # 4.2. Preparación del Corpus y Ground Truth
    full_text = SupabaseDocumentLoader().load_documents(ORG_ID)

    test_queries = generate_test_queries(full_text, num_queries=10)

    # 4.3. Evaluación de Combinaciones
    results = []
    mrr_eval = MRREvaluator()
    acc_eval = ChunkAccuracyEvaluator(k=TOP_K)
    llm_judge = LLMJudgeEvaluator()

    logging.info("\n[2/3] Ejecutando experimentos...")
    for model_name, embeddings in loaded_models.items():
        logging.info(f"\n--- Modelo: {model_name} ---")
        tokenizer = loaded_tokenizers[model_name]

        for chunk_size in CHUNK_SIZES:
            for overlap in OVERLAPS:
                if overlap >= chunk_size: continue
                logging.info(f" > Config: Size={chunk_size}, Overlap={overlap}")

                # A. CHUNKING
                start_split = time.time()
                splitter = RecursiveCharacterTextSplitter(
                    chunk_size=chunk_size, 
                    chunk_overlap=overlap, 
                    separators=["\n\n", "\n", ".", " ", ""]
                )
                chunks = splitter.split_text(full_text)
                split_time = time.time() - start_split

                # B. MONITOREO (Tokens & RAM)
                try:
                    total_tokens = sum(len(tokenizer.encode(c)) for c in chunks)
                except: total_tokens = 0
                ram_mb = psutil.Process().memory_info().rss / (1024 * 1024)

                # C. GENERACIÓN DE EMBEDDINGS
                start_embed = time.time()
                chunk_embeddings = embeddings.embed_documents(chunks) # se genera el embedding de cada chunk
                query_embeddings = embeddings.embed_documents(test_queries) # se genera el embedding de cada consulta
                embed_time = time.time() - start_embed # se calcula el tiempo que tarda en generar los embeddings

                # D. GROUND TRUTH INDEXING (¿En qué chunk está cada query?)
                v_queries, v_correct_indices, v_query_embeddings = [], [], []
                for i, q in enumerate(test_queries):    # q es una de las consultas generadas aleatoriamente, i es el indice de la consulta
                    for j, c in enumerate(chunks):      # c es un chunk del documento, j es el indice del chunk
                        if q in c:                      # si la consulta esta en el chunk
                            v_queries.append(q)         # guardamos el indice del chunk
                            v_correct_indices.append(j) # guardamos la consulta
                            v_query_embeddings.append(query_embeddings[i]) # guardamos el embedding de la consulta
                            break
                
                if not v_queries: continue                          # si no se encuentra ninguna consulta, se salta
                v_query_embeddings = np.array(v_query_embeddings)   # se convierte en un array de numpy

                # E. RETRIEVAL & MATCHING (Similitud del Coseno)
                similarity_matrix = cosine_similarity(v_query_embeddings, chunk_embeddings)
                top_1_chunks = [chunks[np.argsort(similarity_matrix[i])[::-1][0]] for i in range(len(v_queries))]

                # F. CÁLCULO DE MÉTRICAS
                mrr_score = mrr_eval.evaluate(similarity_matrix, v_correct_indices)
                acc_metrics = acc_eval.evaluate(similarity_matrix, v_correct_indices)
                llm_score = llm_judge.evaluate(v_queries, top_1_chunks)

                results.append({
                    "Modelo": model_name, "Chunk Size": chunk_size, "Overlap": overlap,
                    "Total Tokens": total_tokens, "RAM (MB)": round(ram_mb, 2),
                    "T. Chunking (s)": round(split_time, 4), "T. Embedding (s)": round(embed_time, 2),
                    "MRR": round(mrr_score, 4), "Top_1_Acc": round(acc_metrics["Acc_Top_1"], 4),
                    f"Top_{TOP_K}_Acc": round(acc_metrics[f"Acc_Top_{TOP_K}"], 4),
                    "LLM_Judge": round(llm_score, 4)
                })

    # 4.4. Procesamiento Final de Resultados
    logging.info("\n[3/3] Generando reportes finales...")
    df = pd.DataFrame(results)
    logging.info("\n" + tabulate(df, headers='keys', tablefmt='grid', showindex=False))

    # Guardar en Excel
    excel_file = os.path.join(BASE_DIR, "embedding_comparison_results.xlsx")
    with pd.ExcelWriter(excel_file, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name="Resultados_Completos", index=False)
        # Resumen promedio por modelo
        df.groupby("Modelo").mean(numeric_only=True).to_excel(writer, sheet_name="Resumen_Promedios")

    logging.info(f"\nResultados exportados a: {excel_file}")

# ============================================================================
# 5. PUNTO DE ENTRADA
# ============================================================================

if __name__ == "__main__":
    main()
