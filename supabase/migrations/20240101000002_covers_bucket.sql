-- Migration 004_covers_bucket.sql
-- Creates a Supabase storage bucket named "covers" and applies RLS.

INSERT INTO storage.buckets (id, name, public)
VALUES ('covers', 'covers', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for "covers" bucket

-- Public can read
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'covers');

-- Staff can insert
CREATE POLICY "Staff Upload" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'covers' AND 
    public.is_staff()
);

-- Staff can update
CREATE POLICY "Staff Update" 
ON storage.objects FOR UPDATE 
USING (
    bucket_id = 'covers' AND 
    public.is_staff()
);

-- Staff can delete
CREATE POLICY "Staff Delete" 
ON storage.objects FOR DELETE 
USING (
    bucket_id = 'covers' AND 
    public.is_staff()
);
