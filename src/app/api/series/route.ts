import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  // series has no date/month column of its own — order by the most recent
  // published sermon's date within each series (its "month"), descending.
  const { data, error } = await supabase.from('series').select('*, sermons(sermon_date, status)');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const series = (data ?? []).map((s: any) => {
    const dates = (s.sermons ?? [])
      .filter((x: any) => x.status === 'published' && x.sermon_date)
      .map((x: any) => new Date(x.sermon_date).getTime());
    const { sermons, ...rest } = s;
    return { ...rest, _sortTime: dates.length > 0 ? Math.max(...dates) : 0 };
  });

  series.sort((a, b) => b._sortTime - a._sortTime);

  return NextResponse.json(series.map(({ _sortTime, ...s }) => s));
}
