import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

// Maps org IDs to the folder names in RAG-docs
const ORG_FOLDER_MAP: Record<string, string> = {
  'org-banco':   'client-banco',
  'org-estudio': 'client-contable',
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get('orgId');

  if (!orgId) {
    return NextResponse.json({ error: 'orgId param is required' }, { status: 400 });
  }

  const folder = ORG_FOLDER_MAP[orgId];
  if (!folder) {
    return NextResponse.json({ error: `No config found for orgId: ${orgId}` }, { status: 404 });
  }

  try {
    const filePath = join(process.cwd(), 'RAG-docs', folder, 'config', 'settings.json');
    const raw = readFileSync(filePath, 'utf-8');
    const settings = JSON.parse(raw);

    return NextResponse.json({
      orgId,
      sql_config: settings.sql_config ?? { templates: [], schema_fallback: {} },
    });
  } catch (err) {
    console.error('Error reading client settings:', err);
    return NextResponse.json({ error: 'Could not read client configuration' }, { status: 500 });
  }
}
