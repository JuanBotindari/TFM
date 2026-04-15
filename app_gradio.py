"""
app_gradio.py — Interfaz de chat con RAG para el TFM.
Compatible con Gradio 6.x.

Uso:
    uv run python app_gradio.py

Requisitos:
    pip install gradio pypdf langchain-ollama langchain-core python-dotenv
"""

import sys
import os

# ── Asegurar que el proyecto esté en el Python path ───────────────────────────
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

import gradio as gr
from LLM.clientes.banco import ClienteBanco
from LLM.clientes.estudio_contable import ClienteEstudioContable

# ── Estado global ─────────────────────────────────────────────────────────────
_modelos: dict = {}      # cache: evita recargar si ya fue inicializado
_modelo_activo = None    # instancia activa en cada momento

CLIENTES = {
    "🏦 Banco": "banco",
    "📊 Estudio Contable": "contable",
}


# ── Lógica de carga ───────────────────────────────────────────────────────────

def cargar_cliente(nombre_cliente: str) -> str:
    """Instancia el cliente seleccionado y carga su conocimiento en el LLM."""
    global _modelo_activo

    if not nombre_cliente:
        return " Selecciona un cliente primero."

    key = CLIENTES.get(nombre_cliente)

    if key in _modelos:
        _modelo_activo = _modelos[key]
        return f" {nombre_cliente} ya estaba cargado. Listo para chatear."

    try:
        if key == "banco":
            _modelo_activo = ClienteBanco()
        elif key == "contable":
            _modelo_activo = ClienteEstudioContable()
        else:
            return f" Cliente desconocido: {nombre_cliente}"

        _modelos[key] = _modelo_activo
        return f" {nombre_cliente} cargado correctamente. ¡Puedes empezar a chatear!"

    except Exception as e:
        return f" Error al cargar {nombre_cliente}:\n{e}"


# ── Chat con streaming (formato Gradio 6.x) ───────────────────────────────────
# Gradio 6.x usa lista de dicts: {"role": "user"|"assistant", "content": str}

def responder_stream(mensaje: str, historial: list):
    """Generador streaming compatible con Gradio 6.x (MessageDict format)."""
    global _modelo_activo

    if not mensaje.strip():
        yield historial
        return

    if _modelo_activo is None:
        aviso = " Primero selecciona y carga un cliente desde el panel de configuración."
        yield historial + [
            {"role": "user", "content": mensaje},
            {"role": "assistant", "content": aviso},
        ]
        return

    historial = historial + [
        {"role": "user",      "content": mensaje},
        {"role": "assistant", "content": ""},
    ]
    yield historial

    respuesta = ""
    try:
        for chunk in _modelo_activo.responder(mensaje):
            respuesta += chunk
            historial[-1]["content"] = respuesta
            yield historial
    except Exception as e:
        historial[-1]["content"] = f" Error al generar respuesta: {e}"
        yield historial


# ── CSS personalizado ─────────────────────────────────────────────────────────

CSS = """
#titulo    { text-align: center; padding: 12px 0 4px; }
#subtitulo { text-align: center; color: #64748b; margin-bottom: 8px; }
#sidebar   { background: #f1f5f9; border-radius: 14px; padding: 16px; }
footer     { display: none !important; }
"""

# ── Interfaz Gradio ───────────────────────────────────────────────────────────

with gr.Blocks(title="Asistente IA — TFM") as demo:

    # ── Cabecera ──────────────────────────────────────────────────────────────
    gr.Markdown("# Asistente IA con RAG", elem_id="titulo")
    gr.Markdown(
        "Selecciona el cliente, cárgalo y empieza a chatear con contexto.",
        elem_id="subtitulo",
    )

    with gr.Row(equal_height=False):

        # ── Panel lateral ─────────────────────────────────────────────────────
        with gr.Column(scale=1, min_width=240, elem_id="sidebar"):
            gr.Markdown("### ⚙️ Configuración")

            dropdown_cliente = gr.Dropdown(
                choices=list(CLIENTES.keys()),
                label="Cliente",
                value=None,
                interactive=True,
                info="Selecciona el perfil a activar",
            )

            btn_cargar = gr.Button(
                "🚀 Cargar Cliente",
                variant="primary",
                size="lg",
            )

            estado_carga = gr.Textbox(
                label="Estado del sistema",
                value="⏳ Esperando selección...",
                interactive=False,
                lines=3,
            )

            gr.Markdown("---")
            gr.Markdown(
                "**ℹ️ Cómo usar:**\n"
                "1. Selecciona un cliente\n"
                "2. Pulsa **Cargar Cliente**\n"
                "3. Espera la confirmación\n"
                "4. ¡Escribe tu consulta! "
            )

        # ── Área de chat ──────────────────────────────────────────────────────
        with gr.Column(scale=4):

            chatbot = gr.Chatbot(
                label="Chat",
                height=480,
                elem_id="chatbot",
                placeholder=(
                    "**Aquí aparecerá la conversación.**\n\n"
                    "Carga un cliente desde el panel izquierdo y empieza a preguntar."
                ),
                layout="bubble",
                buttons=["copy"],           # botón copiar por mensaje
            )

            with gr.Row():
                txt_mensaje = gr.Textbox(
                    placeholder="Escribe tu consulta y presiona Enter...",
                    show_label=False,
                    lines=2,
                    scale=5,
                )
                btn_enviar = gr.Button("▶ Enviar", variant="primary", scale=1)

            with gr.Row():
                btn_limpiar = gr.Button("🗑️ Limpiar chat", size="sm")

    # ── Callbacks ─────────────────────────────────────────────────────────────

    btn_cargar.click(
        fn=cargar_cliente,
        inputs=dropdown_cliente,
        outputs=estado_carga,
    )

    btn_enviar.click(
        fn=responder_stream,
        inputs=[txt_mensaje, chatbot],
        outputs=chatbot,
        queue=True,
    ).then(fn=lambda: "", outputs=txt_mensaje)

    txt_mensaje.submit(
        fn=responder_stream,
        inputs=[txt_mensaje, chatbot],
        outputs=chatbot,
        queue=True,
    ).then(fn=lambda: "", outputs=txt_mensaje)

    btn_limpiar.click(fn=lambda: [], outputs=chatbot, queue=False)


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    demo.queue()
    demo.launch(
        server_name="0.0.0.0",
        share=False,
        show_error=True,
    )
