"""
Handler: INTERNET
Responsabilidad: buscar información actualizada en internet y generar
una respuesta contextualizada.

⚠️  PENDIENTE DE IMPLEMENTACIÓN
    Este handler está reservado para una búsqueda web (ej. SerpAPI, Tavily,
    DuckDuckGo, etc.). Por ahora informa al usuario que la funcionalidad
    no está disponible y delega la respuesta al LLM sin contexto externo.
"""


class InternetHandler:
    """
    Handler placeholder para búsqueda en internet.
    Se implementará en una iteración futura del proyecto.
    """

    def __init__(self, llm, chat_prompt, tracer=None):
        self.llm         = llm
        self.chat_prompt = chat_prompt
        self.tracer      = tracer

    def responder(self, pregunta: str):
        if self.tracer:
            self.tracer.paso(
                "INTERNET — no implementado",
                "Fallback: el LLM responde sin búsqueda web real.",
            )

        aviso = (
            "[Nota interna: La búsqueda en internet no está disponible aún. "
            "Responde con tu conocimiento general y avisa al usuario si la "
            "información puede estar desactualizada.]\n"
        )

        prompt_mensajes = self.chat_prompt.format_messages(
            context=aviso,
            pregunta=pregunta,
        )

        for chunk in self.llm.stream(prompt_mensajes):
            yield chunk.content
