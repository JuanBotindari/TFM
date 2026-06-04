import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { message, history } = await req.json();

    // URL de tu servicio Python (FastAPI/Flask) que corre Ollama/RAG
    // Por defecto usamos localhost si estás corriendo el backend localmente
    const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://127.0.0.1:8000/api/chat';

    try {
      const response = await fetch(PYTHON_BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          org_id: "org-banco",
          message: message,
          history: history,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData?.detail || errorData?.message || 'Error interno en el servidor de IA (Python).';
        return NextResponse.json({
          role: 'assistant',
          content: `Error del motor de IA: ${errorMsg}`,
          sources: []
        }, { status: response.status });
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError) {
      console.error('Error connecting to Python backend:', fetchError);
      return NextResponse.json({
        role: 'assistant',
        content: 'Error: No se pudo conectar con el motor de IA (Python). Asegúrate de que el servicio esté corriendo en el puerto 8000.',
        sources: []
      }, { status: 503 });
    }

  } catch (error) {
    console.error('Chat API Error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
