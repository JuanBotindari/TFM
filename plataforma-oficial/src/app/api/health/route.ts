import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://127.0.0.1:8000/api/chat';
    const HEALTH_URL = PYTHON_BACKEND_URL.replace('/api/chat', '/api/health');

    const response = await fetch(HEALTH_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Evitar almacenamiento en caché para obtener estados en tiempo real
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({
        status: 'unhealthy',
        error: `Error en la respuesta del backend de Python: ${response.statusText}`
      }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Health check API Error:', error);
    return NextResponse.json({
      status: 'unhealthy',
      error: 'No se pudo conectar con el motor de IA (Python) en el puerto 8000.',
      details: error.message
    }, { status: 503 });
  }
}
