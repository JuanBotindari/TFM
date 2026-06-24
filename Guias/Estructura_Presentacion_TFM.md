# Estructura Definitiva de la Presentación TFM (Nivel Máster)

**Metodología de Exposición:**
*   **H1 (El Título de la Diapositiva):** Formal, académico, orientado al valor del producto. Se lee en 2 segundos.
*   **H2 (El Discurso de la Diapositiva):** Lo que vas a contar en voz alta. Conceptos teóricos e hitos importantes. 
*   **H3 (El Backup Técnico):** Tus apuntes ocultos. Todo el código, librerías, y "tripas" del proyecto. Solo lo sacas si el tribunal te acribilla a preguntas técnicas.

---

# H1: Introducción y Motivación del Proyecto
*   **H2:** El reto de los "Silos de Información" corporativa.
    *   **H3:** Las empresas sufren porque tienen el conocimiento fragmentado (PDFs, manuales) por un lado, y los datos numéricos (Bases de datos) por otro.
*   **H2:** Limitaciones de las IAs comerciales (ChatGPT, Claude).
    *   **H3:** Falta de contexto corporativo privado (alucinaciones) y problemas legales por enviar datos sensibles de empresas a APIs públicas de terceros.
*   **H2:** Propuesta de Valor del TFM.
    *   **H3:** Un asistente SaaS multi-tenant que unifica ambas ramas (RAG para documentos y Text-to-SQL para bases de datos), operando de forma 100% privada con modelos open-source en local.

# H1: Arquitectura Base y Seguridad (Multi-Tenant)
*   **H2:** Aislamiento de Organizaciones (Cero Fugas de Datos).
    *   **H3:** Hemos diseñado un sistema Multi-Tenant nativo. Al hacer login, el sistema filtra qué tablas y qué archivos puede ver el usuario gracias al contexto dinámico basado en un identificador único de organización (`orgId`).
*   **H2:** Gestión de Identidad y Control de Roles (RBAC).
    *   **H3:** Integración de **Clerk** en el middleware de Next.js (Edge computing) para Auth. Hemos creado un hook personalizado (`AuthContext.tsx`) que sincroniza el JWT de Clerk con la tabla `user_profiles` de **Supabase**. Dependiendo del rol (`viewer` o `admin`), la UI bloquea acciones como borrar archivos o hacer consultas destructivas.

# H1: Ingesta de Datos y Búsqueda Semántica
*   **H2:** Transformación de la Información Cruda.
    *   **H3:** Nuestro Frontend cuenta con un gestor documental con metadatos en tiempo real (tamaño, fecha). Al subir un Excel/PDF, el backend lo parsea (de Excel a diccionarios JSON) y lo somete a un proceso de "Chunking" (división semántica).
*   **H2:** Espacios Latentes y Búsqueda Vectorial.
    *   **H3:** Usamos la API de Ollama para traducir los fragmentos a vectores de **768 dimensiones**. Estos vectores se guardan en Supabase usando la extensión nativa **`pgvector`**. Cuando el usuario pregunta, hacemos una búsqueda matemática de similitud (`Cosine Similarity`) para extraer los párrafos exactos que contienen la respuesta.

# H1: Motor de Inteligencia Artificial (El Cerebro)
*   **H2:** El patrón de enrutamiento inteligente.
    *   **H3:** El LLM no procesa todo a lo bruto. Hemos programado en Python (FastAPI) un **"Intent Router"** mediante la clase abstracta `BaseModel`. El sistema evalúa semánticamente el prompt y decide a qué clase Handler enviar el trabajo (`VectorStoreHandler` para PDFs, o `TablasHandler` para bases de datos), respetando el Single Responsibility Principle.
*   **H2:** Generación Aumentada por Recuperación (RAG).
    *   **H3:** Consolidamos los fragmentos extraídos de Supabase y los inyectamos en la ventana de contexto del LLM local, garantizando una respuesta totalmente determinista y anclada a la realidad corporativa.

# H1: Análisis de Datos Dinámico (Text-to-SQL)
*   **H2:** Democratización del Dato (Natural Language to SQL).
    *   **H3:** Si el usuario quiere métricas, el backend intercepta su petición e inyecta dinámicamente un diccionario con los esquemas de bases de datos exactos de su empresa (desde `tableSchemas.ts` y `settings.json`).
*   **H2:** Gobernanza y Ejecución Segura en la Base de Datos.
    *   **H3 (CLAVE):** Para evitar que el LLM devuelva sentencias SQL que den errores de permisos por Row-Level Security (el temido `PGRST202` de PostgREST), programamos un Remote Procedure Call (RPC) en la base de datos PostgreSQL (`public.execute_sql`). Esto nos permite ejecutar código dinámico generado por la IA de forma aislada y devolver los resultados estructurados en un JSON puro.

# H1: Retos Críticos de Ingeniería Superados
*   **H2:** Desafíos en el Desarrollo Frontend (Next.js 14).
    *   **H3:** Superamos problemas complejos del ciclo de vida de React, específicamente un error de `Hydration Mismatch` provocado por componentes que renderizaban diferente en servidor y cliente dentro del `RootLayout`.
*   **H2:** Desafíos de Enrutamiento y Despliegue en la Nube.
    *   **H3:** Solucionamos un error 404 persistente en el entorno serverless de Vercel configurando correctamente el archivo `vercel.json` y las rutas API para permitir ruteo asíncrono hacia el backend (`/api/chat`).

# H1: Arquitectura de Infraestructura Híbrida (Cierre)
*   *Aquí presentaremos los diagramas de arquitectura de Miro.*
*   **H2:** El reto de conectar la nube con el hardware local.
    *   **H3:** Nuestra UI vive en Vercel (Cloud), pero nuestro cerebro vive en un servidor Python local (On-Premise) para ahorrar los altísimos costes de inferencia de IA.
*   **H2:** Bypassing the NAT (El Túnel).
    *   **H3:** Para que Vercel se comunique con nuestra casa sin abrir puertos en el router, levantamos un túnel reverso seguro TCP/HTTP con **Pinggy / Ngrok** en la variable `PYTHON_BACKEND_URL`, logrando latencias mínimas y total soberanía de los datos.

# H1: Demostración Práctica (La Demo)
*   **H2:** Casos de uso reales de la plataforma.
    *   **H3:** En esta fase, mostraremos en vivo el funcionamiento de la plataforma. Veremos cómo un usuario "Admin" puede subir un documento (RAG pipeline) y cómo cualquier usuario puede utilizar el chat para consultar información semántica de ese documento, así como lanzar consultas SQL dinámicas al Dashboard.

# H1: Conclusiones y Trabajo Futuro
*   **H2:** Cumplimiento de objetivos iniciales.
    *   **H3:** Hemos logrado desarrollar un SaaS B2B completo, seguro y escalable. Superamos las limitaciones de las IAs comerciales, construyendo un entorno Multi-Tenant con Cero Fugas de Datos y total soberanía del hardware.
*   **H2:** Escalabilidad y Próximos pasos (Future Work).
    *   **H3:** Como siguientes pasos naturales para la plataforma, se propone la implementación de "Agentes Autónomos" (Agentic AI) capaces de escribir y modificar datos en BBDD (no solo leer), y aplicar técnicas de Fine-Tuning a los modelos de Ollama para especializarlos en nichos concretos (Legal, Salud, Finanzas).
