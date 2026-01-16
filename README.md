# Flexi-RAG Platform 🤖📂

Plataforma inteligente de gestión del conocimiento basada en **RAG (Retrieval-Augmented Generation)**. Este proyecto está diseñado para democratizar el conocimiento técnico, preservar el activo intelectual y automatizar la asistencia técnica/administrativa en entornos corporativos (Banca y Estudios Contables).

## 🏗️ Estructura del Proyecto

El repositorio está organizado en módulos que separan la infraestructura, la lógica de IA y la interfaz de usuario:

* **`/docker-infra`**: Orquestación del entorno local. Contiene la configuración de **Ollama** para modelos locales (Phi-3/Llama3) y la persistencia de datos.
* **`/RAG-docs`**: El corazón del conocimiento. Dividido por clientes (Tenants) y niveles de validación (**Silver** para borradores, **Gold** para verdades oficiales).
* **`/LLM`**: El motor de inteligencia. Incluye scripts de ingesta de datos, gestión de prompts y el módulo de **Evaluación** para garantizar un *Hallucination Rate* < 10%.
* **`/plataforma-oficial`**: Aplicación web profesional construida con **Next.js 15**, **Vercel AI SDK** y **Clerk** para la gestión de roles (RBAC).
* **`/docs-TFM`**: Documentación académica, diagramas de arquitectura y análisis de caso de negocio (ROI y ahorro de horas-hombre).

## 🛠️ Stack Tecnológico

- **Modelos:** Ollama (Local), Phi-3 / Llama 3.
- **Backend/Ingesta:** Python, LangChain, Supabase (Vector Store).
- **Frontend:** Next.js 15 (App Router), Tailwind CSS.
- **Gobernanza:** Diccionarios de variables y esquemas de relaciones (Joins) centralizados.

## 🎯 Objetivos del Proyecto

1.  **Preservación del Conocimiento:** Evitar la pérdida de activo intelectual por rotación o jubilación.
2.  **Democratización Técnica:** Permitir que perfiles Junior respondan con la precisión de un experto Senior.
3.  **Gobernanza de Datos:** Implementar un control estricto sobre qué información utiliza la IA para responder mediante roles Silver y Gold.
4.  **Eficiencia Operativa:** Reducción drástica en los tiempos de respuesta de soporte técnico y administrativo.

---
© 2026 - TFM: Inteligencia Artificial Aplicada a la Gestión del Conocimiento.
