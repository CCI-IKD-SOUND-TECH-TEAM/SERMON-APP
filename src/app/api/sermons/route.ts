import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/sermons
 * List published sermons. Supports query params:
 *   - search: free text search on title, speaker, description, tags
 *   - series: filter by series_id
 *   - speaker: filter by speaker name
 *   - tag: filter by tag (can repeat)
 *   - limit: max results (default 50)
 *   - offset: pagination offset
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const seriesId = searchParams.get('series');
  const speaker = searchParams.get('speaker');
  const tags = searchParams.getAll('tag');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  const supabase = await createClient();

  let query = supabase
    .from('sermons')
    .select('*, series(*), sermon_files:sermon_files(*)', { count: 'exact' })
    .eq('status', 'published')
    .order('sermon_date', { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,speaker.ilike.%${search}%,description.ilike.%${search}%`,
    );
  }

  if (seriesId) {
    query = query.eq('series_id', seriesId);
  }

  if (speaker) {
    query = query.ilike('speaker', `%${speaker}%`);
  }

  if (tags.length > 0) {
    query = query.overlaps('tags', tags);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sermons: data ?? [], total: count ?? 0 });
}
