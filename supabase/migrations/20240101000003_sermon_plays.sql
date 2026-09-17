-- Migration 004_sermon_plays.sql
-- Event log for sermon play tracking (admin analytics: most-listened-to, trends over time).
-- A row is inserted once per listening session, once the client has confirmed
-- ~30s of actual playback (not on every click) — see src/lib/player/PlayerContext.tsx.

CREATE TABLE IF NOT EXISTS public.sermon_plays (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sermon_id   UUID NOT NULL REFERENCES public.sermons(id) ON DELETE CASCADE,
    played_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sermon_plays_sermon_id_played_at_idx
    ON public.sermon_plays (sermon_id, played_at);

ALTER TABLE public.sermon_plays ENABLE ROW LEVEL SECURITY;

-- Public site has no login (per PRD default), so plays are recorded
-- anonymously — anyone can log a play, but only for a sermon that is
-- actually published, and only staff can read the log back.
CREATE POLICY "Anyone can record a play for a published sermon"
  ON public.sermon_plays FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sermons
      WHERE sermons.id = sermon_plays.sermon_id
        AND sermons.status = 'published'
    )
  );

CREATE POLICY "Staff can read sermon_plays"
  ON public.sermon_plays FOR SELECT
  USING (public.is_staff());
