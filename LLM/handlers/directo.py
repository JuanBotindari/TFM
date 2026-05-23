"""
Handler: DIRECTO
Responsabilidad: responder preguntas simples que el LLM puede contestar
por sí mismo sin consultar ninguna fuente de datos externa.
"""


class DirectoHandler:
    """
    Maneja preguntas que no requieren búsqueda externa.
    El LLM responde con su conocimiento general, usando el prompt del sistema
    del agente para mantener el tono y las reglas de negocio.
    """

    def __init__(self, llm, chat_prompt):
        self.llm = llm
        self.chat_prompt = chat_prompt

    def responder(self, pregunta: str):
        """
        Genera una respuesta directa haciendo streaming.
        Yields fragmentos de texto (str).
        """
        print("💬 [DIRECTO] Respondiendo con conocimiento general del LLM...")

        prompt_mensajes = self.chat_prompt.format_messages(
            context="No se necesita contexto externo para esta pregunta.",
            pregunta=pregunta,
        )

        for chunk in self.llm.stream(prompt_mensajes):
            yield chunk.content
