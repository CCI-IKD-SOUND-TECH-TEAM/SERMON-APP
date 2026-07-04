import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('series')
    .select('*, sermons(*)')
    .eq('id', id)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Only return published sermons
  if (data.sermons) {
    data.sermons = data.sermons.filter((s: any) => s.status === 'published');
    // Sort by date descending
    data.sermons.sort((a: any, b: any) => {
      const dateA = a.sermon_date ? new Date(a.sermon_date).getTime() : 0;
      const dateB = b.sermon_date ? new Date(b.sermon_date).getTime() : 0;
      return dateB - dateA;
    });
  }

  return NextResponse.json(data);
}
