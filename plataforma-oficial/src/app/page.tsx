import { Send, Bot } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-900">
      {/* HEADER: Identidad corporativa */}
      <header className="p-4 bg-white border-b shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">TFM-Chat</h1>
            <span className="text-xs text-green-500 font-medium italic">En línea - Modelo Local Phi-3</span>
          </div>
        </div>
      </header>

      {/* CHAT CONTAINER: Donde aparecerán los mensajes */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl w-full mx-auto">
        <div className="bg-blue-100 p-4 rounded-2xl rounded-tl-none max-w-[80%] shadow-sm">
          <p className="text-sm">
            ¡Hola! Soy el asistente de <strong>TFM-Chat</strong>. ¿En qué puedo ayudarte hoy? 
            Puedo orientarte con el organigrama, tickets o dudas técnicas.
          </p>
        </div>
      </main>

      {/* INPUT AREA: El cuadro para escribir */}
      <footer className="p-4 bg-white border-t">
        <div className="max-w-3xl mx-auto flex gap-2">
          <input 
            type="text" 
            placeholder="Escribe tu consulta aquí..."
            className="flex-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors">
            <Send size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
}