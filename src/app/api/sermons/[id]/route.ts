import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/sermons/[id]
 * Get a single published sermon with its files and series info.
 * Also increments view_count.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('sermons')
    .select('*, series(*), sermon_files:sermon_files(*)')
    .eq('id', id)
    .eq('status', 'published')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Sermon not found' }, { status: 404 });
  }

  // Increment view count (fire-and-forget, don't block response)
  supabase
    .from('sermons')
    .update({ view_count: (data.view_count || 0) + 1 })
    .eq('id', id)
    .then(() => {});

  return NextResponse.json(data);
}
