import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET() {
  try {
    const debugInfo: any = {
      cwd: process.cwd(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL_URL: process.env.VERCEL_URL,
        PYTHON_BACKEND_URL: process.env.PYTHON_BACKEND_URL,
      },
      dirStructure: {},
    };

    // Escanear el directorio de trabajo actual
    try {
      debugInfo.dirStructure['cwd'] = fs.readdirSync(process.cwd());
    } catch (e: any) {
      debugInfo.dirStructure['cwd_err'] = e.message;
    }

    // Escanear el directorio raíz del proyecto (.next/.. etc)
    try {
      debugInfo.dirStructure['parent'] = fs.readdirSync(path.join(process.cwd(), '..'));
    } catch (e: any) {
      debugInfo.dirStructure['parent_err'] = e.message;
    }

    // Buscar si existe la carpeta api y su contenido
    const possibleApiPaths = [
      path.join(process.cwd(), 'api'),
      path.join(process.cwd(), 'plataforma-oficial', 'api'),
      path.join(process.cwd(), '..', 'api'),
      path.join(process.cwd(), '..', 'plataforma-oficial', 'api'),
    ];

    debugInfo.apiChecks = {};
    for (const p of possibleApiPaths) {
      try {
        const exists = fs.existsSync(p);
        debugInfo.apiChecks[p] = {
          exists,
          contents: exists ? fs.readdirSync(p) : null
        };
      } catch (e: any) {
        debugInfo.apiChecks[p] = { error: e.message };
      }
    }

    return NextResponse.json(debugInfo);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
