'use server';

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendResp = await fetch('http://127.0.0.1:8000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await backendResp.json();
    if (!backendResp.ok) {
      return NextResponse.json({ error: data?.error || 'Chat backend error' }, { status: backendResp.status });
    }
    return NextResponse.json(data);
  } catch (e: any) {
    console.error('Chat proxy error:', e);
    return NextResponse.json({ error: 'Failed to contact Python backend' }, { status: 500 });
  }
}
