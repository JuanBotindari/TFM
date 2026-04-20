# Guía de Administración RAG - Gestión de Clientes

Esta carpeta contiene la base de conocimiento segmentada por clientes. Cada cliente sigue una arquitectura estandarizada para garantizar que el LLM mantenga su identidad y acceda a la información de forma eficiente mediante Chunks y Embeddings.

## 1. Estructura Estándar por Cliente
Cada carpeta de cliente (ej: `client-banco`) debe tener esta estructura:

```text
nombre-cliente/
├── config/                  # Metadatos e Identidad
│   ├── rag.json             # Manifiesto (Indice y Reglas)
│   ├── settings.json        # Configuración técnica (modelo, URL)
│   └── info_cliente.pdf     # Documento maestro (Identidad Core)
├── data/                    # Archivos Crudos
│   ├── pdfs/                # PDFs organizados por subtemas
│   ├── tablas/              # Excels/CSVs
│   └── web/                 # Scrappings
└── db/                      # Persistencia
    └── vector_store/        # Base de datos de vectores (ChromaDB/FAISS)
```

## 2. El Manifiesto (`config/rag.json`)
Es el "cerebro" del cliente. Define:
*   **Identidad**: Nombre, sector y el rol que debe adoptar el LLM.
*   **Reglas de Oro**: Comportamientos obligatorios (ej: "siempre citar fuente").
*   **Índice Semántico**: Mapea qué hay en cada carpeta de `data/` para que el LLM sepa dónde buscar.

## 3. Flujo de Gestión de Archivos
Para que un archivo sea "leído" por el sistema, debe seguir este proceso:

1.  **Carga**: Se coloca el archivo en `data/pdfs/[subtema]/`.
2.  **Registro**: Se asegura que el subtema esté declarado en el `rag.json`.
3.  **Procesamiento**: Al iniciar el sistema, el código detecta archivos nuevos, los divide en **Chunks** (trozos), genera **Embeddings** y los guarda en `db/vector_store/`.

## 4. Cómo dar de alta un Nuevo Cliente
1.  Copia la carpeta `client-banco` y cámbiale el nombre.
2.  Limpia las carpetas de `data/` y `db/`.
3.  Actualiza el `config/rag.json` con la nueva identidad y reglas.
4.  Coloca el PDF de información general en `config/info_cliente.pdf`.
5.  ¡Listo! El sistema orquestador reconocerá al nuevo cliente automáticamente.
