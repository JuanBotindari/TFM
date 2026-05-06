import os
import time
import logging
import random
import numpy as np
import pandas as pd
import psutil
from typing import List, Dict, Any
from tabulate import tabulate
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from transformers import AutoTokenizer
import google.generativeai as genai
from dotenv import load_dotenv


# ============================================================================
# 0. DECLARACIONES INICIALES, IMPORTS, CONSTANTES Y CONFIGURACIÓN
# ============================================================================

load_dotenv()
if os.getenv("GOOGLE_API_KEY"):
    genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# Suprimir logs ruidosos de librerías
logging.getLogger("urllib3").setLevel(logging.WARNING)
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("sentence_transformers").setLevel(logging.WARNING)
logging.getLogger("huggingface_hub").setLevel(logging.WARNING)
logging.getLogger("transformers").setLevel(logging.WARNING)

def setup_logger():
    """
    Configura el logger para que los mensajes se impriman limpios en la terminal.
    """
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)
    console = logging.StreamHandler()
    console.setLevel(logging.INFO)
    formatter = logging.Formatter('%(message)s')
    console.setFormatter(formatter)
    logger.addHandler(console)

# ============================================================================
# 1.  CONSTANTES 
# ============================================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PDF_DIR = r"C:\repositorios_github\TFM\TFM\RAG-docs\client-banco\data\pdfs"

# Constantes de Parámetros
CHUNK_SIZES = [500, 1000, 1500]
OVERLAPS = [50, 150, 300]
MODELS = [
    "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
    "intfloat/multilingual-e5-small",
    "sentence-transformers/distiluse-base-multilingual-cased-v1"
]

TOP_K = 3 # Valor de K para Top-K Accuracy, Precision@K y Recall@K



# ============================================================================
# 2. FUnciones de Utilidad
# ============================================================================

def cosine_similarity(a, b):
    """
    Calcula la similitud del coseno entre dos conjuntos de vectores.
    Es la manera en la que se calcula si dos vectores son similares.
    """
    a_norm = a / np.linalg.norm(a, axis=1)[:, np.newaxis]
    b_norm = b / np.linalg.norm(b, axis=1)[:, np.newaxis]
    return np.dot(a_norm, b_norm.T)

def load_documents(directory: str) -> str:
    logging.info(f"\nCargando PDFs desde: {directory}")
    loader = PyPDFDirectoryLoader(directory)
    docs = loader.load()
    full_text = "\n".join([doc.page_content for doc in docs])
    logging.info(f"Se cargaron {len(docs)} páginas.")
    return full_text

def get_word_counts(chunks: List[str]) -> Dict[str, float]:
    words_per_chunk = [len(chunk.split()) for chunk in chunks]
    return {
        "min_words": min(words_per_chunk) if words_per_chunk else 0,
        "max_words": max(words_per_chunk) if words_per_chunk else 0,
        "avg_words": sum(words_per_chunk) / len(words_per_chunk) if words_per_chunk else 0
    }

def generate_test_queries(text: str, num_queries: int = 10) -> List[str]:
    sentences = text.split('.')
    sentences = [s.strip() for s in sentences if len(s.strip()) > 30]
    return random.sample(sentences, min(num_queries, len(sentences)))



# ============================================================================
# 3. CLASES DE EVALUACIÓN
# ============================================================================

# ============================================================================
# 3.1. CLASE: MEDICIÓN ACTUAL (MRR)
# ============================================================================
class MRREvaluator:
    """Evalúa la métrica Mean Reciprocal Rank (MRR)."""
    @staticmethod
    def evaluate(similarity_matrix: np.ndarray, correct_indices: List[int]) -> float:
        mrr_score = 0.0
        
        # Iteramos sobre cada consulta (fila de la matriz de similitud)
        for i, correct_idx in enumerate(correct_indices):
            # 1. Extraemos las puntuaciones de similitud para la consulta actual
            similarities = similarity_matrix[i]
            
            # 2. Obtenemos los índices ordenados de mayor a menor similitud
            # np.argsort devuelve los índices que ordenarían el array de menor a mayor.
            # [[::-1]] invierte ese orden para tener los más similares primero.
            ranked_indices = np.argsort(similarities)[::-1]
            
            # 3. Localizamos la posición (rank) del índice correcto dentro del ranking
            # np.where nos da la posición (basada en 0), por eso sumamos +1.
            rank = np.where(ranked_indices == correct_idx)[0][0] + 1
            
            # 4. Calculamos el Rango Recíproco (1 / posición) y lo acumulamos
            mrr_score += 1.0 / rank
            
        # 5. Retornamos el promedio: la suma de rangos recíprocos entre el total de consultas
        # Se incluye una validación para evitar división por cero si la lista está vacía.
        return mrr_score / len(correct_indices) if correct_indices else 0.0


# ============================================================================
# 3.2. CLASE: CHUNK ACCURACY
# ============================================================================
class ChunkAccuracyEvaluator:
    """Evalúa la precisión posicional absoluta y top-K."""
    def __init__(self, k: int = 3):
        self.k = k

    def evaluate(self, similarity_matrix: np.ndarray, correct_indices: List[int]) -> Dict[str, float]:
        """
        Calcula:
        - Acc_Top_1 (Precision @ 1): El chunk correcto es el primer resultado.
        - Acc_Top_K (Recall @ K): El chunk correcto está entre los K primeros resultados.
        """
        correct_top_1 = 0
        correct_in_top_k = 0
        total_queries = len(correct_indices)

        for i, correct_idx in enumerate(correct_indices):
            similarities = similarity_matrix[i]
            ranked_indices = np.argsort(similarities)[::-1]
            top_k_indices = ranked_indices[:self.k]
            
            if ranked_indices[0] == correct_idx:
                correct_top_1 += 1
                
            if correct_idx in top_k_indices:
                correct_in_top_k += 1
                
        return {
            "Acc_Top_1": correct_top_1 / total_queries if total_queries else 0.0,
            f"Acc_Top_{self.k}": correct_in_top_k / total_queries if total_queries else 0.0
        }


# ============================================================================
# 3.3. CLASE: LLM AS A JUDGE
# ============================================================================
class LLMJudgeEvaluator:
    """Utiliza un LLM grande (Gemini) para evaluar cualitativamente el top chunk recuperado."""
    def __init__(self):
        try:
            # Usamos gemini-1.5-flash por ser rápido y barato para evaluaciones masivas
            self.model = genai.GenerativeModel('gemini-1.5-flash')
            self.available = bool(os.getenv("GOOGLE_API_KEY"))
            if not self.available:
                logging.warning("⚠️ No se encontró GOOGLE_API_KEY. LLM Judge no estará disponible.")
        except Exception as e:
            logging.warning(f"⚠️ No se pudo inicializar LLM Judge: {e}")
            self.available = False

    def evaluate(self, queries: List[str], top_chunks: List[str]) -> float:
        """
        Para cada query y su chunk más similar recuperado, pregunta al LLM si el chunk responde a la query.
        Retorna la métrica de Aprobación del LLM (Respuestas positivas / Total).
        """
        if not self.available:
            return 0.0
            
        correct_count = 0
        total_evals = len(queries)
        
        for q, c in zip(queries, top_chunks):
            prompt = (
                f"Eres un juez experto en recuperación de información. "
                f"Tu tarea es decidir si el siguiente fragmento de texto ('Contexto') "
                f"contiene la información necesaria o exacta de donde fue extraída la oración ('Consulta'). "
                f"Responde ÚNICAMENTE con la palabra 'SI' o 'NO'.\n\n"
                f"Consulta: {q}\n\nContexto: {c}"
            )
            try:
                response = self.model.generate_content(prompt)
                ans = response.text.strip().upper()
                if "SI" in ans or "SÍ" in ans:
                    correct_count += 1
                time.sleep(0.35) # Espera breve para evitar rate limits
            except Exception as e:
                logging.error(f"Error en LLM Judge: {e}")
                
        return correct_count / total_evals if total_evals else 0.0


# ============================================================================
# 4. CONFIGURACIÓN Y EJECUCIÓN DEL PIPELINE
# ============================================================================
def main():
    setup_logger()
    logging.info("="*80)
    logging.info("INICIANDO PIPELINE DE EVALUACIÓN MULTI-MÉTRICA (MRR, Chunk Acc, LLM Judge)")
    logging.info("="*80)
    
    # Pre-cargar Modelos y Tokenizers
    logging.info("\n[1/3] Cargando modelos de embedding y tokenizers en memoria...")
    loaded_models = {}
    loaded_tokenizers = {}
    model_load_status = []
    
    for model_name in MODELS:
        try:
            start_load = time.time()
            embeddings = HuggingFaceEmbeddings(model_name=model_name)
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            _ = embeddings.embed_query("test") # Forzar inicialización
            load_time = time.time() - start_load
            loaded_models[model_name] = embeddings
            loaded_tokenizers[model_name] = tokenizer
            model_load_status.append([model_name, "OK", f"Cargado en {load_time:.2f}s"])
        except Exception as e:
            model_load_status.append([model_name, "ERROR", str(e)[:50]])

    logging.info("\nEstado de carga de los modelos:")
    logging.info(tabulate(model_load_status, headers=["Model", "Status", "Details"], tablefmt="grid"))
    
    if not loaded_models:
        logging.error("No se pudo cargar ningún modelo.")
        return



    # ============================================================================
    # 7. PREPARACIÓN DEL CONJUNTO DE DATOS (GROUND TRUTH)
    # ============================================================================

    full_text = load_documents(PDF_DIR)
    
    # Generamos 10 consultas (limitamos a 10 para no saturar al LLM Judge en cada loop)
    test_queries = generate_test_queries(full_text, num_queries=10)
    


    # ============================================================================
    # 8. GENERACIÓN Y EVALUACIÓN DE EMBEDDINGS
    # ============================================================================
    results = []
    
    # Instanciamos los evaluadores
    mrr_evaluator = MRREvaluator()
    acc_evaluator = ChunkAccuracyEvaluator(k=TOP_K)
    llm_judge = LLMJudgeEvaluator()
    
    logging.info("\n[2/3] Comenzando evaluación de combinaciones...")
    for model_name, embeddings in loaded_models.items():
        logging.info(f"\n--- Evaluando Modelo: {model_name} ---")


        # =====================================================================
        # 8.1 BUCLE PARA CADA CONFIGURACIÓN DE EMBEDDINGS
        # =====================================================================
        for chunk_size in CHUNK_SIZES:
            for overlap in OVERLAPS:
                if overlap >= chunk_size:
                    continue
                
                logging.info(f" - Config: Size={chunk_size}, Overlap={overlap}...")
                
                # =============================================================
                # 8.2 CHUNKING
                # =============================================================
                start_split = time.time()
                text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=chunk_size, chunk_overlap=overlap, separators=["\n\n", "\n", ".", " ", ""]
                )
                chunks = text_splitter.split_text(full_text)
                split_time = time.time() - start_split
                
                word_stats = get_word_counts(chunks)
                num_chunks = len(chunks)
                
                # =============================================================
                # 8.3 CONTANDO TOKENS Y RAM (Pre-Embedding)
                # =============================================================
                tokenizer = loaded_tokenizers[model_name]
                try:
                    tokenized_chunks = tokenizer(chunks, add_special_tokens=False, truncation=False)["input_ids"]
                    total_tokens = sum(len(t) for t in tokenized_chunks)
                except Exception as e:
                    logging.warning(f"Error contando tokens para {model_name}: {e}")
                    total_tokens = 0
                
                process = psutil.Process(os.getpid())
                
                # =============================================================
                # 8.4 GENERANDO EMBEDDINGS
                # =============================================================
                start_embed = time.time()
                chunk_embeddings = embeddings.embed_documents(chunks)
                query_embeddings = embeddings.embed_documents(test_queries)
                embed_time = time.time() - start_embed
                
                ram_proceso_mb = process.memory_info().rss / (1024 * 1024)
                
                
                # =============================================================
                # 8.5 ENCONTRAR INDICES CORRECTOS (Ground Truth sintético)
                # =============================================================
                correct_indices = []
                for q in test_queries:
                    idx = -1
                    for j, c in enumerate(chunks):
                        if q in c:
                            idx = j
                            break
                    correct_indices.append(idx)
                    
                # =============================================================
                # 8.5 ENCONTRAR INDICES CORRECTOS (Ground Truth sintético)
                # =============================================================
                valid_q_idx = [i for i, idx in enumerate(correct_indices) if idx != -1]
                v_queries = [test_queries[i] for i in valid_q_idx]
                v_correct_indices = [correct_indices[i] for i in valid_q_idx]
                v_query_embeddings = np.array([query_embeddings[i] for i in valid_q_idx])
                
                if len(v_queries) == 0:
                    continue

                # =============================================================
                # 8.6 CÁLCULO MATRIZ SIMILITUD
                # =============================================================
                similarity_matrix = cosine_similarity(v_query_embeddings, chunk_embeddings)
                
                # =============================================================
                # 8.7 EXTRAER TOP 1 CHUNKS PARA EL LLM JUDGE
                # =============================================================
                top_1_chunks = []
                for i in range(len(v_queries)):
                    best_idx = np.argsort(similarity_matrix[i])[::-1][0]
                    top_1_chunks.append(chunks[best_idx])
                
                # =============================================================
                # 8.8 EJECUCIÓN DE EVALUADORES
                # =============================================================
                start_eval = time.time()
                
                # 1. MRR
                mrr_score = mrr_evaluator.evaluate(similarity_matrix, v_correct_indices)
                
                # 2. Chunk Accuracy (Top-1, Top-K)
                acc_metrics = acc_evaluator.evaluate(similarity_matrix, v_correct_indices)
                
                # 3. LLM as a Judge
                llm_score = llm_judge.evaluate(v_queries, top_1_chunks)
                
                eval_time = time.time() - start_eval
                
                # Almacenar resultados de este loop
                results.append({
                    "Modelo": model_name,
                    "Chunk Size": chunk_size,
                    "Overlap": overlap,
                    "Nº Chunks": num_chunks,
                    "Total Tokens": total_tokens,
                    "RAM Proceso (MB)": round(ram_proceso_mb, 2),
                    "Tiempo Chunking (s)": round(split_time, 4),
                    "Tiempo Embedding (s)": round(embed_time, 2),
                    "MRR": round(mrr_score, 4),
                    "Top_1_Accuracy": round(acc_metrics["Acc_Top_1"], 4),
                    f"Top_{TOP_K}_Accuracy": round(acc_metrics[f"Acc_Top_{TOP_K}"], 4),
                    "LLM_Judge_Score": round(llm_score, 4),
                    "Eficiencia (MRR / T.Emb)": round(mrr_score / embed_time if embed_time > 0 else 0, 4)
                })


    # ============================================================================
    # 9. GUARDADO DE RESULTADOS
    # ============================================================================
    logging.info("\n[3/3] Guardando Resultados...")
    df_results = pd.DataFrame(results)
    
    # Mostrar tabla resumen en pantalla
    table_str = tabulate(df_results, headers='keys', tablefmt='grid', showindex=False)
    logging.info("\n" + table_str)
    
    # Ordenar para el "Mejor" (Priorizando LLM Judge -> Acc Top 3 -> MRR -> Menor tiempo)
    df_sorted = df_results.sort_values(
        by=["LLM_Judge_Score", f"Top_{TOP_K}_Accuracy", "MRR", "Tiempo Embedding (s)"], 
        ascending=[False, False, False, True]
    )
    best_config = df_sorted.iloc[0]
    
    excel_file = os.path.join(BASE_DIR, "embedding_comparison_results.xlsx")
    with pd.ExcelWriter(excel_file, engine='openpyxl') as writer:
        df_results.to_excel(writer, sheet_name="Resultados_Completos", index=False)
        pd.DataFrame([best_config]).to_excel(writer, sheet_name="Mejor_Modelo", index=False)
        
        # Resumen general por modelo promediando todas las métricas
        df_summary = df_results.groupby("Modelo").agg({
            "MRR": "mean",
            f"Top_{TOP_K}_Accuracy": "mean",
            "LLM_Judge_Score": "mean",
            "Tiempo Embedding (s)": "mean",
            "Total Tokens": "mean",
            "RAM Proceso (MB)": "max"
        }).reset_index()
        df_summary.to_excel(writer, sheet_name="Resumen_Por_Modelo", index=False)

    logging.info(f"Excel guardado exitosamente en: {excel_file}")
    
    logging.info("\n" + "*"*80)
    logging.info("CONCLUSIÓN: EL MEJOR MODELO PARA TU CASO DE USO")
    logging.info("*"*80)
    logging.info(f"Modelo:       {best_config['Modelo']}")
    logging.info(f"Chunk Size:   {best_config['Chunk Size']} | Overlap: {best_config['Overlap']}")
    logging.info(f"Top 3 Acc:    {best_config[f'Top_{TOP_K}_Accuracy']*100:.1f}%")
    logging.info(f"LLM Judge:    {best_config['LLM_Judge_Score']*100:.1f}% de Aprobación")
    logging.info(f"Score MRR:    {best_config['MRR']:.4f}")
    logging.info("*"*80)

if __name__ == "__main__":
    main()
