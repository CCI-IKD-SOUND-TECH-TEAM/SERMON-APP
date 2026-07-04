-- Migration 003_media_imports.sql
-- Create media_imports and photo_albums tables, update sermons

-- 1. Create media_imports table
CREATE TYPE import_status AS ENUM ('PENDING', 'PROCESSING', 'READY_FOR_REVIEW', 'PUBLISHED', 'REJECTED', 'ARCHIVED');

CREATE TABLE IF NOT EXISTS public.media_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_file_id TEXT UNIQUE NOT NULL,
    parent_folder_id TEXT,
    file_name TEXT NOT NULL,
    mime_type TEXT,
    size BIGINT,
    md5_checksum TEXT,
    drive_created_at TIMESTAMPTZ,
    status import_status NOT NULL DEFAULT 'PENDING',
    imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.media_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read media_imports" 
  ON public.media_imports FOR SELECT 
  USING (public.is_staff());

CREATE POLICY "Staff can insert media_imports" 
  ON public.media_imports FOR INSERT 
  WITH CHECK (public.is_staff());

CREATE POLICY "Staff can update media_imports" 
  ON public.media_imports FOR UPDATE 
  USING (public.is_staff());


-- 2. Update sermons table
ALTER TABLE public.sermons 
ADD COLUMN IF NOT EXISTS media_import_id UUID REFERENCES public.media_imports(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS drive_file_id TEXT,
ADD COLUMN IF NOT EXISTS published_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- 3. Create or Update photo_albums table
CREATE TABLE IF NOT EXISTS public.photo_albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.photo_albums
ADD COLUMN IF NOT EXISTS media_import_id UUID REFERENCES public.media_imports(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS event_date DATE,
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS published_by UUID REFERENCES auth.users(id);

ALTER TABLE public.photo_albums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published photo_albums" 
  ON public.photo_albums FOR SELECT 
  USING (published_at IS NOT NULL);

CREATE POLICY "Staff can read all photo_albums" 
  ON public.photo_albums FOR SELECT 
  USING (public.is_staff());

CREATE POLICY "Staff can insert photo_albums" 
  ON public.photo_albums FOR INSERT 
  WITH CHECK (public.is_staff());

CREATE POLICY "Staff can update photo_albums" 
  ON public.photo_albums FOR UPDATE 
  USING (public.is_staff());

CREATE POLICY "Admins can delete photo_albums" 
  ON public.photo_albums FOR DELETE 
  USING (public.is_admin());
