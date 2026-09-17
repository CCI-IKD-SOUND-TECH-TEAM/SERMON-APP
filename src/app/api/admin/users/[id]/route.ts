import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const adminCheck = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (adminCheck.data?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();

  if (user.id === id && body.role !== undefined && body.role !== 'admin') {
    return NextResponse.json({ error: 'Cannot downgrade your own account' }, { status: 400 });
  }
  if (user.id === id && body.active === false) {
    return NextResponse.json({ error: 'Cannot deactivate your own account' }, { status: 400 });
  }

  if (typeof body.active === 'boolean') {
    const admin = createAdminClient();
    const { error: banError } = await admin.auth.admin.updateUserById(id, {
      ban_duration: body.active ? 'none' : '876000h', // ~100 years — Supabase's own convention for an indefinite ban
    });
    if (banError) return NextResponse.json({ error: banError.message }, { status: 500 });
  }

  if (body.role === undefined) {
    const { data } = await supabase.from('profiles').select().eq('id', id).single();
    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ role: body.role })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const adminCheck = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (adminCheck.data?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (user.id === id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
