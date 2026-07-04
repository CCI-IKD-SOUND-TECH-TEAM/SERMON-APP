import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/albums
 * List published photo albums with photo counts.
 */
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('photo_albums')
    .select('*, photos(count)')
    .eq('status', 'published')
    .order('event_date', { ascending: false, nullsFirst: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Transform the count from the relation aggregate
  const albums = (data ?? []).map((album) => ({
    ...album,
    photo_count: album.photos?.[0]?.count ?? 0,
    photos: undefined, // remove the nested aggregate
  }));

  return NextResponse.json(albums);
}
