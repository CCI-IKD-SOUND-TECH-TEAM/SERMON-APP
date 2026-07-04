-- 1. Drop old tables
DROP TABLE IF EXISTS public.sync_logs CASCADE;
DROP TABLE IF EXISTS public.drive_sync_folders CASCADE;

-- 2. Update sermon_files
ALTER TABLE public.sermon_files DROP COLUMN IF EXISTS drive_file_id CASCADE;
ALTER TABLE public.sermon_files DROP COLUMN IF EXISTS drive_web_view_link;
ALTER TABLE public.sermon_files DROP COLUMN IF EXISTS drive_download_link;
ALTER TABLE public.sermon_files ADD COLUMN storage_path text;
ALTER TABLE public.sermon_files ADD COLUMN file_url text;

-- 3. Update photos
ALTER TABLE public.photos DROP COLUMN IF EXISTS drive_file_id CASCADE;
ALTER TABLE public.photos DROP COLUMN IF EXISTS drive_web_view_link;
ALTER TABLE public.photos DROP COLUMN IF EXISTS drive_download_link;
ALTER TABLE public.photos ADD COLUMN storage_path text;
ALTER TABLE public.photos ADD COLUMN file_url text;

-- 4. Create Storage Buckets (if they don't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('sermons', 'sermons', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage RLS Policies
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public read access to sermons bucket
CREATE POLICY "Public read access to sermons bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'sermons');

-- Allow public read access to photos bucket
CREATE POLICY "Public read access to photos bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

-- Allow authenticated users to insert/update/delete in sermons bucket
CREATE POLICY "Authenticated users can upload sermons"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'sermons' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update sermons"
ON storage.objects FOR UPDATE
USING (bucket_id = 'sermons' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete sermons"
ON storage.objects FOR DELETE
USING (bucket_id = 'sermons' AND auth.role() = 'authenticated');

-- Allow authenticated users to insert/update/delete in photos bucket
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'photos' AND auth.role() = 'authenticated');
