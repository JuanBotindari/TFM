"""
Handler: OTRO
Responsabilidad: manejar acciones que no encajan en las categorías
anteriores: cálculos, generación de código, invocación de herramientas
externas, flujos multi-paso, etc.

⚠️  PENDIENTE DE IMPLEMENTACIÓN
    Este handler actúa como punto de extensión para capacidades agénticas
    avanzadas. Por ahora responde con el LLM sin contexto adicional.
"""


class OtroHandler:
    """
    Handler placeholder para acciones no categorizadas (cálculos, código,
    agentes especializados, etc.).
    Se implementará en una iteración futura del proyecto.
    """

    def __init__(self, llm, chat_prompt):
        self.llm         = llm
        self.chat_prompt = chat_prompt

    def responder(self, pregunta: str):
        """
        Yields fragmentos de texto (str).
        Por ahora responde con el LLM sin contexto externo y registra
        que la pregunta cayó en la categoría OTRO para análisis posterior.
        """
        print("🔧 [OTRO] Acción no categorizada. Respondiendo con LLM general.")

        aviso = (
            "[Nota interna: Esta pregunta requiere un tipo de acción especial "
            "que aún no está implementada. Responde lo mejor que puedas con tu "
            "conocimiento general.]\n"
        )

        prompt_mensajes = self.chat_prompt.format_messages(
            context=aviso,
            pregunta=pregunta,
        )

        for chunk in self.llm.stream(prompt_mensajes):
            yield chunk.content
