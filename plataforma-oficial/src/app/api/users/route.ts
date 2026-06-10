import { NextResponse } from 'next/server';

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

export async function GET() {
  if (!CLERK_SECRET_KEY) {
    return NextResponse.json({ error: 'CLERK_SECRET_KEY not configured' }, { status: 500 });
  }

  try {
    const res = await fetch('https://api.clerk.com/v1/users?limit=100&order_by=-created_at', {
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
      },
    });

    if (!res.ok) {
      const error = await res.text();
      console.error('Clerk API error:', error);
      return NextResponse.json({ error: 'Error fetching users from Clerk' }, { status: res.status });
    }

    const clerkUsers = await res.json();

    // Map Clerk users to our User interface
    const users = clerkUsers.map((u: any) => ({
      id: u.id,
      name: [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || 'Sin nombre',
      email: u.email_addresses?.[0]?.email_address || `${u.username || 'user'}@tfm.local`,
      username: u.username || null,
      role: (u.public_metadata?.role as string) || 'viewer',
      orgId: (u.public_metadata?.orgId as string) || 'org-banco',
      avatar: u.image_url || '',
      joinedAt: new Date(u.created_at).toISOString(),
      hasPassword: u.password_enabled,
      emailVerified: u.email_addresses?.[0]?.verification?.status === 'verified',
    }));

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
