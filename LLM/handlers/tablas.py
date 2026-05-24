"""
Handler: TABLAS
"""
import os


class TablasHandler:

    def __init__(self, llm, chat_prompt, path_cliente: str, config: dict, tracer=None):
        self.llm          = llm
        self.chat_prompt  = chat_prompt
        self.path_cliente = path_cliente
        self.config       = config
        self.tracer       = tracer

    def buscar(self, consulta: str) -> str:
        if self.tracer:
            self.tracer.paso("TABLAS — búsqueda en archivos locales", f"Término: '{consulta}'")

        resultados = []
        archivos_revisados = []

        for modulo in self.config.get("indice_conocimiento", {}).get("modulos", []):
            if modulo.get("tipo") != "tablas":
                continue

            dir_path = os.path.join(self.path_cliente, modulo.get("directorio"))
            if not os.path.exists(dir_path):
                continue

            for file in os.listdir(dir_path):
                if not file.endswith((".txt", ".md", ".csv")):
                    continue
                archivos_revisados.append(file)

                f_path = os.path.join(dir_path, file)
                with open(f_path, "r", encoding="utf-8", errors="ignore") as f:
                    cuerpo = f.read()

                if consulta.lower() in cuerpo.lower():
                    pos   = cuerpo.lower().find(consulta.lower())
                    start = max(0, pos - 1000)
                    end   = pos + 3000
                    resultados.append(f"ORIGEN: {file}\nDATOS:\n{cuerpo[start:end]}")

        if self.tracer:
            detalle = f"Archivos revisados: {', '.join(archivos_revisados) or '(ninguno)'}\n"
            detalle += f"Coincidencias: {len(resultados)}"
            self.tracer.paso("TABLAS — resultado de búsqueda", detalle)

        return "\n".join(resultados) if resultados else "No se hallaron coincidencias en las tablas físicas."

    def responder(self, pregunta: str):
        if self.tracer:
            self.tracer.paso("TABLAS — flujo completo", "Búsqueda + LLM con datos estructurados.")

        datos = self.buscar(pregunta)

        if self.tracer:
            preview = datos[:400] + ("…" if len(datos) > 400 else "")
            self.tracer.paso("TABLAS — contexto para el LLM", preview)

        prompt_mensajes = self.chat_prompt.format_messages(
            context=f"DATOS OBTENIDOS DE LAS TABLAS DE NEGOCIO:\n{datos}",
            pregunta=pregunta,
        )

        if self.tracer:
            self.tracer.paso("TABLAS — generando respuesta (streaming)", None)

        for chunk in self.llm.stream(prompt_mensajes):
            yield chunk.content
