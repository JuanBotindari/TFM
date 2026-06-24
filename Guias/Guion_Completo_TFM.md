# Trabajo de Fin de Máster - Documentación Exhaustiva para Página de Presentación (PTCH)

*Nota: Este documento está diseñado para ser el contenido íntegro y exhaustivo de la "Página de Presentación" web del TFM. Cada sección desglosa al milímetro la arquitectura, las decisiones de diseño y el código implementado.*

---

## 1. Introducción: El Valor Estratégico del Dato y las Limitaciones de la IA Comercial

En el contexto organizacional contemporáneo, los datos y el conocimiento derivados de su análisis han adquirido una relevancia estratégica equiparable a la de los activos tradicionales. Las organizaciones los conciben como recursos clave para la mejora del desempeño, la innovación y la competitividad. Como señalan diversos estudios (Mikalef et al., 2020; Côrte-Real et al., 2016), los datos han dejado de ser un subproducto operativo para convertirse en un **activo organizacional central**. 

Sin embargo, el valor de estos datos no se manifiesta por su mera acumulación, sino por la capacidad de transformarlos en **conocimiento accionable**. Las empresas se enfrentan hoy a un desafío crítico: la información está severamente fragmentada. Por un lado, poseen conocimiento no estructurado encapsulado en normativas, PDFs y complejos diccionarios de datos (modelos de seguros y contables). Por otro lado, manejan métricas estructuradas en bases de datos relacionales.

Intentar capitalizar estos activos intangibles utilizando Inteligencia Artificial Comercial (como ChatGPT o Claude) plantea dos problemas insalvables:
1. **Privacidad y Continuidad del Negocio:** Subir datos financieros o confidenciales a servidores de terceros vulnera la integridad y privacidad del dato.
2. **Alucinaciones:** Los Modelos Fundacionales (LLMs) están pre-entrenados con datos públicos. Desconocen el contexto privado de la compañía, lo que genera respuestas matemáticamente plausibles pero factualmente incorrectas al carecer de anclaje con la realidad corporativa.

El objetivo de este Trabajo de Fin de Máster ha sido el diseño y construcción de una plataforma B2B SaaS híbrida orientada a la **gestión del conocimiento organizacional mediante inteligencia artificial generativa**. Una solución que despliega una arquitectura **RAG (Retrieval-Augmented Generation)** para la comprensión de documentos corporativos, y **Text-to-SQL** para consultas analíticas sobre bases de datos. Todo ello bajo una arquitectura de **Inquilino Múltiple (Multi-Tenant)** y ejecutando modelos Open-Source en local para garantizar la soberanía total sobre estos activos estratégicos.

*(Añadir aquí diagrama `tfm_flujo.jpg.jpg` para mostrar la visión del usuario final)*

---

## 2. Arquitectura Base y Seguridad: Multi-Tenancy y RBAC

Para que esta plataforma sea un producto B2B viable, el primer pilar es la seguridad y el aislamiento de la información. Un cliente (Empresa A) jamás debe tener acceso a los documentos ni a las tablas de bases de datos de otro cliente (Empresa B). A esto se le conoce como prevención del **Cross-Tenant Data Leakage**.

### Gestión de Identidad en el Edge (Clerk)
Hemos descartado sistemas de autenticación básicos para integrar **Clerk**, una solución Auth moderna compatible con arquitecturas Edge. La autenticación ocurre en el middleware de Next.js antes de que la página llegue a renderizarse. Se implementó un flujo completo permitiendo tanto el acceso por Email con verificación, como por credenciales clásicas.

### Control de Acceso Basado en Roles (RBAC)
Clerk emite un Token JWT que incluye `publicMetadata`. En este objeto almacenamos dos variables críticas: el `orgId` (Identificador de la organización del usuario) y el `role` (`admin`, `editor`, `viewer`).
Para mantener consistencia en la base de datos, hemos programado un hook especializado en React (`AuthContext.tsx`). Cuando un usuario inicia sesión, este contexto captura el JWT y realiza una operación `upsert` contra la tabla `user_profiles` de **Supabase**, sincronizando el rol y la organización en nuestra base de datos relacional.

### Filtrado en la Capa de Presentación
Esta arquitectura de roles condiciona por completo la Interfaz de Usuario. Si un usuario tiene el rol de `viewer`, la capa de Next.js re-renderiza el DOM para bloquear y ocultar funcionalidades críticas en el Gestor Documental. Un usuario raso puede consultar a la IA, pero no tiene permisos ni los botones habilitados para subir nuevos diccionarios de datos ni para eliminar archivos del entorno corporativo.

---

## 3. Ingeniería de Datos: Ingesta, Chunking y Bases de Datos Vectoriales

El conocimiento de la IA no es mágico; requiere un pipeline de Ingesta de Datos (Data Ingestion Pipeline) sumamente robusto.

### Parseo y Fragmentación (Chunking)
El usuario "Admin" accede a nuestra pestaña de Documentación y sube archivos de alta complejidad (por ejemplo, los diccionarios de datos Excel del modelo de Seguros y Contable). El backend no puede enviar un Excel entero a un LLM. Por tanto, aplicamos un script ETL que extrae el texto de estos documentos y lo formatea en estructuras JSON legibles.
Dado que los LLMs tienen una "ventana de contexto" limitada, aplicamos un proceso de **Chunking** (fragmentación semántica). Dividimos los textos masivos en pequeños bloques de información que mantienen el contexto original.

### Generación de Embeddings (Ollama)
Una vez fragmentados, estos textos deben ser comprensibles para la máquina. Hacemos una llamada a la API local de **Ollama**, utilizando modelos específicos de vectorización. El modelo lee el texto en lenguaje natural y lo transforma en un vector matemático, específicamente un array de **768 dimensiones**.

### Almacenamiento y Búsqueda de Similitud (pgvector)
Estos vectores, junto con sus metadatos (a qué `orgId` pertenecen, tamaño del archivo original, fecha de subida), se almacenan en Supabase. Sin embargo, PostgreSQL no entiende de vectores por defecto. Para ello, hemos activado y configurado la extensión nativa **`pgvector`**. 
Cuando el usuario le hace una pregunta al Chat, convertimos su pregunta a otro vector de 768 dimensiones y ejecutamos en Supabase un **Cosine Similarity Search** (búsqueda de similitud de cosenos). La base de datos calcula qué fragmentos matemáticos están más cerca de la pregunta y nos devuelve únicamente los párrafos exactos que contienen la respuesta, descartando miles de páginas irrelevantes.

*(Añadir aquí diagrama `diagrama_embeddings.jpg` mostrando el pipeline de ETL a Vector)*

---

## 4. El Cerebro: El Patrón "Intent Router" en Python

Cuando un usuario escribe "Dime las vacaciones que me corresponden" o "Dame las ventas del Q3", el sistema no sabe a priori si debe leer un documento o consultar una tabla SQL. Para solucionarlo, hemos construido un motor de enrutamiento basado en Inteligencia Artificial.

### Refactorización y Patrón Single Responsibility
El corazón de nuestro backend en Python (FastAPI) es la clase `BaseModelLLM/base_llm.py`. Inicialmente, este archivo manejaba toda la lógica, lo cual generaba un código monolítico e inescalable. Aplicando principios de ingeniería de software (SOLID), refactorizamos esta clase para convertirla en un **Intent Router**.

El LLM actúa como un despachador. Evalúa semánticamente el prompt del usuario y decide la "Intención". Según esta decisión, el enrutador invoca a la clase *Handler* especializada correspondiente, instanciadas en el método `_inicializar_handlers()`:
- `VectorStoreHandler` (RAG): Se activa para recuperar documentos y manuales.
- `TablasHandler` (SQL): Se activa para análisis cuantitativo.
- `DirectoHandler` / `InternetHandler` / `OtroHandler`: Para consultas generales, charlas casuales o búsquedas web.

De esta forma, el flujo de ejecución queda completamente aislado, permitiendo depurar, mejorar y testear cada ruta de la IA de manera independiente.

*(Añadir aquí diagrama `baseLLM.jpg` mostrando la ramificación abstracta del código)*

---

## 5. El Flujo Text-to-SQL y el Bypass Seguro de PGRST202

La rama más compleja de la plataforma es la democratización de la base de datos mediante la generación de SQL dinámica (Text-to-SQL). Si el *Intent Router* deriva la petición al `TablasHandler`, se inicia el siguiente protocolo:

### Inyección Dinámica de Esquemas (Schema Prompting)
El LLM no sabe qué tablas tiene la Empresa A. Para evitar cruces de datos, hemos descentralizado la configuración. El frontend Next.js lee archivos estáticos (`tableSchemas.ts` y el fallback `settings.json`) específicos para el `orgId` activo. Esta información (nombres de tablas, tipos de columnas, relaciones) se envía al backend y se inyecta en el "System Prompt" de Ollama. De este modo, la IA genera código SQL puro perfectamente adaptado a la arquitectura de ese cliente.

### Reto Crítico de Seguridad: El Error de PostgREST
Durante el desarrollo, nos enfrentamos a un muro arquitectónico. Al intentar que el backend ejecutara la "Raw SQL Query" generada por el LLM a través de la API REST estándar de Supabase, el sistema nos devolvía sistemáticamente el error de seguridad **PGRST202**. Esto ocurre porque el motor Row-Level Security (RLS) de PostgREST bloquea consultas crudas y dinámicas para evitar vulnerabilidades masivas de inyección SQL.

### La Solución: Remote Procedure Calls (RPC)
Para sortear este problema sin comprometer la seguridad, nos vimos obligados a programar a bajo nivel en la propia base de datos PostgreSQL de Supabase. Desarrollamos y desplegamos una función SQL personalizada (`public.execute_sql`). 
En lugar de enviar la query generada por la IA como un string malicioso, nuestro backend de Python invoca de forma segura esta función RPC. La base de datos recibe el código, lo ejecuta en un entorno controlado bajo los privilegios estrictos de ese usuario, y devuelve los resultados (las filas de la base de datos) formateadas de forma segura en un archivo JSON puro. Este JSON es el que el LLM lee finalmente para redactar una respuesta humana y ejecutiva para el usuario.

---

## 6. Resolución de Problemas de Infraestructura y UI

Un proyecto full-stack conlleva retos operativos más allá del Machine Learning.

### Hydration Mismatch en Next.js 14
A nivel de Interfaz de Usuario, adoptar el nuevo *App Router* de Next.js nos generó severos errores de **Hydration Mismatch**. El servidor de Vercel pre-renderizaba una versión del menú lateral (sidebar) sin autenticación, mientras que el navegador del cliente, al tener la cookie de Clerk, intentaba renderizar los avatares y roles. Esta colisión de estados en el `RootLayout` colapsaba la aplicación. Tuvimos que unificar el manejo de estados asíncronos y refactorizar el código duplicado para asegurar que la hidratación de React fluyera de forma síncrona.

### Infraestructura de Red Híbrida: El Túnel Bypassing NAT
El mayor logro técnico para la viabilidad comercial del proyecto ha sido la topología de red. 
Alquilar GPUs en la nube para alojar nuestros modelos de IA costaría cientos de euros mensuales. La decisión fue mantener el Frontend alojado en Vercel (Cloud), pero ejecutar el Backend de Inteligencia Artificial (FastAPI + Ollama) en Hardware Local (On-Premise).

Esto generó un problema crítico de conectividad: el entorno Serverless de Vercel no podía comunicarse con nuestra red local debido a los firewalls y al NAT de los routers, arrojando errores HTTP 503 y 404 constantes. Adicionalmente, el ruteo asíncrono de Next.js requirió un rediseño del archivo de compilación `vercel.json` para permitir tiempos de espera largos.

La solución definitiva consistió en levantar un túnel reverso seguro mediante **Pinggy / Ngrok**. Establecimos un dominio estático y lo inyectamos como variable de entorno (`PYTHON_BACKEND_URL`) en Vercel. Todo el tráfico que el usuario genera en la nube viaja cifrado a través de este túnel, saltando el firewall y golpeando directamente en el puerto local de nuestro servidor Uvicorn/Python.
Con esta arquitectura, logramos una latencia ínfima, escalabilidad en la nube, coste cero en servidores GPU, y **soberanía absoluta sobre el Hardware y el Dato corporativo**.

*(Añadir aquí diagrama `Diagrama de Red e Infraestructura.jpg`)*

---

## 7. Conclusiones y Futuro de la Plataforma

Este Trabajo de Fin de Máster ha culminado en una plataforma productiva que trasciende el concepto de "chatbot". Hemos diseñado una Arquitectura Empresarial completa.

**Logros Alcanzados:**
- Aislamiento absoluto de datos por cliente (Multi-Tenant).
- Motor IA Híbrido: Comprensión semántica (RAG) y razonamiento matemático (Text-to-SQL).
- Despliegue de red asimétrico Nube-Local para el ahorro de costes y privacidad del 100%.
- Gobernanza de roles y ejecución segura en bases de datos PostgreSQL.

**Trabajo Futuro (Next Steps):**
La arquitectura de microservicios establecida permite la evolución directa hacia dos grandes tendencias de la industria:
1. **Modelos de Agentes Autónomos (Agentic AI):** Otorgar capacidades al Intent Router no solo para hacer consultas `SELECT` a la base de datos, sino para ejecutar operaciones de escritura (`UPDATE`, `INSERT`), permitiendo a la IA rellenar formularios, agendar reuniones o enviar correos electrónicos corporativos.
2. **Fine-Tuning de Modelos Abiertos:** Optimizar los modelos de la familia Llama o Mistral que corren en Ollama, entrenándolos exhaustivamente con el vocabulario técnico específico de los diccionarios de seguros o contables, reduciendo aún más los tiempos de inferencia en hardware local.
