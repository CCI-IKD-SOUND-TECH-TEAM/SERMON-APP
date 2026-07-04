import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/albums/[id]
 * Get a single published album with all its photos.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('photo_albums')
    .select('*, photos(*)')
    .eq('id', id)
    .eq('status', 'published')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Album not found' }, { status: 404 });
  }

  // Sort photos by sort_order
  if (data.photos) {
    data.photos.sort(
      (a: { sort_order: number }, b: { sort_order: number }) =>
        a.sort_order - b.sort_order,
    );
  }

  return NextResponse.json(data);
}
