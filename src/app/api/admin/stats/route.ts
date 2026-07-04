import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 1. Get counts
  const { count: sermonsCount } = await supabase.from('sermons').select('*', { count: 'exact', head: true });
  const { count: albumsCount } = await supabase.from('photo_albums').select('*', { count: 'exact', head: true });

  return NextResponse.json({
    sermons: sermonsCount || 0,
    albums: albumsCount || 0,
  });
}
