import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const TREND_DAYS = 30;
const MOST_PLAYED_LIMIT = 10;
// Safety bound on raw rows fetched for in-memory aggregation — well past
// realistic church-app volume; a real high-traffic app would aggregate in
// SQL via an RPC/view instead, but the FRD scopes this to "simple counters."
const MAX_ROWS = 20000;

function dayKey(iso: string) {
  return iso.slice(0, 10); // YYYY-MM-DD
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = Date.now();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  const trendStart = new Date(now - (TREND_DAYS - 1) * 24 * 60 * 60 * 1000);
  const trendStartIso = trendStart.toISOString();

  const [{ count: totalPlays }, { count: playsLast7d }, { count: playsLast30d }, { data: recentPlays, error: recentError }] =
    await Promise.all([
      supabase.from('sermon_plays').select('*', { count: 'exact', head: true }),
      supabase.from('sermon_plays').select('*', { count: 'exact', head: true }).gte('played_at', sevenDaysAgo),
      supabase.from('sermon_plays').select('*', { count: 'exact', head: true }).gte('played_at', trendStartIso),
      supabase.from('sermon_plays').select('sermon_id, played_at').order('played_at', { ascending: false }).limit(MAX_ROWS),
    ]);

  if (recentError) {
    return NextResponse.json({ error: recentError.message }, { status: 500 });
  }

  // Most-played ranking, all time — separate unbounded-by-window query since
  // "most listened to ever" shouldn't be capped to the last 30 days.
  const { data: allPlaySermonIds, error: allPlaysError } = await supabase
    .from('sermon_plays')
    .select('sermon_id')
    .limit(MAX_ROWS);

  if (allPlaysError) {
    return NextResponse.json({ error: allPlaysError.message }, { status: 500 });
  }

  const playCounts = new Map<string, number>();
  for (const row of allPlaySermonIds ?? []) {
    playCounts.set(row.sermon_id, (playCounts.get(row.sermon_id) ?? 0) + 1);
  }
  const topIds = [...playCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, MOST_PLAYED_LIMIT)
    .map(([id]) => id);

  let mostPlayed: { id: string; title: string; speaker: string | null; thumbnail_url: string | null; plays: number }[] = [];
  if (topIds.length > 0) {
    const { data: sermons } = await supabase.from('sermons').select('id, title, speaker, thumbnail_url').in('id', topIds);
    mostPlayed = topIds.map((id) => {
      const sermon = sermons?.find((s) => s.id === id);
      return {
        id,
        title: sermon?.title ?? 'Untitled sermon',
        speaker: sermon?.speaker ?? null,
        thumbnail_url: sermon?.thumbnail_url ?? null,
        plays: playCounts.get(id) ?? 0,
      };
    });
  }

  // Zero-filled daily trend for the last TREND_DAYS days.
  const dailyCounts = new Map<string, number>();
  for (let i = 0; i < TREND_DAYS; i++) {
    const d = new Date(trendStart.getTime() + i * 24 * 60 * 60 * 1000);
    dailyCounts.set(dayKey(d.toISOString()), 0);
  }
  for (const row of recentPlays ?? []) {
    const key = dayKey(row.played_at);
    if (dailyCounts.has(key)) {
      dailyCounts.set(key, (dailyCounts.get(key) ?? 0) + 1);
    }
  }
  const dailyTrend = [...dailyCounts.entries()].map(([date, plays]) => ({ date, plays }));

  return NextResponse.json({
    totalPlays: totalPlays ?? 0,
    playsLast7d: playsLast7d ?? 0,
    playsLast30d: playsLast30d ?? 0,
    mostPlayed,
    dailyTrend,
  });
}
