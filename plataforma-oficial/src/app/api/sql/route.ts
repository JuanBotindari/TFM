'use server';

import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET: Return database schema (tables and columns) for public schema, excluding internal tables
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('table_name, column_name, data_type')
      .eq('table_schema', 'public')
      .not('table_name', 'in', "('documents','document_chunks','user_profiles')")
      .order('table_name')
      .order('ordinal_position');
    if (error) throw error;
    return NextResponse.json({ rows: data || [] }, { status: 200 });
  } catch (e) {
    console.error('Error fetching schema:', e);
    return NextResponse.json({ error: 'Failed to fetch schema' }, { status: 500 });
  }
}

// POST: Execute a simple SELECT query (read‑only) supplied in the request body.
export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query must be a non‑empty string' }, { status: 400 });
    }
    // Very basic safety: only allow SELECT statements
    const trimmed = query.trim().toUpperCase();
    if (!trimmed.startsWith('SELECT')) {
      return NextResponse.json({ error: 'Only SELECT queries are allowed' }, { status: 403 });
    }
    // Use Supabase RPC to run raw SQL (requires a Postgres function).
    // For the demo we will use a simple wrapper that returns an empty result set.
    // In a real implementation you would create a Postgres function like `execute_sql`.
    const { data, error } = await supabase.rpc('execute_sql', { sql: query });
    if (error) throw error;
    return NextResponse.json({ rows: data || [], cols: [] }, { status: 200 });
  } catch (e) {
    console.error('Error executing query:', e);
    return NextResponse.json({ error: 'Failed to execute query' }, { status: 500 });
  }
}
