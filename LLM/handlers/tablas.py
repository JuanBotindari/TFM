"""
Handler: TABLAS
Responsabilidad: buscar datos precisos y estructurados en archivos CSV/TXT/MD
locales (módulos de tipo "tablas" del manifiesto rag.json) y generar una
respuesta contextualizada con el LLM.
"""
import os


class TablasHandler:
    """
    Maneja preguntas que requieren datos exactos de la base de datos estructurada
    (CUITs, saldos, pólizas, nombres técnicos, etc.).

    Expone dos métodos:
        - buscar(consulta)   → solo devuelve el texto encontrado (útil como fallback)
        - responder(pregunta) → busca + llama al LLM y hace streaming
    """

    def __init__(self, llm, chat_prompt, path_cliente: str, manifiesto: dict):
        self.llm          = llm
        self.chat_prompt  = chat_prompt
        self.path_cliente = path_cliente
        self.manifiesto   = manifiesto

    # ── búsqueda pura (sin LLM) ───────────────────────────────────────────────

    def buscar(self, consulta: str) -> str:
        """
        Busca la consulta en todos los archivos de tipo 'tablas' del manifiesto.
        Devuelve el bloque de texto encontrado o un mensaje de "no encontrado".
        """
        print(f"🛠️  [TABLAS] Buscando: '{consulta}'...")
        resultados = []

        for modulo in self.manifiesto.get("indice_conocimiento", {}).get("modulos", []):
            if modulo.get("tipo") != "tablas":
                continue

            dir_path = os.path.join(self.path_cliente, modulo.get("directorio"))
            if not os.path.exists(dir_path):
                continue

            for file in os.listdir(dir_path):
                if not file.endswith((".txt", ".md", ".csv")):
                    continue

                f_path = os.path.join(dir_path, file)
                with open(f_path, "r", encoding="utf-8", errors="ignore") as f:
                    cuerpo = f.read()

                if consulta.lower() in cuerpo.lower():
                    pos   = cuerpo.lower().find(consulta.lower())
                    start = max(0, pos - 1000)
                    end   = pos + 3000
                    resultados.append(f"ORIGEN: {file}\nDATOS:\n{cuerpo[start:end]}")

        return "\n".join(resultados) if resultados else "No se hallaron coincidencias en las tablas físicas."

    # ── respuesta completa (búsqueda + LLM) ──────────────────────────────────

    def responder(self, pregunta: str):
        """
        Busca en tablas usando la pregunta como término y genera respuesta en streaming.
        Yields fragmentos de texto (str).
        """
        datos = self.buscar(pregunta)

        prompt_mensajes = self.chat_prompt.format_messages(
            context=f"DATOS OBTENIDOS DE LAS TABLAS DE NEGOCIO:\n{datos}",
            pregunta=pregunta,
        )

        for chunk in self.llm.stream(prompt_mensajes):
            yield chunk.content
