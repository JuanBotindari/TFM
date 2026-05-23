"""
Handler: VECTOR_STORE (RAG)
Responsabilidad: buscar en la base vectorial (Chroma) los fragmentos más
relevantes de los documentos indexados y generar una respuesta contextualizada.
"""
import re


class VectorStoreHandler:
    """
    Maneja preguntas que requieren búsqueda semántica en documentos
    (PDFs, políticas, manuales, etc.) indexados en la base vectorial.

    Flujo:
        1. similarity_search en Chroma
        2. Construir contexto RAG con los chunks más cercanos
        3. Invocar LLM con contexto
        4. Si el LLM emite [USAR_TABLA: x], delegar a TablasHandler (fallback)
    """

    # Umbral L2: el modelo multilingüe oscila entre ~10 y ~20+
    SCORE_CERCANO  = 16.5
    SCORE_REGULAR  = 19.0
    TOP_K_FETCH    = 10   # cuántos docs traemos para comparar
    TOP_K_USAR     = 5    # cuántos usamos como contexto

    def __init__(self, llm, chat_prompt, vector_store, tablas_handler=None):
        self.llm            = llm
        self.chat_prompt    = chat_prompt
        self.vector_store   = vector_store
        self.tablas_handler = tablas_handler  # inyectado para el fallback [USAR_TABLA]

    def responder(self, pregunta: str):
        """
        Ejecuta la búsqueda vectorial y genera la respuesta en streaming.
        Yields fragmentos de texto (str).
        """
        # 1. Búsqueda con scores para diagnóstico
        docs_scores = self.vector_store.similarity_search_with_score(pregunta, k=self.TOP_K_FETCH)
        self._log_scores(pregunta, docs_scores)

        # 2. Quedarse con los mejores chunks
        docs_validos = [doc for doc, _ in docs_scores[:self.TOP_K_USAR]]

        if docs_validos:
            contexto_rag = "\n\n".join(
                [f"[{d.metadata['source']}] {d.page_content}" for d in docs_validos]
            )
        else:
            contexto_rag = "NO SE DETECTÓ CONOCIMIENTO RELEVANTE PARA ESTA PREGUNTA."

        # 3. Primera llamada al LLM (sin streaming para detectar [USAR_TABLA])
        prompt_mensajes = self.chat_prompt.format_messages(context=contexto_rag, pregunta=pregunta)
        respuesta_ia = self.llm.invoke(prompt_mensajes)

        print(f"\n🧠 [RAG RAW OUTPUT]:\n{'-'*40}\n{respuesta_ia.content}\n{'-'*40}")

        # 4. ¿El LLM pide datos de tablas como fallback?
        match = re.search(r"\[USAR_TABLA:\s*(.*?)\]", respuesta_ia.content)

        if match and self.tablas_handler:
            termino = match.group(1).strip()
            print(f"🔄 [RAG → TABLA fallback] El LLM solicitó datos de tabla: '{termino}'")
            datos_tablas = self.tablas_handler.buscar(termino)
            contexto_enriquecido = (
                contexto_rag + f"\n\nDATOS OBTENIDOS DE LAS TABLAS DE NEGOCIO:\n{datos_tablas}"
            )
            prompt_actualizado = self.chat_prompt.format_messages(
                context=contexto_enriquecido, pregunta=pregunta
            )
            for chunk in self.llm.stream(prompt_actualizado):
                yield chunk.content
        else:
            yield respuesta_ia.content

    # ── utilidades internas ───────────────────────────────────────────────────

    def _log_scores(self, pregunta: str, docs_scores: list):
        print(f"\n🤔 ANALIZANDO PREGUNTA (RAG): \"{pregunta}\"")
        print("   > CERCANÍA CON DOCUMENTOS (Score L2):")
        for doc, score in docs_scores:
            if score < self.SCORE_CERCANO:
                estado = "✅ CERCANO"
            elif score < self.SCORE_REGULAR:
                estado = "⚠️ REGULAR"
            else:
                estado = "❌ LEJOS"
            print(f"     - [{doc.metadata['source']}]: {score:.4f} ({estado})")
