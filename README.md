# TFM: RAG Platform 🤖📂

Plataforma inteligente de gestión del conocimiento basada en **RAG (Retrieval-Augmented Generation)**. Este proyecto está diseñado para democratizar el conocimiento técnico, preservar el activo intelectual y automatizar la asistencia técnica/administrativa en entornos corporativos (Banca y Estudios Contables).

## 🏗️ Estructura del Proyecto

El repositorio está organizado en módulos que separan la infraestructura, la lógica de IA y la interfaz de usuario:

* **`/docker-infra`**: Orquestación del entorno local. Contiene la configuración de **Ollama** para modelos locales (Phi-3/Llama3) y la persistencia de datos.
* **`/docs-TFM`**: Documentación académica, diagramas de arquitectura y análisis de caso de negocio (ROI y ahorro de horas-hombre).
* **`Guias`**: Documentación y videos en caso de requerir ayudas.
* **`/LLM`**: El motor de inteligencia. Incluye scripts de ingesta de datos, gestión de prompts y el módulo de **Evaluación** para garantizar un *Hallucination Rate* < 10%.
* **`/plataforma-oficial`**: Aplicación web profesional construida con **Next.js 15**, **Vercel AI SDK** y **Clerk** para la gestión de roles (RBAC).
* **`/RAG-docs`**: El corazón del conocimiento. Dividido por clientes (Tenants) y niveles de validación (**Silver** para borradores, **Gold** para verdades oficiales).


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


## 🤖 TFM-WEB-Chat: Sistema de Inteligencia Centralizada

Bienvenido al repositorio oficial de **TFM-Chat**. Este proyecto es un Asistente Inteligente diseñado para asistir a clientes, capacitar empleados y preservar el activo intelectual de la organización.

### 🚀 Guía de Inicio Rápido (Paso a Paso)

Si es tu primera vez trabajando con Next.js 15 o acabas de recibir este código, sigue esta guía detallada para poner el sistema en marcha sin errores:

#### **Paso 1: Preparar el Motor (Node.js)**
Next.js necesita un entorno llamado **Node.js** para ejecutarse.
1. Descarga la versión **LTS** (la recomendada para estabilidad) en: [nodejs.org](https://nodejs.org/).
2. Instálalo como cualquier programa siguiendo los pasos del asistente.
3. Para verificar que quedó bien, abre una terminal (o consola) y escribe `node -v`. Deberías ver un número de versión (ej: `v22.18.0`).

#### **Paso 2: Permisos de Seguridad (Solo Windows)**
Por defecto, Windows bloquea la ejecución de scripts de programación. Debes habilitarlos una única vez en tu equipo:
1. Pulsa la tecla `Windows`, busca **"PowerShell"**, haz clic derecho y selecciona **"Ejecutar como administrador"**.
2. Copia y pega este comando:  
   `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
3. Presiona **Enter**. Cuando te pregunte, escribe la letra **`S`** y vuelve a presionar **Enter**. Ya puedes cerrar esa ventana.

#### **Paso 3: Abrir el Proyecto en VS Code**
1. Abre **Visual Studio Code**.
2. Ve al menú superior: `Archivo > Abrir carpeta` (File > Open Folder).
3. Busca y selecciona la carpeta raíz donde está este proyecto (donde ves el archivo README).
4. Abre la terminal interna de VS Code presionando `Ctrl + ñ` (o en el menú: `Terminal > Nueva Terminal`).

#### **Paso 4: Descargar las herramientas (Dependencias)**
En la terminal que acabas de abrir dentro de VS Code, escribe estos comandos uno por uno:
1. **Entrar a la carpeta del código:**
   ```bash
   cd plataforma-oficial


#### **Paso 5: Comandos de Consola para el Servidor**
Para trabajar en el proyecto, necesitas saber cómo encender y apagar el "motor" del chat:
1. **🟢 Para ENCENDER el servidor:**
   ```bash
   npm run dev

Espera a que la terminal diga ✓ Ready. Ahora el proyecto está funcionando localmente.

🌐 Para VER el proyecto: Abre tu navegador (Chrome, Edge, etc.) y escribe esta dirección:

👉 http://localhost:3000

🔴 Para APAGAR el servidor: Haz clic dentro de la terminal de VS Code y presiona las teclas Ctrl + C.

Si te pregunta "¿Desea terminar el trabajo (S/N)?", escribe S y pulsa Enter.
---

### 📂 Diccionario de Estructura de Proyecto

Para los nuevos integrantes, aquí explicamos qué hace cada pieza generada por el sistema:

| Carpeta / Archivo | ¿Qué es? | ¿Para qué sirve en TFM-Chat? |
| :--- | :--- | :--- |
| **`.next/`** | Carpeta de Compilación | Es donde Next.js guarda el código "listo para producción". **No se toca manualmente.** |
| **`node_modules/`** | Librerías Externas | Contiene todas las herramientas y paquetes que descargamos (como la IA). Es muy pesada. |
| **`public/`** | Archivos Estáticos | Aquí guardamos imágenes, logos y fuentes que cualquiera puede ver desde la web. |
| **`src/`** | **Código Fuente** | Es el corazón del proyecto. Aquí es donde escribiremos todo nuestro código. |
| **`src/app/`** | Sistema de Rutas | Aquí creamos las páginas (ej. la página del chat o del organigrama). |
| **`.gitignore`** | Filtro de Seguridad | Dice qué archivos NO deben subirse a GitHub (como contraseñas o carpetas pesadas). |
| **`next.config.ts`** | Configuración de Next | Ajustes técnicos del framework Next.js 15. |
| **`package.json`** | **El Mapa del Tesoro** | Contiene el nombre del proyecto, la versión y la lista de herramientas instaladas. |
| **`tsconfig.json`** | Reglas de TypeScript | Configura las reglas para que nuestro código no tenga errores de escritura. |
| **`tailwind.config.ts`** | Estilos Visuales | Configuración de los colores y el diseño de la interfaz del chat. |

---


---
© 2026 - TFM: Inteligencia Artificial Aplicada a la Gestión del Conocimiento.
