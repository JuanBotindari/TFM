The Ultimate Prompt 

> "Build a full-stack, enterprise-grade SaaS platform named **'TFM-producto'** using **Next.js, Tailwind CSS, and Framer Motion**. The platform is an AI RAG (Retrieval-Augmented Generation) ecosystem designed for companies (such as banks and accounting firms) to manage and query their knowledge base (documents, images, org charts, and data tables).
>
> **1. OVERALL GOAL & VISUAL QUALITY:**
> - The application must be extremely dynamic, fluid, and elegant. I need premium, designer-level attention to detail, with smooth micro-interactions that grab attention professionally (akin to high-end video game UI quality).
> - **Database integration:** Use UI components and states ready to be hooked up to **Supabase**.
>
> **2. DATA ARCHITECTURE & ROLES (Mock Supabase):**
> - Structure the UI assuming two main entities: **Organizations (Companies)** and **Users**.
> - An organization has multiple users.
> - Role system: **Admin** (can create, edit, delete users/roles within their org), **Editor**, and **Viewer**.
> - Create UI states to simulate the necessary tables (profiles, organizations, documents, roles).
>
> **3. PUBLIC ROUTES (Unauthenticated Users):**
> - **Landing Page:** 'Soft Enterprise' design.
> - **About Us** & **Contact**.
> - **Pricing:** Subscription cards with 3 tiers (Basic, Pro, Enterprise).
> - **Presentation (Pitch Deck):** A pure marketing page aimed at closing corporate sales. Ultra-professional layout.
> - **Auth (Login/Register):** A clean modal or page. Users must be able to select whether they are logging in as a 'Company' or a 'User'. 
> - **Guest Login:** Include a 'Log in as Guest / Try Demo' button. This should route to a sandbox version of the dashboard where the user can explore specific features with strict **Read-Only** permissions (no modifications allowed).
>
> **4. PRIVATE ROUTES (Authenticated Users):**
> - **Global Layout:** Universal Header (with a 'Log out' button) and Footer.
> - **Smart Sidebar:** A fluid, professional left navigation menu. It must be toggleable between 'expanded' (icons + text) and 'collapsed' (icons only). Use Framer Motion for smooth state transitions.
> - **Conditional Rendering:** Dashboard options must adapt based on whether the logged-in user is an Organization Admin or a standard user.
> - **Internal Pages:**
>   - **Main Dashboard:** Overview layout (editable via widgets per user).
>   - **AI Chat Interface:** The core interactive LLM feature.
>   - **Knowledge Ingestion:** A complex page for uploading documents (PDFs, images) and data tables (CSVs).
>   - **SQL Queries UI:** Interface to query uploaded tables. **UI Logic:** If the user is an Admin, show execution and modification controls. If the user is an Editor, Viewer, or Guest, restrict the UI to a strict 'Read-Only' mode (SELECT queries only), completely hiding or disabling destructive actions.
>   - **User Management (Admin only):** Manage team members and assign roles.
>   - **Document Access Control:** Panel to manage which users have access to specific documents or tables.
>
> **5. VISUAL IDENTITY & DESIGN SYSTEM (Based on References):**
> - **Landing Page (`theme_landingpage.jpg`):** 'Soft Enterprise' style. Use soft radial mesh gradients in the background (blues and whites). Bold hero typography (**Geist Sans**) and cards with wide-rounded corners (24px) for features.
> - **Light Dashboard (`theme_logueado_light_desplegado.jpg`):** For the 'Light' mode. Implement a clean, card-based **Bento Grid** for analytics. The sidebar must be pure white with subtle $1px$ borders (`border-slate-200`) and minimalist icons.
> - **AI Chat Interface (`theme_logueado_dark_chatllm.jpg`):** The chat input must be a **floating pill-shaped textarea** with internal buttons for 'Attach', 'Search', and 'Model Selection'. Below the input, include quick-action pills (e.g., 'Analyze Table', 'Summarize PDF').
> - **Dark Dashboard (`theme_logueado_dark_colapsado.jpg`):** Replicate the deep-toned sidebar and high-contrast blue action buttons. Use tooltips for the collapsed sidebar state to give it a 'Pro' feel.
>
> **6. MULTI-THEME ENGINE:**
> The system must support an instant toggle between three professional themes:
> - **Mode 1: 'Enterprise Light'** (`theme_logueado_dark_vs_light.jpg` left side). Background: `#F8FAFC`. Cards: White. Borders: `Slate-200`. Accent: `Blue-600`.
> - **Mode 2: 'Sophisticated Grey'** (`theme_logueado_dark_vs_light.jpg` right side). Background: `#111111` (Zinc-950). Cards: `#18181B`. Borders: `#27272A`. Ideal for high-focus work.
> - **Mode 3: 'Midnight Blue/Black'** (`theme_logueado_dark_colapsado.jpg`). Background: `#000000` (Pure Black). Cards: `#0A0A0A` with a subtle blue outer-glow. Accent: `Vibrant Blue` (`#3b82f6`).
>
> **7. SPECIFIC COMPONENTS & ANIMATIONS:**
> - **Knowledge Base Table:** A dark, sleek data table with row-hover highlights, pagination, and status badges (e.g., 'Indexed' in green, 'Processing' in a pulsing amber).
> - **AI Responses:** RAG source citations must be rendered as small translucent cards. If the response contains data, automatically render an **interactive Shadcn Data-Table** inside the chat bubble.
> - **Framer Motion:** Use it for smooth cross-fades between themes, `spring` physics for the sidebar toggle, and staggered entrances for Bento Grid cards."

