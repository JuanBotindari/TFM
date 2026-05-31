# Documentación Técnica: Clase `BaseModel` (LLM Agéntico con RAG)

Este documento detalla el funcionamiento interno, de principio a fin, de la clase `BaseModel` definida en `base_llm.py`. Está estructurado para explicar cada uno de los métodos que componen el comportamiento de este Agente de Lenguaje.

La clase `BaseModel` actúa como el "Cerebro" principal. Se encarga de inicializar el LLM, cargar configuraciones, gestionar la telemetría, indexar el conocimiento local (RAG), procesar distintos tipos de archivos (PDFs, webs, tablas) y manejar las conversaciones con los usuarios de manera dinámica utilizando herramientas simuladas (como la búsqueda en tablas estructuradas).

---

## `__init__(self, path_cliente)`

```python
    def __init__(self, path_cliente):
        self.path_cliente = path_cliente
        self.nombre_cliente = os.path.basename(path_cliente)
        
        self._telemetria("header")

        # Configs
        self.config_tech = self._cargar_json("config/settings.json")
        self.manifiesto = self._cargar_json("config/rag.json")
        self.ejemplos_qa = self._cargar_json("config/ejemplos_qa.json")
        
        # IA Components
        self.llm = self._inicializar_llm()
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        self.vector_store = None
        self.chat_prompt = None
        self.archivos_reporte = []
```

### Explicación Detallada

Este es el **constructor** de la clase, el método que se ejecuta apenas instanciamos un nuevo agente LLM.

**Responsabilidades:**
1.  **Detección del Entorno:** Recibe la ruta `path_cliente` (la carpeta del modelo/cliente actual) y extrae el nombre del cliente.
2.  **Impresión de Telemetría inicial:** Llama a su herramienta de logging interno (`self._telemetria("header")`) para advertir en consola que el agente se está encendiendo.
3.  **Carga de Configuraciones:** Utilizando el método auxiliar `_cargar_json()`, lee directamente de la carpeta del cliente 3 archivos fundamentales:
    *   `settings.json`: Configuraciones técnicas (qué LLM usar, Dónde está el servidor Ollama).
    *   `rag.json`: El "Manifiesto", que dice qué personalidad tiene y dónde están los archivos de conocimiento.
    *   `ejemplos_qa.json`: (Actualmente no usado explícitamente en el código posterior, pero se carga de antemano por si el prompt los necesita).
4.  **Componentes de IA (IA Components):**
    *   Inicializa la conexión real con el LLM mediante `_inicializar_llm()`.
    *   Carga directamente en la RAM el modelo de codificación (embeddings) de HuggingFace `all-MiniLM-L6-v2`. Esto es vital para transformarte texto a matemáticas (vectores).
    *   Deja vacías (en `None`) las propiedades de `vector_store` y el `chat_prompt` hasta que al agente se le pida que construya el conocimiento RAG a través del método correspondiente.

---

## `_inicializar_llm(self)`

```python
    def _inicializar_llm(self):
        model = self.config_tech.get("modelo", "phi3")
        url = self.config_tech.get("url_llm", "http://localhost:11434")
        return ChatOllama(model=model, base_url=url, temperature=0)
```

### Explicación Detallada

Un constructor auxiliar dedicado a **conectar con el Motor Lingüístico Local** (Ollama).

**Responsabilidades:**
1.  Busca en las recién cargadas configuraciones (`self.config_tech`) qué nombre tiene el modelo que el usuario prefirió. Si por alguna razón el archivo no existe o no tiene ese dato, establece un valor por defecto muy conservador: `"phi3"`.
2.  Busca la URL donde el servicio LLM local está corriendo. Por defecto será el estándar de Ollama `http://localhost:11434`.
3.  Utiliza la clase `ChatOllama` provista por la biblioteca LangChain para instanciar el cliente conversacional. Al setear `temperature=0`, le está ordenando al LLM que sus respuestas deben ser **las más deterministas (estrictas y repetitivas)** posibles, sin dejar lugar a la alucinación excesiva, asumiendo así un comportamiento puramente RAG (donde queremos evitar la improvisación de datos).

---

## `_cargar_json(self, relative_path)`

```python
    def _cargar_json(self, relative_path):
        full_path = os.path.join(self.path_cliente, relative_path)
        if os.path.exists(full_path):
            with open(full_path, 'r', encoding='utf-8') as f:
                try: return json.load(f)
                except: return []
        return []
```

### Explicación Detallada

Método utilitario robusto diseñado **sólo para abrir e interpretar archivos JSON**.

**Logica Interna:**
1.  Toma una `relative_path` (como `"config/rag.json"`) y la une con la ruta maestra del cliente usando `os.path.join` para encontrar la dirección absoluta y real en Windows.
2.  Se blinda con controles: Primero verifica que el archivo realmente exista antes de intentar abrirlo (`if os.path.exists...`).
3.  Intenta leer y parsear la información dentro de un bloque `try`. Si el JSON de configuración contiene errores de formato graves, no estrellará la aplicación, silenciará el error y regresará una lista vacía `[]`, que en código posterior se procesará como si el archivo estuviese en blanco.

---

## `_telemetria(self, estado, data=None)`

```python
    def _telemetria(self, estado, data=None):
        if estado == "header":
            print(f"\n{'='*60}\n🤖 AGENTE ACTIVO: {self.nombre_cliente.upper()}\n{'='*60}")
        elif estado == "auditoria":
            print(f"🔍 Auditando mapas de conocimiento...")
        elif estado == "tabla_conocimiento":
            print("\n📊 REPORTE DE CAPACIDADES:")
            headers = ["Recurso", "Área", "Acceso", "Estado"]
            print(tabulate(self.archivos_reporte, headers=headers, tablefmt="fancy_grid"))
        elif estado == "listo":
            print(f"\n🧠 Motor IA listo. Usando protocolo [USAR_TABLA].\n")
        elif estado == "pensando":
            p = data.get("pregunta")
            docs_scores = data.get("docs_with_scores")
            print(f"\n🤔 ANALIZANDO PREGUNTA: \"{p}\"")
            print(f"   > CERCANÍA CON DOCUMENTOS (Score):")
            for doc, score in docs_scores:
                # En Chroma, menor distancia es más cercanía. 
                # Generalmente < 0.8 es bueno.
                status = "✅ CERCANO" if score < 0.8 else "❌ LEJOS"
                print(f"     - [{doc.metadata['source']}]: {score:.4f} ({status})")
        elif estado == "intencion":
            print(f"\n🧠 [BRAIN RAW OUTPUT]:")
            print(f"{'-'*40}\n{data.get('raw_content')}\n{'-'*40}")
        elif estado == "ejecutando_tool":
            print(f"🛠️  [TOOL EXECUTION] Buscando en tablas: '{data.get('termino')}'...")
```

### Explicación Detallada

Este método no afecta la lógica de Inteligencia Artificial, pero es el **sistema de logs visuales y depuración** en la consola del sistema para el desarrollador. Permite monitorear el pulso de lo que sucede de fondo.

Opera mediante un *switch gigante (if/elif)* donde evalúa la instrucción de tipo `estado`:

*   **header**: Título visual del arranque.
*   **auditoria**: Aviso previo al chequeo de archivos.
*   **tabla_conocimiento**: Llama a la gema externa `tabulate` para dibujar en la terminal, como si de un Excel se tratara, toda la información de `self.archivos_reporte` recolectada mientras exploró los PDFs o CSVs.
*   **pensando**: ¡Esta parte es crítica para depurar RAG! Muestra la distancia técnica vectorial. Si los `score` devueltos son mayores a 0.8, significa que ningún PDF del disco se parece vectorialmente a la pregunta que ha hecho el usuario y será considerado basura (`❌ LEJOS`).
*   **intencion / ejecutando_tool**: Documenta paso a paso qué genera el LLM crudo y cuando decide ejecutar sus "herramientas simuladas".

---

## `configurar_conocimiento(self, force_rebuild=False)`

```python
    def configurar_conocimiento(self, force_rebuild=False):
        db_path = os.path.join(self.path_cliente, "db/vector_store")
        self._telemetria("auditoria")
        
        if not os.path.exists(db_path) or force_rebuild:
            self._crear_vector_db(db_path)
        else:
            self._escanear_archivos_para_reporte()

        self.vector_store = Chroma(persist_directory=db_path, embedding_function=self.embeddings)
        self._establecer_prompt_dinamico()
        
        self._telemetria("tabla_conocimiento")
        self._telemetria("listo")
```

### Explicación Detallada

Este es el **motor orquestador número uno de RAG**. Este método decide si necesita leer los archivos PDFs de cero y triturarlos o si solo recarga la vieja base de datos. Se suele mandar a ejecutar después de crear las clases del modelo.

**Lógica Paso a Paso:**
1.  Localiza dónde *debería* guardarse físicamente la base de datos ChromaDB en disco (`db/vector_store`).
2.  Revisa si esa carpeta ya existe en el disco y no le ha solicitado el usuario u otro método reconstruirla a fuerza bruta (`force_rebuild`).
    *   Si **no** hay base vectorizada (o la fuerzan): Manda a llamar a `_crear_vector_db()` para quemar CPU abriendo e interpretando todos los archivos.
    *   Si **sí** hay base construida, no quema recursos vectorizando, solo invoca `_escanear_archivos_para_reporte()` para rellenar visualmente los metadatos de qué sabe el modelo y mostrarlos en los logs.
3.  **El momento crucial**: Una vez validado que existe físicamente la base en disco, asocia a la variable `self.vector_store` una instancia pesada en memoria de la biblioteca `Chroma()`. A paritr de este momento el modelo se puede interrogar.
4.  Termina amarrando el "Prompt System" a sus instrucciones con `_establecer_prompt_dinamico()`.

---

## `_escanear_archivos_para_reporte(self)`

```python
    def _escanear_archivos_para_reporte(self):
        for modulo in self.manifiesto.get("indice_conocimiento", {}).get("modulos", []):
            dir_path = os.path.join(self.path_cliente, modulo.get("directorio"))
            if os.path.exists(dir_path):
                for f in os.listdir(dir_path):
                    self.archivos_reporte.append([f, modulo['nombre'], "Indirecto", "Listo 💾"])
```

### Explicación Detallada

Un método puramente estético y cosmético que se ejecuta solo si **se saltó** el proceso de vectorización y en su lugar ya había cosas guardadas de antes.

Busca en el manifiesto (`rag.json`) dónde están todas las sub-carpetas, navega por los archivos ahí guardados (sin abrirlos, iterándolos vía `os.listdir`) y reempaca esa información en arreglos `[NombreArchivo, Ubicacion, "Indirecto", "Listo"]` y lo guarda en `archivos_reporte` para uso futuro del loggueo en formato tabla de telemetría.

---

## `_crear_vector_db(self, db_path)`

```python
    def _crear_vector_db(self, db_path):
        all_chunks = []
        self._telemetria("inicio_ingesta")
        
        for modulo in self.manifiesto.get("indice_conocimiento", {}).get("modulos", []):
            dir_path = os.path.join(self.path_cliente, modulo.get("directorio"))
            tipo = modulo.get("tipo", "pdf").lower()
            if not os.path.exists(dir_path): continue
            
            if tipo == "pdf": all_chunks.extend(self._procesar_pdf(dir_path, modulo))
            elif tipo == "web": all_chunks.extend(self._procesar_web(dir_path, modulo))
            elif tipo == "tablas":
                for f in os.listdir(dir_path):
                    self.archivos_reporte.append([f, modulo['nombre'], "AGENTE", "Listo 🛠️"])

        if all_chunks:
            texts = [c["text"] for c in all_chunks]
            metadatas = [c["metadata"] for c in all_chunks]
            Chroma.from_texts(texts=texts, metadatas=metadatas, embedding=self.embeddings, persist_directory=db_path)
```

### Explicación Detallada

El corazón de la ingesta pesada. Recorre todo el árbol de directorios que dictamina el manifiesto (sea una carpeta para un pdf o para tablas CSV) y toma decisiones sobre cómo procesarlos y cortarlos y guardar en memoria.

1.  Usa `for modulo in ...` para iterar las configuraciones en `rag.json`. Si le indica que la carpeta "documentos/" tiene tipo `pdf`, se va a una rama; si es tipo `web` o `tablas`, a otra.
2.  Delega la carga de cada archivo a funciones ultra-especializadas (`_procesar_pdf` o `_procesar_web`). Estas funciones retornaran pedazos gigantes de texto dividos llamados _Chunks_. Los almacena todos en una gigantesca lista `all_chunks`.
    *   **Nota especial "Tablas":** Los archivos "tipo tablas" NO pasan por el proceso tradicional de vectorización y embeddings. Solo se registran para los logs visuales. Esta información se guarda por aparte porque de estas tablas se encarga la "Herramienta Dinámica de tablas" no el RAG normal con vectores matemáticos.
3.  Termina diviendo por columnas puras. Agrupa todo el texto puro en la lista `texts` y de cuál documento o módulo provino (el `metadata`). Finalmente, le pide al motor vector database (`Chroma`) que agarre todos esos textos, los pase por el codificador HF embeddings y los _vuelque/persista_ permanentemente en disco (`save_directory`) para utilizarlos.

---

## `_procesar_pdf(self, path, modulo)`

```python
    def _procesar_pdf(self, path, modulo):
        chunks_modulo = []
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
        for file in os.listdir(path):
            if file.endswith(".pdf"):
                try:
                    full_path = os.path.join(path, file)
                    reader = PdfReader(full_path)
                    text = "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])
                    chunks = text_splitter.split_text(text)
                    for chunk in chunks:
                        chunks_modulo.append({"text": chunk, "metadata": {"source": file, "modulo": modulo['nombre']}})
                    self.archivos_reporte.append([file, modulo['nombre'], "RAG PDF", "Nuevo ✅"])
                except: pass
        return chunks_modulo
```

### Explicación Detallada

Es un cargador exclusivo para parsear PDFs.

**Técnicas Inteligentes RAG aplicadas aquí:**
1.  **Splitter Recursivo:** Se prepara la clase `RecursiveCharacterTextSplitter` instanciándole que el _chunk_ máximo debe rondar en 1000 caracteres, y que al realizar cortes del PDF, las últimas letras/palabras deben solaparse `150` posiciones hacia el nuevo chunk para **no partir nunca ni ideas ni frases complejas a la mitad del corte**.
2.  Busca todos los archivos con extensión `.pdf` en este modulo.
3.  Utiliza la popular biblioteca (`PyPDF2 / pypdf`) para extraer textualmente en modo bruto las hojas concatenadas por `\n`.
4.  Corta todos esos textos basurales con su _Splitter Recursivo_.
5.  A cada corte de 1000 caracteres, le inyecta una etiqueta metadata indicando "Esto proviene específicamente del archivo yyy.pdf". Lo retorna para que la función padre lo grabe en DB Vectores.

---

## `_procesar_web(self, path, modulo)`

```python
    def _procesar_web(self, path, modulo):
        chunks_modulo = []
        for file in os.listdir(path):
            if file.endswith((".txt", ".html", ".json")):
                with open(os.path.join(path, file), 'r', encoding='utf-8') as f:
                    text = f.read()
                    chunks_modulo.append({"text": text, "metadata": {"source": file, "modulo": modulo['nombre']}})
                    self.archivos_reporte.append([file, modulo['nombre'], "RAG Web", "Nuevo ✅"])
        return chunks_modulo
```

### Explicación Detallada

Similar a la ingesta de PDFs, pero diseñado para datos planamente descargados como `.txt` o `.html`. Su complejidad es mínima porque asume que ese origen era liviano y en ningún momento usa el *Splitter/Cortador*, asume directamente un `Text` y un metadato "archivo zzz.html" y lo manda entero como base. Esto es arriesgado con archivos texto gigantes.

---

## `_procesar_imagenes(self, path, modulo)`

```python
    def _procesar_imagenes(self, path, modulo):
        pass
```

### Explicación Detallada

Es sencillamente un "Stub", un bloque o plantilla vacía para recordarle al programador que puede integrarse en el futuro con un Multi-modal (como Llama Vision u OCR). Actualmente está deshabilitado.

---

## `_establecer_prompt_dinamico(self)`

```python
    def _establecer_prompt_dinamico(self):
        m = self.manifiesto
        instr = m.get("instrucciones_sistema", {})
        
        prompt_sys = f"""{instr.get('prompt_maestro')}
        ESTILO REQUERIDO: {instr.get('estilo_respuesta')}
        REGLAS DE ORO: {', '.join(instr.get('reglas_oro', []))}
        
        PROTOCOLO DE ACCESO A DATOS ESTRUCTURADOS (TABLAS):
        Si necesitas datos precisos como CUITs, saldos, nombres técnicos o detalles de la base de datos de seguros que NO están en el conocimiento RAG de abajo, debes solicitar la herramienta de tablas escribiendo:
        [USAR_TABLA: término_de_búsqueda]
        
        Ejemplo: Si te piden el CUIT de Leonel y no aparece abajo, escribe "[USAR_TABLA: Leonel]". No des respuestas aproximadas ni inventes datos."""

        self.chat_prompt = ChatPromptTemplate.from_messages([
            SystemMessage(content=prompt_sys),
            MessagesPlaceholder(variable_name="history", optional=True),
            HumanMessagePromptTemplate.from_template("CONOCIMIENTO RAG DISPONIBLE:\n{context}\n\nPREGUNTA USUARIO: {pregunta}")
        ])
```

### Explicación Detallada

Este método es el encargado de empaquetar cuál es **el alma comportamental / La Personalidad** del modelo, leyéndolo desde los JSON de configuración y programándolo en la instancia base `LangChain Prompt`.

**Generación del "Ataque Inicial":**
1.  Agarra el `prompt_maestro`, e inserta variables dinámicas como una lista encadenada de "Las Reglas del Oro" y el "Estilo".
2.  **Inyección Genérica de System prompt Tool-Call:** El verdadero poder está al final del bloque string. Le implanta en el cerebro al Agente una regla inquebrantable de Sintaxis. "Si no sabes la respuesta en tus pedazo de texto, responde estrictamente con el formato string literal `[USAR_TABLA: blabla]`". **Aquí se crea el agente**. No usa Tool Calling nativos API rest, usa String Matching Regex simulado.
3.  Ensambla el Sistema, el Historial, y empuja directamente una plantilla por hardware en el Mensaje del humano obligándole a leer el CONOCIMIENTO RAG DISPONIBLE con espacios dinámicos (`{context}`).

---

## `consultar_tablas_y_db(self, consulta)`

```python
    def consultar_tablas_y_db(self, consulta):
        """Busca directamente en los archivos físicos de tablas y bases de datos."""
        self._telemetria("ejecutando_tool", {"termino": consulta})
        resultados = []
        for modulo in self.manifiesto.get("indice_conocimiento", {}).get("modulos", []):
            if modulo.get("tipo") == "tablas":
                dir_path = os.path.join(self.path_cliente, modulo.get("directorio"))
                if not os.path.exists(dir_path): continue
                for file in os.listdir(dir_path):
                    f_path = os.path.join(dir_path, file)
                    if file.endswith((".txt", ".md", ".csv")):
                        with open(f_path, 'r', encoding='utf-8', errors='ignore') as f:
                            cuerpo = f.read()
                            if consulta.lower() in cuerpo.lower():
                                # Devolver el bloque donde se encontró la coincidencia
                                pos = cuerpo.lower().find(consulta.lower())
                                start, end = max(0, pos-1000), pos+3000
                                resultados.append(f"ORIGEN: {file}\nDATOS:\n{cuerpo[start:end]}")
        return "\n".join(resultados) if resultados else "No se hallaron coincidencias en las tablas físicas."
```

### Explicación Detallada

El "Brazo Ejecutor" o la **Herramienta Virtual** (Tooling) referenciada en explicaciones anteriores. Si el modelo detecta que necesita información especial en tablas, no la saca de sus vectores (porque es inexacta y ruidosa con bases CSV gigantes), activa este código Python para buscar de forma tradicional.

**Funcionamiento Básico del Crawler de Planos (CSVs / MDs):**
1.  Busca solo en aquéllos módulos del JSON donde se haya declarado `"tipo": "tablas"`.
2.  Lee los archivos pesados uno tras otro. E interroga por `cuerpo.lower().find(consulta.lower())`. Así pues, busca el índice de palabra "Leonel" (si consulta es Leonel).
3.  Maneja un "buffer o vista limitada". Como un CSV gigante aplastaría la memoria de contexto del LLM, recorta matemáticamente alrededor del sector: agarra `pos-1000` (unas líneas más arriba de "Leonel") y `pos+3000` (algunas tablas después de Leonel). Envía solo ese bloque diminuto a la Inteligencia Artificial.

---

## `responder(self, pregunta)`

```python
    def responder(self, pregunta):
        if not self.vector_store:
            yield "Error de sistema: Base no cargada."
            return

        # 1. Recuperar con Scores (ver que tan cerca está)
        # Traemos 10 para ver la comparativa de cercanía
        docs_scores = self.vector_store.similarity_search_with_score(pregunta, k=10)
        self._telemetria("pensando", {"pregunta": pregunta, "docs_with_scores": docs_scores})
        
        # 2. Umbral: Si la cercanía es mayor a 0.8, consideramos que no tiene nada que ver
        docs_validos = [doc for doc, score in docs_scores if score < 0.85]
        
        contexto_rag = ""
        if docs_validos:
            contexto_rag = "\n\n".join([f"[{d.metadata['source']}] {d.page_content}" for d in docs_validos])
        else:
            contexto_rag = "NO SE DETECTÓ CONOCIMIENTO RELEVANTE PARA ESTA PREGUNTA."

        # 3. Generación
        prompt_mensajes = self.chat_prompt.format_messages(context=contexto_rag, pregunta=pregunta)
        respuesta_ia = self.llm.invoke(prompt_mensajes)
        
        self._telemetria("intencion", {"raw_content": respuesta_ia.content})
        
        match = re.search(r"\[USAR_TABLA:\s*(.*?)\]", respuesta_ia.content)
        
        if match:
            termino = match.group(1).strip()
            datos_tablas = self.consultar_tablas_y_db(termino)
            contexto_enriquecido = contexto_rag + f"\n\nDATOS OBTENIDOS DE LAS TABLAS DE NEGOCIO:\n{datos_tablas}"
            prompt_actualizado = self.chat_prompt.format_messages(context=contexto_enriquecido, pregunta=pregunta)
            for chunk in self.llm.stream(prompt_actualizado):
                yield chunk.content
        else:
            yield respuesta_ia.content
```

### Explicación Detallada

Este es el **Método Principal y Público**, la cara frontal para comunicarse desde Gradio o una Terminal, donde la magia, el "Orquestador de Multi-Paso", y todo el código analizado antes, toma forma.

Es fundamental saber que **no retorna strings fijos**, sino que está implementado como un **generador Python (Generator usando `yield`)**, permitiendo que de cara hacia Gradio parezca que "burbujea letras" letra a letra como ChatGpt.

**La Línea de Tiempo del Razonamiento y su Re-Intento (Agent Loop):**

1.  **Recuperación Clásica (Retrieval - Fase 1):** Convierte todo a vectores, pregunta a la VectorStore por las "10 partes/textos más similares (`k=10`)" y los puntúa con distancia semántica euclidiana.
2.  **Umbral de Defensa-Anti Alucinaciones (Cull Filter):** Filtra y elimina los datos basura. Cualquier PDF de esos top 10 que exceda la barrera de diferencia del 85% (`score < 0.85`), se bota a la basura para que el LLM no empiece a inventar conectando un PDF sobre "Papas Fritas", con un contrato de "Bienes Raíces".
3.  **Primer Interrogatorio:** Con el nuevo Set depurado y empacado junta el string gigante `[DocumentoA.pdf](Texto) [DocumentoB.pdf](Texto)` y lanza una llamada Bloqueante a Ollama vía `self.llm.invoke`. Espera una respuesta entera, del tirón, no progresiva.
4.  **Parseo de Intenciones y Ruteo Expresiones Regulares (Regex - Fase 2):**
    *   No emite la respuesta generada directo al usuario humano. Aplica Python regular expressions (`re.search`) para ver si entre todo lo que habló y balbuceó, se atrevió a escribir su código mágico **`[USAR_TABLA: parametro]`**.
    *   Si **NO** hizo eso —> Solo genera su texto final y escupe los resultados vía `yield respuesta_ia.content`.
    *   Si **SÍ** se detectó la intención: Entra al bloque `if match`.
        1. Captura con limpieza (strip) la palabra a buscar (Ej. "CUIT 202").
        2. Frena el proceso y manda a accionar el explorador de carpetas y CSVs con `self.consultar_tablas_y_db`.
        3. Realiza el **_Segúndo y Definitivo Prompt_**: Reensambla todo. Adjuntado los viejos vectores RAG, le pega como un gran anexo un Texto adicional "Y acá están los Datos de la tabla que ordenaste buscar".
        4. Vuelve por segunda vez a llamar a Ollama hacia internet. Esta vez **SÍ** le pide generar su resultado a la terminal en Tiempo real (En Stream, a tirones de letras) a través de "For Chunk in self.llm.stream: YIELD".

En conclusión, este método implementa de forma cruda, sin marcos externos lentos (como AgentExecutors de Langchain), un verdadero bucle R-A-G React pattern.
