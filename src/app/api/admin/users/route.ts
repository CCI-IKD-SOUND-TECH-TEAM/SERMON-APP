import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify user is admin
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fetch emails using Admin API
  const admin = createAdminClient();
  const { data: authUsers, error: authError } = await admin.auth.admin.listUsers();
  if (authError) return NextResponse.json({ error: authError.message }, { status: 500 });

  // Merge emails into profiles
  const merged = profiles.map(p => {
    const au = authUsers.users.find(u => u.id === p.id);
    return { ...p, email: au?.email };
  });

  return NextResponse.json(merged);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify caller is admin
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { email, role } = await request.json();
  if (!email || !role) return NextResponse.json({ error: 'Missing email or role' }, { status: 400 });

  const admin = createAdminClient();
  
  // 1. Invite user
  const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email);
  if (inviteError) {
    console.error('Invite error:', inviteError);
    const status = inviteError.status || 500;
    let message = inviteError.message;
    if (status === 429) message = 'Rate limit exceeded. Please wait a moment before sending more invitations.';
    else if (status === 422 || message.includes('already registered')) message = 'This user is already registered or has a pending invitation.';
    
    return NextResponse.json({ error: message }, { status });
  }

  // 2. Update their profile role to what was requested
  const { error: profileError } = await admin
    .from('profiles')
    .update({ role })
    .eq('id', inviteData.user.id);
    
  if (profileError) {
    console.error('Profile update error:', profileError);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
