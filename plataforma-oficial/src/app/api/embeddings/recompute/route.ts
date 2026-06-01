'use server';

import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Fetch all documents (could filter by organization if needed)
    const { data: docs, error } = await supabase.from('documents').select('id, storage_path');
    if (error) throw error;

    // Placeholder: Iterate and log recompute action
    for (const doc of docs ?? []) {
      console.log('Recomputing embedding for document', doc.id);
      // TODO: integrate actual embedding generation and update the row with vector
    }

    return NextResponse.json({ success: true, recomputed: docs?.length ?? 0 });
  } catch (e) {
    console.error('Embedding recompute failed', e);
    return NextResponse.json({ error: 'Failed to recompute embeddings' }, { status: 500 });
  }
}
