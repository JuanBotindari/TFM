# 🧠 Módulo LLM: Arquitectura de Inteligencia

Este módulo gestiona la lógica de los Modelos de Lenguaje de Gran Escala (LLM) y la implementación del sistema RAG (Retrieval-Augmented Generation).

## 🏗️ Arquitectura de Clases
Para garantizar la escalabilidad entre distintos clientes (Bancos, Estudios Contables, etc.), hemos implementado un modelo de **Herencia de Clases**:

1.  **`BaseRAG` (Clase Madre):** Define la infraestructura común. Gestiona la conexión con Ollama, la configuración del modelo y los métodos genéricos de búsqueda vectorial.
2.  **Clases Hijas (Específicas):** Localizadas en `/clientes`. Heredan de la madre pero personalizan el `System Prompt`, las rutas de sus documentos en `/RAG-docs/Silver` y su base de datos vectorial exclusiva.

## 📂 Estructura de Subcarpetas
* **`01_Ingesta`**: Scripts y Notebooks para transformar documentos en vectores.
* **`02_Prompts`**: Gestión de plantillas de instrucciones para el modelo.
* **`03_Evaluacion`**: Pruebas de alucinación y calidad de respuesta.
* **`clientes/`**: Definiciones específicas para cada caso de uso.

## 🚀 Cómo usar
Para lanzar un asistente específico, basta con importar su clase:
```python
from clientes.banco_x import ClienteBancoX
bot = ClienteBancoX()
bot.responder("¿Cuál es el protocolo de seguridad?")