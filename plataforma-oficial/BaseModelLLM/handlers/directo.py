"""
Handler: DIRECTO
"""


class DirectoHandler:

    def __init__(self, llm, chat_prompt, tracer=None):
        self.llm         = llm
        self.chat_prompt = chat_prompt
        self.tracer      = tracer

    def responder(self, pregunta: str):
        if self.tracer:
            self.tracer.paso(
                "DIRECTO — respuesta sin fuentes externas",
                "El LLM responde solo con su prompt de sistema (streaming).",
            )

        prompt_mensajes = self.chat_prompt.format_messages(
            context="No se necesita contexto externo para esta pregunta.",
            pregunta=pregunta,
        )

        for chunk in self.llm.stream(prompt_mensajes):
            yield chunk.content
