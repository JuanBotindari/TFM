import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Construye la URL del backend Python según el entorno:
 * - En Vercel: usa la URL del propio deployment + /pyapi/chat
 * - En local: usa localhost:8000 + /pyapi/chat
 */
function getPythonBackendUrl(): string {
  // 1. Si el usuario definió explícitamente la URL, usarla tal cual
  if (process.env.PYTHON_BACKEND_URL) {
    return process.env.PYTHON_BACKEND_URL;
  }

  // 2. En Vercel: usar la URL del deployment (VERCEL_URL se setea automáticamente)
  if (process.env.VERCEL_URL) {
    const protocol = process.env.VERCEL_URL.startsWith('localhost') ? 'http' : 'https';
    return `${protocol}://${process.env.VERCEL_URL}/api/chat`;
  }

  // 3. Fallback local
  return 'http://127.0.0.1:8000/api/chat';
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { message, history, orgId } = await req.json();

    const PYTHON_BACKEND_URL = getPythonBackendUrl();
    console.log(`[Chat Route] Connecting to Python backend: ${PYTHON_BACKEND_URL}`);

    try {
      const response = await fetch(PYTHON_BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Bypass-Tunnel-Reminder': 'true'
        },
        body: JSON.stringify({
          org_id: orgId || "org-estudio",
          message: message,
          history: history,
        }),
      });

      if (!response.ok) {
        let rawBody = '';
        let errorMsg = '';
        try {
          rawBody = await response.text();
          const parsed = JSON.parse(rawBody);
          errorMsg = parsed?.detail || parsed?.message || '';
        } catch {
          // No es un JSON o falló la lectura
        }

        const displayMsg = errorMsg 
          ? errorMsg 
          : `El servidor Python [${PYTHON_BACKEND_URL}] respondió con código ${response.status} (${response.statusText}). Cuerpo: ${rawBody.substring(0, 300) || '(vacío)'}`;

        return NextResponse.json({
          role: 'assistant',
          content: `Error del motor de IA: ${displayMsg}`,
          sources: []
        }, { status: response.status });
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError: any) {
      console.error('Error connecting to Python backend:', fetchError);
      return NextResponse.json({
        role: 'assistant',
        content: `Error: No se pudo conectar con el motor de IA (Python). URL destino: ${PYTHON_BACKEND_URL}. Detalle: ${fetchError.message}`,
        sources: []
      }, { status: 503 });
    }

  } catch (error) {
    console.error('Chat API Error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
