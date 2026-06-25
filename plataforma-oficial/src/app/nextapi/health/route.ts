import { NextResponse } from 'next/server';

/**
 * Construye la URL del health endpoint del backend Python según el entorno.
 */
function getPythonHealthUrl(): string {
  // 1. Si el usuario definió explícitamente la URL, derivar el health desde ahí
  if (process.env.PYTHON_BACKEND_URL) {
    return process.env.PYTHON_BACKEND_URL.replace(/\/api\/chat$/, '/api/health');
  }

  // 2. En Vercel: usar la URL del deployment
  if (process.env.VERCEL_URL) {
    const protocol = process.env.VERCEL_URL.startsWith('localhost') ? 'http' : 'https';
    return `${protocol}://${process.env.VERCEL_URL}/api/health`;
  }

  // 3. Fallback local
  return 'http://127.0.0.1:8000/api/health';
}

export async function GET() {
  try {
    const HEALTH_URL = getPythonHealthUrl();
    console.log(`[Health Route] Checking Python backend: ${HEALTH_URL}`);

    const response = await fetch(HEALTH_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Bypass-Tunnel-Reminder': 'true'
      },
      // Evitar almacenamiento en caché para obtener estados en tiempo real
      cache: 'no-store',
    });

    if (!response.ok) {
      const rawBody = await response.text().catch(() => '');
      let errorMsg = '';
      try {
        const parsed = JSON.parse(rawBody);
        errorMsg = parsed?.detail || parsed?.message || '';
      } catch {}

      return NextResponse.json({
        status: 'unhealthy',
        error: `Error en la respuesta del backend de Python (${response.status}): ${response.statusText}`,
        details: errorMsg || rawBody.substring(0, 300) || 'Sin respuesta'
      }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Health check API Error:', error);
    return NextResponse.json({
      status: 'unhealthy',
      error: 'No se pudo conectar con el motor de IA (Python).',
      details: error.message
    }, { status: 503 });
  }
}
