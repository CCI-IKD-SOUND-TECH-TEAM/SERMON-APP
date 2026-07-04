import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/download
 * Proxies downloads by redirecting to Supabase file_url,
 * and anonymously increments the download_count.
 *
 * Query params:
 *  - id: The database primary key of the file
 *  - type: 'sermon_file' | 'photo'
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type');

  if (!id || !type) {
    return NextResponse.json({ error: 'Missing id or type' }, { status: 400 });
  }

  const supabase = await createClient();

  const table = type === 'sermon_file' ? 'sermon_files' : 'photos';

  // 1. Get the download link
  const { data, error } = await supabase
    .from(table)
    .select('file_url, download_count')
    .eq('id', id)
    .single();

  if (error || !data || !data.file_url) {
    return NextResponse.json({ error: 'Download link not found' }, { status: 404 });
  }

  // 2. Increment download count (fire-and-forget)
  supabase
    .from(table)
    .update({ download_count: (data.download_count || 0) + 1 })
    .eq('id', id)
    .then((result) => {
      if (result.error) console.error(result.error);
    });

  // 3. Redirect the user
  return NextResponse.redirect(data.file_url);
}
