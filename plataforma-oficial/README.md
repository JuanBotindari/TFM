This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```


prompt para v0.dev


Básicamente estamos desarrollando LLm con Rag para que empresas pequeñas cómo grandes puedan guardar:
- documentos con informacion de la actividad y empresa
- imagenes y organigramas de la empresa
- tablas con data, productos, proveedores, etc


COmentarios adicionales:
- NExt.js
- necesito que la web sea lo mas dinamica, y hecha como si fueran diseñadores de super calidad y que estuvieron en cada detalle durante horas. QUiero detalles super. Como si fueran graficos de calidad maxima en un videojuego
- vamos a tener varias empresas que dentro tendran varios usuario (cada empresa tendra un admin y varios usuario, y esos usuarios pueden tener diferentes roles por ejemplo editor, viewer)
- necesito que sea una web bien bonita, moderna y las animaciones SUPER fluidas, elegantes y que sea extremadamente profesional. Me refiero a animaciones que llamen la atencion de una manera u otra pero que sean muy agradables de ver.
- actualmente tengo 2 clientes: "estudio contable" y  "banco S"
- vamos a trabajar con base de datos supabase, por favor crea tablas que creas que son necesarias. No te olvides que vamos a tener las entidades empresa y usuario, y que la empresa va a poder tener varios usuarios, no te olvides de los roles admin, editor, viewer y que el rol admin puede crear, editar y eliminar usuarios y roles, 
- supabase para base de datos



como estoy pensando la estructura de paginas (cada uno es una pagina, no una seccion):

Para los usuarios que no estan logueados:

pagina inicial
- about us
- prices (aca son las suscripciones con 3 opciones)
- contact
- presentacion (esta pagina es la que vamos a usar para cuando queremos venderle a clientes, el diseño tiene que ser muy profesional, osea un diseño nivel marketing).
- login/register (cuando se le de click a esto, tiene que haber una opcion que permita elegir si es empresa o usuario, y que redirija al login o register de ese tipo. No te olvides que tiene que haber 3 roles diferentes admin, editor, viewer. Por ahora solo trabaja con empresa/usuarios. No te olvides que empresa va a poder tener varios usuarios.) Ademas, tiene uqe haber una opcion donde se ponga algo asi como "login_personalizado" y que redirija al login para un usuario personalizado para que la gente que quiera investigar 

Para los usuarios que estan logueados:
- pagina inicial logueados (donde tienen que tener un menu con "inicio" y "cerrar sesion"). Ver cosas generales que quiera el usuario etc. No te olvides que tiene que ser lo mas profesional y elegante posible. Tiene que estar dividido en varias secciones por ejemplo para empresas y para usuarios, osea que si un usuario es empresa tiene que ver las opciones de empresa y si es usuario tiene que ver las opciones de usuario. Ademas tiene que tener el header y footer de la plataforma, no te olvides de eso. El header y el footer tiene que estar en todas las paginas, por supuesto. Si esta logueado, debe tener un boton a la izquierda que despliegue el menu lateral de la izquierda donde estarian el resto de paginas una vez loguedas (la barra lateral izquierda debe ser fluida, suave y profesional y estar en todo el resto de paginas). Este menu lateral se puede desplegar (para que aparezcan los iconos de la izquierda con su descripcion) o aplastarlos contra la izquierda (donde ahi solo aparecerian los iconos y no su texto)
- dashboard (editable por cada usuario)
- pagina donde estara el chat
- pagina ingresar documentos e informacion (esta sera compleja porque tambien se puede subir info a las tablas ademas de documentos)
- pagina para hacer querys sql
- pagina de control de usuarios de la empresa (solo visible para los admins de esa empresa)
- pagina de control de documentos e tablas existentes de esa empresa (para que puedan manejar si un usuario peude ver mas o menos)




Estilo general:


### **SECTION: VISUAL IDENTITY & DESIGN SYSTEM (UI/UX)**

**1. Reference-Based Aesthetics:**
* **Landing Page Structure (`theme_landingpage.jpg`):** Replicate the "Soft Enterprise" look. Use large radial mesh gradients in the background (soft blues and whites). Hero typography must be bold, using **Geist Sans**, with wide-rounded corner cards (24px) for feature highlights.
* **Light Dashboard (`theme_logueado_light_desplegado.jpg`):** Use this for the "Light Mode" workspace. Implement a clean, card-based **Bento Grid** for analytics and stats. The sidebar should be pure white with subtle $1px$ borders (`border-slate-200`) and minimalist icons.
* **AI Chat Interface (`theme_logueado_dark_chatllm.jpg`):** This is the core reference for the RAG interaction. The chat input must be a **floating pill-shaped textarea** with internal buttons for "Attach", "Search", and "Model Selection". Below the input, include quick-action "pills" (e.g., "Analyze Table", "Summarize PDF").
* **Dark Dashboard & Sidebar (`theme_logueado_dark_colapsado.jpg`):** Replicate the deep-toned sidebar and the high-contrast blue action buttons. Use the "collapsed" sidebar state with tooltips for a "Pro" feel.

**2. Multi-Theme Engine (The Three Modes):**
The system must support an instant toggle between three distinct professional themes:
* **Mode 1: "Enterprise Light"** (Reference: `theme_logueado_light_desplegado.jpg` / `theme_logueado_dark_vs_light.jpg` left side). Background: `#F8FAFC`. Cards: `White`. Borders: `Slate-200`. Primary Accent: `Blue-600`.
* **Mode 2: "Sophisticated Grey"** (Reference: `theme_logueado_dark_vs_light.jpg` right side). Background: `#111111` (Zinc-950). Cards: `#18181B`. Borders: `#27272A`. This is the default for high-focus work.
* **Mode 3: "Midnight Blue/Black"** (Reference: `theme_logueado_dark_colapsado.jpg`). Background: `#000000` (Pure Black). Cards: `#0A0A0A` with a subtle blue glow or outer-shadow. Accents: `Vibrant Blue` (`#3b82f6`).

**3. Specific UI Components:**
* **The "Knowledge Base" Table:** Inspired by the user table in `theme_logueado_dark_colapsado.jpg`, use a dark, sleek data table with row-hover highlights, pagination at the bottom, and status badges (e.g., "Indexed" in green, "Processing" in pulsing amber).
* **The AI Response Style:** When the LLM responds, it should render "Source Citations" as small translucent cards. If the response contains data, it must automatically render an **interactive Shadcn Data-Table** inside the chat bubble.
* **Animations:** Use **Framer Motion** for:
    * Smooth theme cross-fades.
    * Sidebar expansion/collapse with `spring` physics.
    * Bento-grid cards staggered entrance.

