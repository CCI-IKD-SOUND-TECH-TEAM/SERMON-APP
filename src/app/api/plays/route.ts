import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * POST /api/plays
 * Records one confirmed listen (~30s+) of a sermon. Public, anonymous —
 * the site has no member login. RLS restricts this to published sermons
 * only (see supabase/migrations/20240101000003_sermon_plays.sql).
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const sermonId = body?.sermonId;

  if (typeof sermonId !== 'string' || !UUID_RE.test(sermonId)) {
    return NextResponse.json({ error: 'Invalid sermonId' }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from('sermon_plays').insert({ sermon_id: sermonId });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
