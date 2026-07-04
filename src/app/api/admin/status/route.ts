import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * PATCH /api/admin/status
 * Update the status of a sermon or album.
 * Body: { kind: 'sermon' | 'album', id: string, status: string }
 */
export async function PATCH(request: Request) {
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { kind, id, status } = body;

  if (!kind || !id || !status) {
    return NextResponse.json({ error: 'Missing kind, id, or status' }, { status: 400 });
  }

  const table = kind === 'sermon' ? 'sermons' : 'photo_albums';

  const { error } = await supabase
    .from(table)
    .update({ status })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
