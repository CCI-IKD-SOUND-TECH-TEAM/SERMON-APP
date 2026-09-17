import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error('Auth error in series GET:', authError);
  }
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // series has no date/month column of its own — order by the most recent
  // sermon's date within each series (its "month"), descending. Admin sees
  // all sermons regardless of status, unlike the public listing.
  const { data, error } = await supabase.from('series').select('*, sermons(sermon_date)');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const series = (data ?? []).map((s: any) => {
    const dates = (s.sermons ?? [])
      .filter((x: any) => x.sermon_date)
      .map((x: any) => new Date(x.sermon_date).getTime());
    const { sermons, ...rest } = s;
    return { ...rest, _sortTime: dates.length > 0 ? Math.max(...dates) : 0 };
  });

  series.sort((a, b) => b._sortTime - a._sortTime);

  return NextResponse.json(series.map(({ _sortTime, ...s }) => s));
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error('Auth error in series POST:', authError);
  }
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { data, error } = await supabase
    .from('series')
    .insert({ title: body.title, description: body.description, cover_image_url: body.cover_image_url })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
