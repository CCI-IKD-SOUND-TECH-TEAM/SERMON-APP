import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ContentRow } from '@/lib/types';

/**
 * GET /api/admin/content
 * List all content (sermons + albums) for the admin panel.
 */
export async function GET(request: Request) {

  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch sermons
  let sermonQuery = supabase
    .from('sermons')
    .select('id, title, sermon_date, status, series_id')
    .neq('status', 'archived')
    .order('created_at', { ascending: false });


  const { data: sermons, error: sermonError } = await sermonQuery;

  if (sermonError) {
    return NextResponse.json({ error: sermonError.message }, { status: 500 });
  }

  // Fetch albums
  let albumQuery = supabase
    .from('photo_albums')
    .select('id, title, event_date, status')
    .neq('status', 'archived')
    .order('created_at', { ascending: false });


  const { data: albums, error: albumError } = await albumQuery;

  if (albumError) {
    return NextResponse.json({ error: albumError.message }, { status: 500 });
  }

  const rows: ContentRow[] = [
    ...(sermons ?? []).map(
      (s): ContentRow => ({
        id: s.id,
        kind: 'sermon',
        title: s.title,
        type: 'Sermon',
        date: s.sermon_date,
        status: s.status,
        series_id: s.series_id,
      }),
    ),
    ...(albums ?? []).map(
      (a): ContentRow => ({
        id: a.id,
        kind: 'album',
        title: a.title,
        type: 'Album',
        date: a.event_date,
        status: a.status,
      }),
    ),
  ];

  // Sort by title
  rows.sort((a, b) => a.title.localeCompare(b.title));

  return NextResponse.json(rows);
}
