import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'La consulta SQL está vacía.' }, { status: 400 });
    }

    // Construimos la URL de conexión a partir de las variables de entorno
    // db.wwnnrtuoomgjgdryxzks.supabase.co
    const dbPassword = process.env.CONTRA_SUPABASE || 'Puntadeleste4175!';
    const dbHost = 'db.wwnnrtuoomgjgdryxzks.supabase.co';
    const connectionString = `postgres://postgres:${encodeURIComponent(dbPassword)}@${dbHost}:5432/postgres?sslmode=require`;

    const client = new Client({
      connectionString,
      ssl: {
        rejectUnauthorized: false // Supabase requiere SSL pero no necesitamos verificar el certificado de CA localmente
      }
    });

    await client.connect();

    try {
      const res = await client.query({
        text: query,
        rowMode: 'array' // Retornar las filas como arrays para mantener el orden exacto de las columnas si es necesario, o formato estándar
      });

      // Si usamos rowMode: 'array', res.fields contiene la info de las columnas
      const cols = res.fields.map(field => field.name);
      
      // Mapeamos los arrays a objetos del tipo {colName: value} para que el frontend lo consuma fácilmente
      const formattedRows = res.rows.map(row => {
        const rowObj: Record<string, any> = {};
        cols.forEach((col, idx) => {
          rowObj[col] = row[idx];
        });
        return rowObj;
      });

      await client.end();

      return NextResponse.json({
        cols,
        rows: formattedRows,
        rowCount: res.rowCount
      });
    } catch (dbError: any) {
      await client.end();
      return NextResponse.json({ error: dbError.message }, { status: 400 });
    }

  } catch (error: any) {
    console.error('SQL API Error:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor.' }, { status: 500 });
  }
}
