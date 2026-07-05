'use server';

import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    let orgId = 'org-banco';
    try {
      const body = await request.json();
      if (body && body.orgId) {
        orgId = body.orgId;
      }
    } catch (e) {
      // Body might be empty or invalid JSON
    }

    // Fetch documents belonging to this organization
    const { data: docs, error } = await supabase
      .from('documents')
      .select('id, storage_path')
      .eq('org_id', orgId);

    if (error) throw error;

    // Call the Python backend to do the actual embedding generation
    const pythonApiUrl = process.env.NODE_ENV === 'development' 
      ? 'http://127.0.0.1:8000/api/embeddings/recompute' 
      : `${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/embeddings/recompute`;
      
    try {
      const pyRes = await fetch(pythonApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: orgId })
      });
      if (!pyRes.ok) {
        console.error('Python embedding recompute failed:', await pyRes.text());
      }
    } catch (e) {
      console.error('Could not reach Python API:', e);
    }

    return NextResponse.json({ success: true, recomputed: docs?.length ?? 0 });
  } catch (e) {
    console.error('Embedding recompute failed', e);
    return NextResponse.json({ error: 'Failed to recompute embeddings' }, { status: 500 });
  }
}
