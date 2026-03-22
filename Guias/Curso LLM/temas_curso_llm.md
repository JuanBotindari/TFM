# Concepto basico

Diferencia entre ChatGPT y GPT:
- GPT es el modelo, simplemente un motor
- ChatGPT es un producto donde el usuario puede interactuar con el modelo en un entorno amigable




# Tokens
Revisar el concepto de los Token

platform.openai.com/tokenizer

Revisar cuales son los token que usa el modelo elegido






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
