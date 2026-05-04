import os
import time
import logging
import random
import numpy as np
import pandas as pd
from typing import List, Dict, Any
from tabulate import tabulate
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
import google.generativeai as genai
from dotenv import load_dotenv

# ============================================================================
# 1. DECLARACIONES INICIALES, IMPORTS, CONSTANTES Y CONFIGURACIÓN
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

def cosine_similarity(a, b):
    a_norm = a / np.linalg.norm(a, axis=1)[:, np.newaxis]
    b_norm = b / np.linalg.norm(b, axis=1)[:, np.newaxis]
    return np.dot(a_norm, b_norm.T)

def setup_logger():
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
# 2. CLASE: MEDICIÓN ACTUAL (MRR)
# ============================================================================
class MRREvaluator:
    """Evalúa la métrica Mean Reciprocal Rank (MRR)."""
    @staticmethod
    def evaluate(similarity_matrix: np.ndarray, correct_indices: List[int]) -> float:
        mrr_score = 0.0
        for i, correct_idx in enumerate(correct_indices):
            similarities = similarity_matrix[i]
            ranked_indices = np.argsort(similarities)[::-1]
            rank = np.where(ranked_indices == correct_idx)[0][0] + 1
            mrr_score += 1.0 / rank
        return mrr_score / len(correct_indices) if correct_indices else 0.0

# ============================================================================
# 3. CLASE: CHUNK ACCURACY
# ============================================================================
class ChunkAccuracyEvaluator:
    """Evalúa si la respuesta (chunk correcto) está dentro del Top-K de similitudes."""
    def __init__(self, k: int = 3):
        self.k = k

    def evaluate(self, similarity_matrix: np.ndarray, correct_indices: List[int]) -> Dict[str, float]:
        """
        Calcula:
        - Accuracy @ K (Respuestas Correctas en el Top-K / Total Preguntas)
        - Precision @ K
        - Recall @ K
        """
        correct_in_top_k = 0
        total_queries = len(correct_indices)
        precision_sum = 0.0
        recall_sum = 0.0
        
        for i, correct_idx in enumerate(correct_indices):
            similarities = similarity_matrix[i]
            ranked_indices = np.argsort(similarities)[::-1]
            top_k_indices = ranked_indices[:self.k]
            
            is_in_top_k = correct_idx in top_k_indices
            if is_in_top_k:
                correct_in_top_k += 1
                # Como solo hay 1 chunk "correcto" real por query en nuestra prueba sintética:
                precision_sum += 1.0 / self.k 
                recall_sum += 1.0 
                
        return {
            f"Acc_Top_{self.k}": correct_in_top_k / total_queries if total_queries else 0.0,
            f"Precision@{self.k}": precision_sum / total_queries if total_queries else 0.0,
            f"Recall@{self.k}": recall_sum / total_queries if total_queries else 0.0
        }

# ============================================================================
# 4. CLASE: LLM AS A JUDGE
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
# FUNCIONES AUXILIARES Y PIPELINE PRINCIPAL
# ============================================================================
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

def main():
    setup_logger()
    logging.info("="*80)
    logging.info("INICIANDO PIPELINE DE EVALUACIÓN MULTI-MÉTRICA (MRR, Chunk Acc, LLM Judge)")
    logging.info("="*80)
    
    # Pre-cargar Modelos
    logging.info("\n[1/3] Cargando modelos de embedding en memoria...")
    loaded_models = {}
    model_load_status = []
    
    for model_name in MODELS:
        try:
            start_load = time.time()
            embeddings = HuggingFaceEmbeddings(model_name=model_name)
            _ = embeddings.embed_query("test") # Forzar inicialización
            load_time = time.time() - start_load
            loaded_models[model_name] = embeddings
            model_load_status.append([model_name, "OK", f"Cargado en {load_time:.2f}s"])
        except Exception as e:
            model_load_status.append([model_name, "ERROR", str(e)[:50]])

    logging.info("\nEstado de carga de los modelos:")
    logging.info(tabulate(model_load_status, headers=["Model", "Status", "Details"], tablefmt="grid"))
    
    if not loaded_models:
        logging.error("No se pudo cargar ningún modelo.")
        return
        
    full_text = load_documents(PDF_DIR)
    
    # Generamos 10 consultas (limitamos a 10 para no saturar al LLM Judge en cada loop)
    test_queries = generate_test_queries(full_text, num_queries=10)
    
    results = []
    
    # Instanciamos los evaluadores
    mrr_evaluator = MRREvaluator()
    acc_evaluator = ChunkAccuracyEvaluator(k=TOP_K)
    llm_judge = LLMJudgeEvaluator()
    
    logging.info("\n[2/3] Comenzando evaluación de combinaciones...")
    for model_name, embeddings in loaded_models.items():
        logging.info(f"\n--- Evaluando Modelo: {model_name} ---")

        for chunk_size in CHUNK_SIZES:
            for overlap in OVERLAPS:
                if overlap >= chunk_size:
                    continue
                
                logging.info(f" - Config: Size={chunk_size}, Overlap={overlap}...")
                
                # CHUNKING
                start_split = time.time()
                text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=chunk_size, chunk_overlap=overlap, separators=["\n\n", "\n", ".", " ", ""]
                )
                chunks = text_splitter.split_text(full_text)
                split_time = time.time() - start_split
                
                word_stats = get_word_counts(chunks)
                num_chunks = len(chunks)
                
                # EMBEDDINGS
                start_embed = time.time()
                chunk_embeddings = embeddings.embed_documents(chunks)
                query_embeddings = embeddings.embed_documents(test_queries)
                embed_time = time.time() - start_embed
                
                # ENCONTRAR INDICES CORRECTOS (Ground Truth sintético)
                correct_indices = []
                for q in test_queries:
                    idx = -1
                    for j, c in enumerate(chunks):
                        if q in c:
                            idx = j
                            break
                    correct_indices.append(idx)
                    
                # Filtramos queries que misteriosamente no estén en ningún chunk (raro pero posible por limpieza del splitter)
                valid_q_idx = [i for i, idx in enumerate(correct_indices) if idx != -1]
                v_queries = [test_queries[i] for i in valid_q_idx]
                v_correct_indices = [correct_indices[i] for i in valid_q_idx]
                v_query_embeddings = np.array([query_embeddings[i] for i in valid_q_idx])
                
                if len(v_queries) == 0:
                    continue

                # CÁLCULO MATRIZ SIMILITUD
                similarity_matrix = cosine_similarity(v_query_embeddings, chunk_embeddings)
                
                # EXTRAER TOP 1 CHUNKS PARA EL LLM JUDGE
                top_1_chunks = []
                for i in range(len(v_queries)):
                    best_idx = np.argsort(similarity_matrix[i])[::-1][0]
                    top_1_chunks.append(chunks[best_idx])
                
                # ==========================
                # EJECUCIÓN DE EVALUADORES
                # ==========================
                start_eval = time.time()
                
                # 1. MRR
                mrr_score = mrr_evaluator.evaluate(similarity_matrix, v_correct_indices)
                
                # 2. Chunk Accuracy (Top-K, Precision, Recall)
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
                    "Tiempo Chunking (s)": round(split_time, 4),
                    "Tiempo Embedding (s)": round(embed_time, 2),
                    "MRR": round(mrr_score, 4),
                    f"Top_{TOP_K}_Accuracy": round(acc_metrics[f"Acc_Top_{TOP_K}"], 4),
                    f"Precision@{TOP_K}": round(acc_metrics[f"Precision@{TOP_K}"], 4),
                    f"Recall@{TOP_K}": round(acc_metrics[f"Recall@{TOP_K}"], 4),
                    "LLM_Judge_Score": round(llm_score, 4),
                    "Eficiencia (MRR / T.Emb)": round(mrr_score / embed_time if embed_time > 0 else 0, 4)
                })

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
            "Tiempo Embedding (s)": "mean"
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
