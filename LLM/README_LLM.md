# Manual Maestro: El Motor de Inteligencia Artificial (LLM + RAG)

Este documento es una guía exhaustiva diseñada para explicar cómo funciona "por dentro" nuestra inteligencia artificial. Es la referencia ideal para entender la arquitectura del TFM desde cero.

---

## 📂 1. ¿Qué hay dentro de la carpeta LLM?
*   **`base_llm.py` (La Clase Madre)**: Es el plano arquitectónico. Aquí residen las funciones pesadas como la gestión de la base de datos vectorial, el procesamiento de textos y el cerebro de respuesta.
*   **Carpeta `/clientes` (Las Clases Hijas)**: Son implementaciones específicas (ej: `banco.py`). Cada una representa a un cliente distinto con su propia base de conocimientos y reglas de comportamiento.
*   **Archivos de Soporte**: Incluye gestores de entorno (`.env`) y cargadores de configuración que sirven como puente entre el código y los datos.

---

## 💡 2. ¿Cómo funciona el sistema? (Conceptos clave)
Utilizamos una arquitectura **RAG (Generación Aumentada por Recuperación)**. 
1.  **Recuperación**: El sistema busca en tus carpetas.
2.  **Aumento**: Añade la información encontrada a la pregunta del usuario.
3.  **Generación**: La IA responde usando esos datos específicos.

---

## 👨‍👩  3. El Sistema de Familia: Clase Madre e Hijas
*   **Relación de Herencia**: La Clase Madre es el "Cerebro General". Las Hijas son "Personalidades Especializadas". 
*   **Ventaja**: Si descubrimos una forma mejor de leer PDFs, solo la cambiamos una vez (en la Clase Madre) y automáticamente todas las Clases Hijas "aprenden" ese nuevo truco sin tocarlas.

---

## 🚀 4. Flujo de Trabajo Detallado

El funcionamiento se divide en dos grandes momentos:

### A. El Ciclo de Arranque (Solo cuando se carga el cliente)
Cuando seleccionas un cliente y pulsas "Cargar", ocurre este proceso lineal:
1.  **Sincronización**: El código vincula la carpeta física del cliente (ej: `client-banco`) con el objeto en memoria.
2.  **Carga del Manifiesto**: Se lee el `rag.json`. Este archivo es vital porque le dice al sistema quién es y cuáles son sus límites.
3.  **Encendido del Motor**: Se solicita a Ollama que reserve memoria para el modelo de lenguaje.
4.  **Auditoría de Conocimiento**: El sistema verifica si ya existe la carpeta `db/`. 
    *   *Si es la primera vez*: Escanea los documentos, los corta en pedazos (Chunks) y los traduce a vectores matemáticos (Embeddings).
    *   *Si ya existe*: Carga el mapa de conocimiento directamente a la memoria RAM.
5.  **Activación Institucional**: Se fusiona la identidad del manifiesto con las instrucciones del sistema.

### B. El Ciclo de Interacción (Cada vez que preguntas)
1.  **Búsqueda Semántica**: Buscamos en la base de datos vectorial los trozos de texto más parecidos a tu pregunta. No buscamos palabras iguales, buscamos "conceptos parecidos".
2.  **Inyección de Contexto**: Tomamos esos trozos y los ponemos en un sobre junto a tu pregunta.
3.  **Generación de Respuesta**: Se le envía todo a la IA, quien redacta la respuesta final basándose solo en ese sobre.

---

## 📖 5. Diccionario de Métodos: Guía de Funciones

Aquí se explica cada función dentro de `base_llm.py` y qué rol juega:

### Métodos de Configuración Inicial
*   **`__init__(self, path_cliente)`**: Es el constructor. Establece el nombre del cliente, las rutas a sus carpetas y crea los objetos iniciales vacíos que se llenarán después.
*   **`_inicializar_llm(self)`**: Configura la conexión técnica con Ollama. Un detalle importante es que fija la `temperature` en **0**. Esto "enfría" a la IA para que no sea creativa ni invente datos, obligándola a ser determinista.
*   **`_cargar_json(self, relative_path)`**: Una utilidad maestra que lee archivos de texto JSON y los convierte en diccionarios de Python, manejando errores si el archivo no existe.

### Métodos del Motor de Conocimiento (RAG)
*   **`configurar_conocimiento(self, force_rebuild)`**: Es el director de orquesta. Decide si hay que construir la base de datos de vectores desde cero o si se puede cargar una vieja. Finaliza estableciendo la personalidad del chat.
*   **`_crear_vector_db(self, db_path)`**: Es el método más pesado. Recorre las carpetas, usa `PdfReader` para extraer texto y lo pasa por el `text_splitter`. Crea el índice de vectores y lo guarda físicamente en el disco duro.
*   **`_establecer_prompt_dinamico(self)`**: Funciona como un guionista de cine. Toma los datos de "Rol", "Objetivo", "Reglas" y "Estilo" del `rag.json` y escribe las instrucciones que guiarán a la IA durante toda la sesión.

### Métodos de Operación en el Chat
*   **`responder(self, pregunta)`**: Es el punto de contacto con el usuario.
    1. Lanza una búsqueda semántica.
    2. Identifica las fuentes de los documentos (para que sepas de dónde viene la información).
    3. Envía la petición final a la IA y emite la respuesta en **Streaming** (letra a letra) para mejorar la experiencia de usuario.

### Métodos de las Clases Hijas
*   **`__init__(self)`**: Estas clases solo tienen este método. Su única misión es llamar a la "Clase Madre" (`super().__init__`) pasándole la ruta específica de sus documentos. Una vez hecho eso, se desentienden del trabajo pesado.