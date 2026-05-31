"""
Handler: VECTOR_STORE (RAG) — búsqueda en Supabase pgvector.
"""
import re


class VectorStoreHandler:
    SCORE_CERCANO_L2     = 16.5
    SCORE_REGULAR_L2     = 19.0
    SCORE_CERCANO_COSINE = 0.75
    SCORE_REGULAR_COSINE = 0.50
    TOP_K_FETCH          = 10
    TOP_K_USAR           = 5

    def __init__(self, llm, chat_prompt, vector_store, tablas_handler=None, tracer=None, org_id=""):
        self.llm            = llm
        self.chat_prompt    = chat_prompt
        self.vector_store   = vector_store
        self.tablas_handler = tablas_handler
        self.tracer         = tracer
        self.org_id         = org_id

    def _t(self, titulo: str, detalle: str | None = None):
        if self.tracer:
            self.tracer.paso(titulo, detalle)

    def _filtro_org(self) -> dict | None:
        return {"org_id": self.org_id} if self.org_id else None

    def _buscar_con_scores(self, pregunta: str) -> list:
        filtro = self._filtro_org()
        if hasattr(self.vector_store, "similarity_search_with_score"):
            try:
                return self.vector_store.similarity_search_with_score(
                    pregunta, k=self.TOP_K_FETCH, filter=filtro,
                )
            except NotImplementedError:
                pass
        if hasattr(self.vector_store, "similarity_search_with_relevance_scores"):
            try:
                return self.vector_store.similarity_search_with_relevance_scores(
                    pregunta, k=self.TOP_K_FETCH, filter=filtro,
                )
            except NotImplementedError:
                pass
        docs = self.vector_store.similarity_search(pregunta, k=self.TOP_K_FETCH, filter=filtro)
        return [(d, 0.0) for d in docs]

    def responder(self, pregunta: str):
        self._t(
            "RAG — búsqueda semántica en Supabase",
            f"Tabla vectorial, org_id={self.org_id or '—'}, top_k={self.TOP_K_FETCH}",
        )

        docs_scores = self._buscar_con_scores(pregunta)
        self._t("RAG — resultados de similitud", self._formatear_scores(docs_scores))

        docs_validos = [doc for doc, _ in docs_scores[:self.TOP_K_USAR]]
        if docs_validos:
            contexto_rag = "\n\n".join(
                [f"[{d.metadata.get('source', '?')}] {d.page_content}" for d in docs_validos]
            )
            fuentes = ", ".join(d.metadata.get("source", "?") for d in docs_validos)
            self._t(
                f"RAG — contexto ensamblado ({len(docs_validos)} chunks)",
                f"Fuentes: {fuentes}",
            )
        else:
            contexto_rag = "NO SE DETECTÓ CONOCIMIENTO RELEVANTE PARA ESTA PREGUNTA."
            self._t("RAG — sin contexto relevante", None)

        self._t("RAG — primera llamada al LLM", None)
        prompt_mensajes = self.chat_prompt.format_messages(context=contexto_rag, pregunta=pregunta)
        respuesta_ia = self.llm.invoke(prompt_mensajes)

        self._t(
            "RAG — salida del LLM (borrador)",
            respuesta_ia.content[:500] + ("…" if len(respuesta_ia.content) > 500 else ""),
        )

        match = re.search(r"\[USAR_TABLA:\s*(.*?)\]", respuesta_ia.content)
        if match and self.tablas_handler:
            termino = match.group(1).strip()
            self._t("RAG → TABLA (fallback)", f"Término: '{termino}'")
            datos_tablas = self.tablas_handler.buscar(termino)
            contexto_enriquecido = (
                contexto_rag + f"\n\nDATOS OBTENIDOS DE LAS TABLAS DE NEGOCIO:\n{datos_tablas}"
            )
            self._t("RAG — segunda llamada al LLM (streaming)", None)
            prompt_actualizado = self.chat_prompt.format_messages(
                context=contexto_enriquecido, pregunta=pregunta
            )
            for chunk in self.llm.stream(prompt_actualizado):
                yield chunk.content
        else:
            yield respuesta_ia.content

    def _formatear_scores(self, docs_scores: list) -> str:
        if not docs_scores:
            return "(sin resultados)"
        usa_cosine = all(0 <= s <= 1 for _, s in docs_scores)
        lineas = []
        for doc, score in docs_scores:
            if usa_cosine:
                estado = (
                    "✅ CERCANO" if score >= self.SCORE_CERCANO_COSINE
                    else "⚠️ REGULAR" if score >= self.SCORE_REGULAR_COSINE
                    else "❌ LEJOS"
                )
            else:
                estado = (
                    "✅ CERCANO" if score < self.SCORE_CERCANO_L2
                    else "⚠️ REGULAR" if score < self.SCORE_REGULAR_L2
                    else "❌ LEJOS"
                )
            lineas.append(
                f"[{doc.metadata.get('source', '?')}] score={score:.4f} ({estado})"
            )
        return "\n".join(lineas)
