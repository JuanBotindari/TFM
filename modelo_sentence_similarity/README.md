# Análisis Técnico: `embedding_test.py`

## Configuración y Utilidades

````md
# Cosine Similarity — Explicación simple

En este ejemplo:

- `p1 = [25, 68.2]`
- `p2 = [82, 95.3]`
- `p3 = [32, 71.3]`

Cada vector representa:

```text
[edad, peso]
````

---

# Idea principal

La similitud del coseno NO compara el tamaño del vector.

Compara la **dirección**.

Dos vectores son similares si apuntan hacia el mismo lugar.

Por eso `p1` y `p3` son parecidos.

---

# Fórmula

\cos(\theta)=\frac{A\cdot B}{|A||B|}

---

# 1. Producto punto (`A · B`)

El producto punto multiplica cada componente y luego suma.

Ejemplo entre `p1` y `p3`:

(25\cdot32)+(68.2\cdot71.3)=5661.66

Esto mide cuánto “apuntan” en la misma dirección.

* Valor grande → muy similares
* Valor pequeño → poco similares

---

# 2. Magnitud (`|A|`)

La magnitud es el tamaño del vector.

Ejemplo para `p1`:

|p1|=\sqrt{25^2+68.2^2}=72.64

Ejemplo para `p3`:

|p3|=\sqrt{32^2+71.3^2}=78.15

---

# 3. Multiplicación de magnitudes

Ahora multiplicamos ambas magnitudes:

72.64\cdot78.15=5676.81

Esto sirve para normalizar el resultado y evitar que el tamaño afecte la comparación.

---

# 4. Resultado final

\frac{5661.66}{5676.81}=0.997

El resultado es casi `1`.

Eso significa que `p1` y `p3` son MUY similares porque apuntan casi en la misma dirección.

```
```



### 0. Importaciones y Configuración Inicial
Se puede ignorar, solo configura el loggin y las constantes globales, no es importante para entender el código.

### 1. Parámetros Globales (Constantes)
* **`CHUNK_SIZES` y `OVERLAPS`**: Listas de tamaños y solapamientos que se probarán de forma combinada (Ej: Chunk 500 con overlap 50, luego 500 con 150, etc.).
* **`MODELS`**: Los modelos open-source de HuggingFace que se van a evaluar.
* **`TOP_K = 3`**: Indica que las métricas de evaluación revisarán, como máximo, los primeros 3 resultados devueltos por el motor de búsqueda semántica.

### 2. Funciones de Utilidad
* **`cosine_similarity(a, b)`**: Esta función calcula la **Similitud del Coseno** entre dos conjuntos de vectores (la pregunta y los fragmentos de texto). Es la manera en la que se calcula si dos vectores son similares.
  * Normaliza la longitud de los vectores y luego realiza el producto punto. Matemáticamente, esto representa qué tan similares son semánticamente (1 muy similar, 0 nada similar).
* **`load_documents(directory)`**: Usa LangChain para leer todos los PDFs y concatena todo su texto.
* **`get_word_counts(chunks)`**: Calcula estadísticas simples de número mínimo, máximo y promedio de palabras de los fragmentos.
* **`generate_test_queries(text, num_queries=10)`**: Genera el **"Ground Truth"** separando el PDF por puntos, filtrando oraciones cortas y eligiendo 10 al azar para probar.

---

## 3. Clases de Evaluación

### 3.1. Clase: Medición Actual (MRR)
Evalúa el **Mean Reciprocal Rank (MRR)**.
* ¿Qué hace?: Toma los resultados ordenados por similitud y busca en qué posición quedó el fragmento correcto.
* Si el correcto está en posición 1, suma `1/1` (1.0). Si está en posición 2, suma `1/2` (0.5), en la 3 suma `1/3` (0.33), etc. Promedia este valor entre todas las consultas. 
* **En resumen:** Tu código mide la eficacia del "Top 1". Si tu MRR es cercano a 1, tu modelo es un francotirador; si es cercano a 0, el usuario tiene que hacer mucho scroll para encontrar la verdad.

### 3.2. Clase: Chunk Accuracy
Evalúa la precisión posicional absoluta y top-K.
* **`Acc_Top_1`**: Verifica si `ranked_indices[0] == correct_idx` (si el resultado número 1 es exactamente el chunk de donde salió la frase). Esto equivale a la Precisión máxima (1.0) para esa pregunta.
* **`Acc_Top_K`**: Verifica si el chunk correcto aparece en los `k` (ej. 3) primeros lugares. Esto representa la métrica de **Recall**.

### 3.3. Clase: LLM as a Judge
Usa Inteligencia Artificial Generativa (`gemini-1.5-flash`) para evaluar semánticamente.
* ¿Por qué?: A veces un modelo recupera un fragmento de texto diferente al original, pero que **sí contiene la respuesta** o información válida. Las métricas matemáticas lo darían como error.
* El LLM lee la consulta y el fragmento principal recuperado, y responde estrictamente con "SÍ" o "NO" dependiendo de si el texto responde a la pregunta.

---

# Flujo de ejecución

## 4. Configuración y Ejecución del Pipeline
Función orquestadora (`main()`). Inicia el pipeline, carga los modelos de HuggingFace en memoria e inicializa sus respectivos Tokenizers.

## 7. Preparación del Conjunto de Datos (Ground Truth)
Lee todo el texto de los PDFs con `load_documents` y manda a generar las 10 consultas de prueba.

## 8. Generación y Evaluación de Embeddings
Aquí ocurre el bucle principal de evaluaciones:
* **8.1 Bucle para cada configuración**: Itera combinando cada modelo, tamaño de chunk y overlap.
* **8.2 Chunking**: Corta el texto a evaluar usando `RecursiveCharacterTextSplitter`.
* **8.3 Contando Tokens y RAM**: Utiliza el AutoTokenizer para extraer la cuenta real de tokens, y verifica el consumo de memoria del sistema con `psutil`.
* **8.4 Generando Embeddings**: Convierte matemáticamente los chunks y las preguntas a vectores.
* **8.5 Encontrar Índices Correctos**: Averigua la posición ideal del chunk para validar luego con las métricas.
* **8.6 Cálculo Matriz Similitud**: Llama a `cosine_similarity` para enfrentar todas las preguntas contra todos los chunks generados.
* **8.7 Extraer Top 1 Chunks**: Saca el texto del chunk ganador absoluto de cada pregunta para poder pasárselo al LLM de Gemini.
* **8.8 Ejecución de Evaluadores**: Evalúa todo cruzando con MRR, Accuracy y el LLM Judge.

## 9. Guardado de Resultados
Toda la lista de resultados almacenados se convierte en un formato de tabla con Pandas (`df_results`). Se imprime un resumen rápido por terminal usando `tabulate` y finalmente se crea/sobrescribe el archivo `embedding_comparison_results.xlsx`.
