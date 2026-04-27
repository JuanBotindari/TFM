import json
import torch
from sentence_transformers import SentenceTransformer, util

# ==========================================
# 1. CARGAR EL MODELO Y EL ARCHIVO JSON
# ==========================================
print("Cargando el modelo de Hugging Face...")
# Para el modelo multimodal luego cambiarás esto por el de CLIP
modelo = SentenceTransformer('hiiamsid/sentence_similarity_spanish_es')

print("Cargando datos del JSON...")
with open('modelo_sentence_similarity\\preguntas_banco_x_id_chunk.json', 'r', encoding='utf-8') as archivo:
    datos_json = json.load(archivo)

chunks_base_datos = datos_json["todos_los_chunks"]
preguntas_qa = datos_json["evaluacion"]

# ==========================================
# 2. CONVERTIR LOS CHUNKS A VECTORES (EMBEDDINGS)
# ==========================================
print(f"Convirtiendo {len(chunks_base_datos)} chunks a embeddings...")
# Esto se hace una sola vez. Transforma todo tu "conocimiento" en números.
embeddings_chunks = modelo.encode(chunks_base_datos, convert_to_tensor=True)

# ==========================================
# 3. EVALUAR CADA PREGUNTA (EL SCORING)
# ==========================================
aciertos = 0
total_preguntas = len(preguntas_qa)

print("\n--- INICIANDO EVALUACIÓN (TOP 3) ---")

for item in preguntas_qa:
    pregunta_texto = item["pregunta"]
    indice_esperado = item["indice_chunk_correcto"]
    
    # A. Convertir la pregunta a vector
    embedding_pregunta = modelo.encode(pregunta_texto, convert_to_tensor=True)
    
    # B. Calcular similitud contra TODOS los chunks
    similitudes = util.cos_sim(embedding_pregunta, embeddings_chunks)[0]
    
    # C. Sacar los índices de los 3 con mayor puntaje
    top_3_indices = torch.argsort(similitudes, descending=True)[:3].tolist()
    
    # D. Lógica del Scoring: 1 si acierta, 0 si pifia
    if indice_esperado in top_3_indices:
        aciertos += 1
        estado = "✅ ACIERTO (1)"
    else:
        estado = "❌ FALLO (0)"
        
    print(f"Pregunta: {pregunta_texto}")
    print(f"Esperaba el chunk [{indice_esperado}] | El modelo trajo: {top_3_indices} -> {estado}")

# ==========================================
# 4. RESULTADO FINAL
# ==========================================
score_final = (aciertos / total_preguntas) * 100
print("\n==========================================")
print(f"SCORE FINAL DEL MODELO")
print(f"Preguntas totales evaluadas: {total_preguntas}")
print(f"Aciertos en el Top 3: {aciertos}")
print(f"Precisión (Recall@3): {score_final:.2f}%")
print("==========================================")