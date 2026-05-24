# Guía de Administración RAG - Gestión de Clientes

Esta carpeta contiene la base de conocimiento segmentada por clientes. Cada cliente sigue una arquitectura estandarizada para garantizar que el LLM mantenga su identidad y acceda a la información de forma eficiente mediante Chunks y Embeddings.

## 1. Estructura Estándar por Cliente
Cada carpeta de cliente (ej: `client-banco`) debe tener esta estructura:

```text
nombre-cliente/
├── config/                  # Metadatos e Identidad
│   ├── settings.json        # Configuración unificada (cliente, LLM, índice, reglas)
│   └── info_cliente.pdf     # Documento maestro (Identidad Core)
├── data/                    # Archivos Crudos
│   ├── pdfs/                # PDFs organizados por subtemas
│   ├── tablas/              # Excels/CSVs
│   └── web/                 # Scrappings
└── db/                      # (opcional / legado) — la base vectorial vive en Supabase
```

## 2. Configuración del cliente (`config/settings.json`)
Es el "cerebro" del cliente. Define:
*   **Identidad**: Nombre, sector y el rol que debe adoptar el LLM.
*   **Reglas de Oro**: Comportamientos obligatorios (ej: "siempre citar fuente").
*   **Índice Semántico**: Mapea qué hay en cada carpeta de `data/` para que el LLM sepa dónde buscar.

## 3. Flujo de Gestión de Archivos
Para que un archivo sea "leído" por el sistema, debe seguir este proceso:

1.  **Carga**: Se coloca el archivo en `data/pdfs/[subtema]/`.
2.  **Registro**: Se asegura que el subtema esté declarado en `settings.json` → `indice_conocimiento`.
3.  **Procesamiento**: Al iniciar el LLM se conecta a la tabla Supabase `database_vector_<cliente>`. Si tiene vectores para el `org_id`, los reutiliza; si no, indexa desde `document_chunks` (o PDFs locales) y escribe en Supabase. Crear/comprobar tablas: `LLM/tools/sql/setup_vector_tables.sql` y `verify_vector_setup.sql` (SQL Editor de Supabase).

## 4. Cómo dar de alta un Nuevo Cliente
1.  Copia la carpeta `client-banco` y cámbiale el nombre.
2.  Limpia las carpetas de `data/` y `db/`.
3.  Actualiza `config/settings.json` con la nueva identidad y reglas.
4.  Coloca el PDF de información general en `config/info_cliente.pdf`.
5.  ¡Listo! El sistema orquestador reconocerá al nuevo cliente automáticamente.
