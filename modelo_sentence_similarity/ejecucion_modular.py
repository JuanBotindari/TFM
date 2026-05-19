import os
import logging
import numpy as np
import pandas as pd
from tabulate import tabulate
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from transformers import AutoTokenizer

import sys

# Aseguramos que el directorio actual esté en el PATH para evitar errores de importación
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

try:
    from embedding_test import (
        setup_logger, load_documents, generate_test_queries, 
        cosine_similarity, MRREvaluator, ChunkAccuracyEvaluator, 
        LLMJudgeEvaluator, MODELS, PDF_DIR, TOP_K
    )
except ImportError as e:
    print(f"Error al importar desde embedding_test.py: {e}")
    print("Asegúrate de que embedding_test.py existe en la misma carpeta y no tiene errores de sintaxis.")
    sys.exit(1)

# ============================================================================
# CONFIGURACIÓN DE EJECUCIÓN ESPECÍFICA
# Modifica estos valores para controlar qué se ejecuta y qué se muestra
# ============================================================================

CONFIG = {
    "modelo_seleccionado": MODELS[0],  # Elige: MODELS[0], MODELS[1], MODELS[2]
    "metrica_objetivo": "llm",         # Opciones: "mrr", "accuracy", "llm", "all"
    "imprimir_preparacion": True,      # ¿Mostrar detalles de carga de PDFs y queries?
    "imprimir_matriz": True,           # ¿Mostrar la matriz de similitud (primeras 5x5)?
    "chunk_size": 1000,
    "overlap": 150,                     
    "num_queries": 5                   # Número de consultas para la prueba rápida
}

# ============================================================================

def ejecutar_prueba_especifica():
    setup_logger()
    logger = logging.getLogger()
    
    logger.info("\n" + "="*80)
    logger.info(f"MODO DE EJECUCIÓN ESPECÍFICO: {CONFIG['modelo_seleccionado']}")
    logger.info("="*80)

    # 1. Preparación del Conjunto de Datos
    '''
    PASO 1: Preparación del examen
        Carga los textos de los PDFs.
        Extrae frases aleatorias (las consultas) para usarlas como preguntas del examen.
    '''
    if CONFIG["imprimir_preparacion"]:
        logger.info(f"\n[PASO 1] Preparando datos desde: {PDF_DIR}")
    
    full_text = load_documents(PDF_DIR)
    test_queries = generate_test_queries(full_text, num_queries=CONFIG["num_queries"])
    
    if CONFIG["imprimir_preparacion"]:
        logger.info(f"Texto total cargado: {len(full_text)} caracteres.")
        logger.info(f"Consultas generadas: {len(test_queries)}")
        for i, q in enumerate(test_queries):
            logger.info(f"  Q{i+1}: {q[:80]}...")

    # 2. Carga del Modelo
    logger.info(f"\n[PASO 2] Cargando modelo: {CONFIG['modelo_seleccionado']}...")
    try:
        embeddings_model = HuggingFaceEmbeddings(model_name=CONFIG['modelo_seleccionado'])
        tokenizer = AutoTokenizer.from_pretrained(CONFIG['modelo_seleccionado'])
    except Exception as e:
        logger.error(f"Error cargando el modelo: {e}")
        return

    # 3. Chunking
    '''
    Aquí tienes qué hace cada parte:

RecursiveCharacterTextSplitter: Es una herramienta que corta el texto buscando los puntos más naturales. No corta por cortar, sino que intenta mantener los párrafos y oraciones unidos.
chunk_size: Es el tamaño máximo de cada trozo (ej. 1000 caracteres). Imagina que es el tamaño de la "ficha" que la IA va a leer cada vez.
chunk_overlap: Es el solapamiento. Hace que el final de un trozo y el principio del siguiente compartan un poco de texto (ej. 100 caracteres). Esto es vital para que no se pierda el contexto si una frase importante queda justo en el corte.
separators: Es la jerarquía de corte. Primero intenta cortar por párrafos (\n\n), si el trozo es muy grande busca saltos de línea (\n), luego puntos (.), y finalmente espacios. Así evita romper palabras por la mitad.
split_text: Es la orden de "¡Corta ya!". Toma todo el texto acumulado de los PDFs (full_text) y lo convierte en una lista de trozos pequeños (chunks).
    '''

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CONFIG["chunk_size"], 
        chunk_overlap=CONFIG["overlap"], 
        separators=["\n\n", "\n", ".", " ", ""]
    )
    chunks = text_splitter.split_text(full_text)
    logger.info(f"Documento dividido en {len(chunks)} chunks.")



    # 4. Generación de Embeddings
    logger.info("[PASO 3] Generando embeddings para chunks y queries...")
    '''
    Este paso es la "traducción" definitiva del lenguaje humano al lenguaje de las máquinas.

    ¿Qué está pasando aquí?
    Traducción a Números (Embeddings): El modelo toma cada trozo de texto y lo convierte en una lista larguísima de números decimales (llamada vector).
    embed_documents: Es la orden que le damos al modelo para que procese todos los trozos a la vez.
    Significado Matemático: Lo increíble es que estos números no son aleatorios. El modelo coloca cada frase en un "mapa" matemático de cientos de dimensiones. Si dos frases significan lo mismo (ej: "Hola" y "Buen día"), sus listas de números serán muy parecidas.
    '''

    chunk_embeddings = embeddings_model.embed_documents(chunks)
    query_embeddings = embeddings_model.embed_documents(test_queries)

    # 4. Visualización: Texto Real vs Vector
    logger.info("\n" + "="*80)
    logger.info("DEMOSTRACIÓN DE EMBEDDINGS (TEXTO -> VECTOR)")
    logger.info("="*80)

    logger.info("\n--- EJEMPLOS DE CHUNKS (FRAGMENTOS DE PDF) ---")
    for i in range(min(3, len(chunks))):
        texto_limpio = chunks[i][:120].replace('\n', ' ')
        logger.info(f"\nID {i} - TEXTO REAL: {texto_limpio}...")
        # Mostramos solo los primeros 6 números del vector para legibilidad
        vector_sample = [round(num, 4) for num in chunk_embeddings[i][:6]]
        logger.info(f"ID {i} - VECTOR: {vector_sample} ... [Total: {len(chunk_embeddings[i])} dimensiones]")

    logger.info("\n--- EJEMPLOS DE QUERIES (CONSULTAS GENERADAS) ---")
    for i in range(min(3, len(test_queries))):
        logger.info(f"\nQ {i} - TEXTO REAL: {test_queries[i]}...")
        vector_sample = [round(num, 4) for num in query_embeddings[i][:6]]
        logger.info(f"Q {i} - VECTOR: {vector_sample} ... [Total: {len(query_embeddings[i])} dimensiones]")
    logger.info("\n" + "="*80)


    # 5. Cálculo de Similitud y Matriz
    # Identificamos los índices correctos para la evaluación
    correct_indices = []
    valid_queries = []
    valid_query_emb = []
    
    for i, q in enumerate(test_queries):    # q es una de las consultas generadas aleatoriamente, i es el indice de la consulta
        idx = -1
        for j, c in enumerate(chunks):     # c es un chunk del documento, j es el indice del chunk
            if q in c:                      # si la consulta esta en el chunk
                idx = j                     # guardamos el indice del chunk
                break
        if idx != -1:                       # si se encontro el chunk
            correct_indices.append(idx)     # guardamos el indice del chunk
            valid_queries.append(q)         # guardamos la consulta
            valid_query_emb.append(query_embeddings[i]) # guardamos el embedding de la consulta

    if not correct_indices:                 # si no se encontro ningun chunk
        logger.error("No se encontraron los textos de las consultas en los chunks. Prueba con otros parámetros.")
        return




    similarity_matrix = cosine_similarity(np.array(valid_query_emb), np.array(chunk_embeddings))




    if CONFIG["imprimir_matriz"]:
        logger.info("\n[MATRIZ DE SIMILITUD (Vista Parcial 5x5)]")
        # Mostramos solo un pedazo para no inundar la terminal
        rows = similarity_matrix[:5, :5]
        logger.info(tabulate(rows, tablefmt="fancy_grid", floatfmt=".4f"))

    # 6. Evaluación de Métricas
    logger.info("\n[PASO 4] Calculando métricas seleccionadas...")
    
    m_type = CONFIG["metrica_objetivo"].lower()
    resultados_finales = []

    # MRR
    if m_type in ["mrr", "all"]:
        mrr_val = MRREvaluator.evaluate(similarity_matrix, correct_indices)
        resultados_finales.append(["Mean Reciprocal Rank (MRR)", f"{mrr_val:.4f}"])

    # Accuracy
    if m_type in ["accuracy", "all"]:
        acc_eval = ChunkAccuracyEvaluator(k=TOP_K)
        acc_metrics = acc_eval.evaluate(similarity_matrix, correct_indices)
        resultados_finales.append(["Accuracy Top-1", f"{acc_metrics['Acc_Top_1']*100:.2f}%"])
        resultados_finales.append([f"Accuracy Top-{TOP_K}", f"{acc_metrics[f'Acc_Top_{TOP_K}']*100:.2f}%"])

    # LLM Judge
    if m_type in ["llm", "all"]:
        logger.info("  - Ejecutando LLM Judge (esto puede tardar unos segundos)...")
        judge = LLMJudgeEvaluator()
        top_1_chunks = []
        for i in range(len(valid_queries)):
            best_idx = np.argsort(similarity_matrix[i])[::-1][0]
            top_1_chunks.append(chunks[best_idx])
        
        llm_score = judge.evaluate(valid_queries, top_1_chunks)
        resultados_finales.append(["LLM Judge Score", f"{llm_score*100:.2f}%"])

    # Mostrar Resultados Finales
    logger.info("\n" + "="*40)
    logger.info("RESUMEN DE RESULTADOS")
    logger.info("="*40)
    logger.info(tabulate(resultados_finales, headers=["Métrica", "Valor"], tablefmt="grid"))
    logger.info("="*40)

if __name__ == "__main__":
    ejecutar_prueba_especifica()
