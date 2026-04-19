# Concepto basico

Diferencia entre ChatGPT y GPT:
- GPT es el modelo, simplemente un motor
- ChatGPT es un producto donde el usuario puede interactuar con el modelo en un entorno amigable


## Training Time vs Inference Time

* **Training Time (Entrenamiento):** Es cuando el modelo está en la "escuela". Se le muestran billones de textos para que aprenda patrones, gramática y datos. Aquí es donde se crean sus "conocimientos". Una vez termina, el modelo se "congela".
* **Inference Time (Inferencia):** Es el momento en que tú le haces una pregunta y él genera una respuesta. Es el modelo "en vivo", usando lo que ya aprendió para predecir la siguiente palabra.

**¿Qué está pasando en tu ejemplo?**

Lo que tu profe te está enseñando no es solo la diferencia entre modelos, sino el concepto de **Inference-Time Compute** (computación en tiempo de inferencia).

Tradicionalmente, los modelos respondían lo primero que les venía a la "mente" (como un reflejo). Pero los modelos modernos (como la serie "o1" o ese "GPT-5" del ejemplo) pueden **pensar antes de hablar**.

1. El modelo "Nano" con esfuerzo mínimo ($1/3$)

Aquí el modelo está funcionando en modo "piloto automático". El problema de las dos monedas es una trampa clásica de probabilidad. Muchos textos en internet lo resuelven mal o de forma confusa. El modelo, al no "dedicarle tiempo" a pensar, simplemente escupe la respuesta estadística más común que vio en su entrenamiento, que en este caso es errónea.

2. El modelo "Nano" con esfuerzo bajo ($2/3$)

Aquí es donde ocurre la magia del **Inference Time**. Aunque el modelo es el mismo, le permites usar más "energía mental" (reasoning tokens). El modelo empieza a desglosar el problema:

1. Espacio muestral: (Cara-Cara), (Cara-Cruz), (Cruz-Cara), (Cruz-Cruz).
2. Condición: "Una es cara" (eliminamos Cruz-Cruz).
3. Opciones restantes: (C-C), (C-X), (X-C).
4. ¿En cuántas la otra es cruz?: En 2 de 3. Resultado: $2/3$.
**Al darle más tiempo de inferencia, el modelo corrige su propio impulso inicial.**

3. El modelo "Mini" vs "Nano"

Aquí cambia la arquitectura (el "cerebro" es más grande). Un modelo más potente (Mini) suele tener mejores razonamientos por defecto incluso con el mínimo esfuerzo, porque durante su **Training Time** sus conexiones se volvieron más precisas que las del Nano.

---

### Resumen para tu examen:

| Fase | Qué sucede | Analogía |
| --- | --- | --- |
| **Training Time** | El modelo aprende patrones de una base de datos gigante. | Estudiar todo el semestre para la carrera. |
| **Inference Time** | El modelo procesa tu duda específica y genera una respuesta. | Resolver una pregunta específica en el examen final. |

**El giro moderno:** Ahora sabemos que si dejamos que el modelo "piense" más durante la **inferencia** (usando más tokens de razonamiento), puede superar errores que cometió durante su **entrenamiento**.





# Tokens
Revisar el concepto de los Token

platform.openai.com/tokenizer

Revisar cuales son los token que usa el modelo elegido

- Token normal
- Cache tokens
- Token de Razonamiento. ¿Qué es un "Token de razonamiento"?

Imagina que le pides a un amigo que resuelva un problema de matemáticas muy difícil.

* **Sin razonamiento:** Tu amigo te suelta un número al azar en 1 segundo. Eso es un LLM estándar.
* **Con razonamiento:** Tu amigo saca una hoja de papel, hace garabatos, tacha cosas, murmura para sí mismo y luego te da la respuesta.

Esos "garabatos" y "murmullos" son los **tokens de razonamiento**. Son palabras y pensamientos internos que el modelo genera para sí mismo antes de escribir la respuesta final que tú ves. El modelo usa estos tokens para "pensar en voz alta" internamente, lo que le permite corregir errores de lógica sobre la marcha.

3. ¿Es un token extra que se gasta?

**Sí, absolutamente.** Y aquí está el truco:

1. **Cuestan dinero/recursos:** Aunque tú no veas esos tokens en la respuesta final (a veces están ocultos tras un desplegable que dice "Pensando..."), el procesador (GPU) tuvo que trabajar para generarlos. Por lo tanto, consumen parte de tu cuota o de tu dinero.
2. **Cuestan tiempo:** Por eso, cuando activas el razonamiento (o pones `reasoning_effort="low/high"`), el modelo tarda más en empezar a responder. Está "escribiendo" su borrador mental.
3. **Límite de contexto:** Los modelos tienen un límite de cuántos tokens pueden procesar a la vez. Los tokens de razonamiento ocupan espacio en ese límite, igual que las palabras de tu pregunta.

> **Dato clave:** En los modelos más nuevos, el éxito no viene de hacer el modelo "más grande" (entrenamiento), sino de dejar que el modelo "piense más" (inferencia). A esto se le llama **Scaling Laws for Inference**.


Token cost:
print(f"Input tokens: {response.usage.prompt_tokens}")
print(f"Output tokens: {response.usage.completion_tokens}")
print(f"Total tokens: {response.usage.total_tokens}")
print(f"Total cost: {response._hidden_params["response_cost"]*100:.4f} cents")






# Context window:

www.vellum.ai/llm-leaderboard



# Documentacion:
buscar info de este
- con que tipo de formatos se entrena? JSONs, MD, 
- Idioma? principalmente ingles
- 



# Prompt Engineering:
- one-shot
- multi-shot
- Negative answers ( lo que no quiero)




# LLM answerts:

cada ejecucion es independiente(stateless)

## Ejemplo basico
ejemplo: 
messages = [
    {"role": "system", "content": "You are a helpful assistant"},
    {"role": "user", "content": "Hi! I'm Ed!"}
    ]

messages = [
    {"role": "system", "content": "You are a helpful assistant"},
    {"role": "user", "content": "Hi! I'm Ed!"},
    {"role": "assistant", "content": "Hi Ed! How can I assist you today?"}
    ]


messages = [
    {"role": "system", "content": "You are a helpful assistant"},
    {"role": "user", "content": "Hi! I'm Ed!"},
    {"role": "assistant", "content": "Hi Ed! How can I assist you today?"},
    {"role": "user", "content": "What's my name?"}
    ]

messages = [
    {"role": "system", "content": "You are a helpful assistant"},
    {"role": "user", "content": "Hi! I'm Ed!"},
    {"role": "assistant", "content": "Hi Ed! How can I assist you today?"},
    {"role": "user", "content": "What's my name?"},
    {"role": "assistant", "content": "Your name is Ed"}
    ]


## Acceder a la respuesta

Contenido de una respuesta siempre se muestra en json
response = requests.post(
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    headers={
        "Authorization": f"Bearer {google_api_key}",
        "Content-Type": "application/json"
    },
    json={
        "model": "gemini-2.5-flash",
        "messages": [{"role": "user", "content": "your message here"}]
    }
)

response.json()


Por ejemplo:
{'choices': [{'finish_reason': 'stop',
   'index': 0,
   'message': {'content': 'Certainly! "Your message here" is a blank canvas.\n\nWhat kind of message would you like? For example, I can provide:\n\n*   A friendly greeting\n*   Information about a specific topic\n*   A creative story or poem\n*   A helpful tip or piece of advice\n*   An answer to a question you have\n*   A simple placeholder confirmation\n*   Or anything else you have in mind!\n\nJust let me know what you\'re looking for, and I\'ll generate a message for you.',
    'role': 'assistant'}}],
 'created': 1773594739,
 'id': 'bui2aY_ULaqWkdUP9NDH4QU',
 'model': 'gemini-2.5-flash',
 'object': 'chat.completion',
 'usage': {'completion_tokens': 110, 'prompt_tokens': 4, 'total_tokens': 1005}}

 Si quiero acceder a la respuesta puntual:
 response.json()['choices'][0]['message']['content']

## Streaming = True

Que pasa si quiero que me vaya mostrando tal cual muestra un ChatGPT:

1. chunk
Cuando usamos stream=True, la API no nos devuelve toda la respuesta de golpe, sino que nos manda el texto en pequeños "pedacitos" o "paquetes" a medida que el modelo los va generando. Cada uno de estos pedacitos es un chunk.

2. chunk.choices[0]
Al igual que en una respuesta normal (sin streaming), la API podría devolver múltiples "opciones" o versiones de la respuesta (si se lo pidieras configurando n=2, por ejemplo). Como nosotros solo pedimos una respuesta por defecto, siempre buscamos la primera opción, que es choices[0].

3. delta
Esta es la gran diferencia con una llamada sin streaming.

En una llamada normal, usas message (es decir, el mensaje completo).
En streaming, usas delta, que significa "diferencia" o "cambio". El delta contiene solo las nuevas letras o palabras que se acaban de generar en ese pedacito específico, no todo el texto acumulado.
4. content
Es el texto real que viene dentro de ese pedacito (por ejemplo, podría venir la sílaba "ción" o la palabra " Hola").

5. or '' (La trampa contra errores)
Aquí es donde ocurre la magia defensiva de Python. A veces, la API manda un chunk vacío donde content es None (generalmente ocurre en el primer o último paquete de la transmisión, usados para indicar que empieza o termina el mensaje).

Si intentas sumar un texto con None (es decir, "Hola" + None), Python lanzará un error y el programa colapsará.
El operador or '' le dice a Python: "Si chunk.choices[0].delta.content es válido/tiene texto, úsalo. Pero si es None, entonces cámbialo por una cadena vacía '' (nada)."
Sumar "Hola" + "" es perfectamente válido.





<br><br><br><br><br><br><br>

---
---
---



## Que son las tools 

-- Week 2 - day 4 super importante

que es tool calling?  VER IMAGEN tool_calling.png
### Idea general

Un LLM como yo no ejecuta funciones directamente, pero puede:

Entender lo que el usuario quiere
Detectar si hay una función disponible que lo resuelve
Generar un JSON estructurado indicando cómo llamar esa función

common use cases:
- fetch data from a database
- take action, like booking a meeting
- perform complex calculations
- Modifiy the UI


````md id="h2k91x"
## 🧠 Tool Calling (Function Calling) en LLM

Los LLM (como ChatGPT) pueden usar funciones externas, pero **no las ejecutan directamente**.  
Lo que hacen es generar un **JSON estructurado** indicando:

- qué función usar
- con qué parámetros

👉 Luego **tu backend ejecuta esa función**.

---

## 🔧 Ejemplo

```python
price_function = {
    "name": "get_ticket_price",
    "description": "Get the price of a return ticket to the destination city.",
    "parameters": {
        "type": "object",
        "properties": {
            "destination_city": {
                "type": "string",
                "description": "City to travel to"
            }
        },
        "required": ["destination_city"],
        "additionalProperties": False
    }
}
````

---

## 🧩 Partes clave

* **name**
  → Nombre de la función en tu backend

* **description**
  → Le dice al modelo cuándo usar la función

* **parameters**
  → Define cómo deben ser los inputs (tipo contrato)

  * `type: object` → los parámetros son un JSON
  * `properties` → define cada campo (nombre, tipo, descripción)
  * `required` → campos obligatorios
  * `additionalProperties: False` → evita parámetros extra

---

## 🔄 Flujo completo

1. Usuario hace una pregunta
2. El LLM analiza si alguna función aplica
3. Si aplica → devuelve un JSON:

```json
{
  "name": "get_ticket_price",
  "arguments": {
    "destination_city": "Roma"
  }
}
```

4. Tu backend ejecuta: `get_ticket_price("Roma")`
5. Devuelve el resultado al LLM
6. El LLM responde al usuario con el resultado final

---

## 🧠 Idea clave

> El LLM decide **qué herramienta usar**, pero **vos la ejecutás**.

```
```



<br><br><br><br>
------
---
---
---
---
<br><br><br>



# WEEK 3






Sí, tu profe se refiere a **los dos niveles de uso en Hugging Face**, y es clave entenderlos porque cambian totalmente cómo trabajás con modelos 👇

---

## 🟢 1. High-level API → `pipeline` (lo fácil y rápido)

Es la forma **más simple de usar modelos**. No te preocupás por tokens, tensores ni detalles internos.

👉 Ejemplo:

```python
from transformers import pipeline

classifier = pipeline("sentiment-analysis")
result = classifier("Me encanta este curso")
print(result)
```

💡 Qué hace por vos:

* Descarga el modelo automáticamente
* Tokeniza el texto (lo convierte en números)
* Ejecuta el modelo
* Decodifica el resultado

👉 Es como:
**“Quiero usar IA sin complicarme”**

---

## 🔴 2. Low-level API → tokenizer + model (lo potente)

Acá trabajás **más cerca del modelo real**. Tenés control total.

👉 Ejemplo:

```python
from transformers import AutoTokenizer, AutoModelForSequenceClassification

tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
model = AutoModelForSequenceClassification.from_pretrained("distilbert-base-uncased")

inputs = tokenizer("Me encanta este curso", return_tensors="pt")
outputs = model(**inputs)
```

💡 Acá vos controlás:

* Cómo se tokeniza el texto
* Qué modelo usás exactamente
* Los tensores (inputs numéricos)
* El output crudo del modelo

👉 Es como:
**“Quiero entender y controlar todo lo que pasa”**

---

## 🧠 Diferencia clave (resumen corto)

| Nivel      | Facilidad    | Control | Uso típico                    |
| ---------- | ------------ | ------- | ----------------------------- |
| `pipeline` | 🔥 Muy fácil | ❌ Bajo  | pruebas rápidas, demos        |
| low-level  | 😐 Medio     | ✅ Alto  | proyectos reales, fine-tuning |

---

## ⚡ Analogía rápida

* `pipeline` = pedir comida por app 🍔
* low-level = cocinar vos mismo 👨‍🍳

---

## 🚀 Cuándo usar cada uno

Usá `pipeline` si:

* Estás aprendiendo
* Querés prototipar rápido
* No te importa el detalle interno

Usá low-level si:

* Querés entrenar o ajustar modelos
* Necesitás eficiencia o personalización
* Estás haciendo algo más serio (ej: tu TFM)

---

Si querés, en el siguiente paso te explico **qué es exactamente el tokenizer (eso que te dijeron de “tokens”)** porque es la clave para entender el low-level 💡



puntadeleste4175









🧠 ¿Qué es Quantization?

La quantization (cuantización) es básicamente:

Reducir la precisión de los números del modelo para que ocupe menos memoria y vaya más rápido

⚖️ Trade-off (lo importante)
Bits	Memoria	Velocidad	Precisión
32	🔴 Alta	🐢 Lento	✅ Alta
16	🟠 Media	⚡ Medio	✅ Muy buena
8	🟡 Baja	⚡ Rápido	👍 Buena
4	🟢 Muy baja	🚀 Muy rápido	⚠️ Pierde algo


Es como tener un switch de luz donde podes girar de un lado a otro y elegir que tan fuerte queres que sea la luz. SI tengo muchos bits, puedo ir cambiando la intensidad de la luz de forma muy suave, pero si tengo pocos bits, solo puedo cambiar la intensidad de la luz de forma brusca..

Supongamos que tengo 2 bits, puedo tener 4 niveles de intensidad (0, 1, 2, 3). Si tengo 3 bits, puedo tener 8 niveles de intensidad (0, 1, 2, 3, 4, 5, 6, 7). Si tengo 4 bits, puedo tener 16 niveles de intensidad (0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15). 