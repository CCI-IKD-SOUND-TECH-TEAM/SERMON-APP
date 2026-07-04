-- Overflow — Database schema
-- Tables, RLS policies, triggers per FRD §5

-- ══════════════════════════════════════════════
-- 0. Authorization Functions
-- ══════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'media_editor')
  );
$$;


-- ══════════════════════════════════════════════
-- 1. profiles (linked to auth.users)
-- ══════════════════════════════════════════════
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  role        text not null default 'member' check (role in ('admin', 'media_editor', 'member')),
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Admins can read all profiles; media_editors can read their own
create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can update all profiles"
  on public.profiles for update
  using (public.is_admin());

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins can insert profiles"
  on public.profiles for insert
  with check (public.is_admin());

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), 'member');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ══════════════════════════════════════════════
-- 2. series
-- ══════════════════════════════════════════════
create table if not exists public.series (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  description     text,
  cover_image_url text,
  created_at      timestamptz not null default now()
);

alter table public.series enable row level security;

create policy "Public can read series"
  on public.series for select
  using (true);

create policy "Admins and editors can insert series"
  on public.series for insert
  with check (public.is_staff());

create policy "Admins and editors can update series"
  on public.series for update
  using (public.is_staff());

create policy "Admins can delete series"
  on public.series for delete
  using (public.is_admin());


-- ══════════════════════════════════════════════
-- 3. sermons
-- ══════════════════════════════════════════════
create table if not exists public.sermons (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  speaker       text,
  series_id     uuid references public.series(id) on delete set null,
  sermon_date   date,
  tags          text[] default '{}',
  status        text not null default 'pending_review'
                  check (status in ('pending_review', 'published', 'unpublished', 'archived')),
  is_featured   boolean not null default false,
  thumbnail_url text,
  view_count    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.sermons enable row level security;

-- Public can only see published sermons
create policy "Public can read published sermons"
  on public.sermons for select
  using (status = 'published');

-- Admins/editors can see all sermons
create policy "Staff can read all sermons"
  on public.sermons for select
  using (public.is_staff());

create policy "Staff can insert sermons"
  on public.sermons for insert
  with check (public.is_staff());

create policy "Staff can update sermons"
  on public.sermons for update
  using (public.is_staff());

create policy "Admins can delete sermons"
  on public.sermons for delete
  using (public.is_admin());

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger sermons_updated_at
  before update on public.sermons
  for each row execute function public.set_updated_at();


-- ══════════════════════════════════════════════
-- 4. sermon_files
-- ══════════════════════════════════════════════
create table if not exists public.sermon_files (
  id                  uuid primary key default gen_random_uuid(),
  sermon_id           uuid not null references public.sermons(id) on delete cascade,
  file_type           text not null check (file_type in ('audio', 'video', 'notes', 'slides', 'other')),
  storage_path        text,
  file_url            text,
  mime_type           text,
  size_bytes          bigint,
  download_count      integer not null default 0
);

alter table public.sermon_files enable row level security;

-- Public can read files for published sermons
create policy "Public can read files of published sermons"
  on public.sermon_files for select
  using (
    exists (
      select 1 from public.sermons
      where sermons.id = sermon_files.sermon_id
        and sermons.status = 'published'
    )
  );

-- Staff can read all files
create policy "Staff can read all sermon files"
  on public.sermon_files for select
  using (public.is_staff());

create policy "Staff can insert sermon files"
  on public.sermon_files for insert
  with check (public.is_staff());

create policy "Staff can update sermon files"
  on public.sermon_files for update
  using (public.is_staff());

create policy "Staff can delete sermon files"
  on public.sermon_files for delete
  using (public.is_staff());


-- ══════════════════════════════════════════════
-- 5. photo_albums
-- ══════════════════════════════════════════════
create table if not exists public.photo_albums (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  event_date      date,
  description     text,
  cover_photo_url text,
  status          text not null default 'pending_review'
                    check (status in ('pending_review', 'published', 'unpublished', 'archived')),
  created_at      timestamptz not null default now()
);

alter table public.photo_albums enable row level security;

create policy "Public can read published albums"
  on public.photo_albums for select
  using (status = 'published');

create policy "Staff can read all albums"
  on public.photo_albums for select
  using (public.is_staff());

create policy "Staff can insert albums"
  on public.photo_albums for insert
  with check (public.is_staff());

create policy "Staff can update albums"
  on public.photo_albums for update
  using (public.is_staff());

create policy "Admins can delete albums"
  on public.photo_albums for delete
  using (public.is_admin());


-- ══════════════════════════════════════════════
-- 6. photos
-- ══════════════════════════════════════════════
create table if not exists public.photos (
  id                  uuid primary key default gen_random_uuid(),
  album_id            uuid not null references public.photo_albums(id) on delete cascade,
  storage_path        text,
  file_url            text,
  thumbnail_url       text,
  width               integer,
  height              integer,
  sort_order          integer not null default 0,
  download_count      integer not null default 0
);

alter table public.photos enable row level security;

create policy "Public can read photos of published albums"
  on public.photos for select
  using (
    exists (
      select 1 from public.photo_albums
      where photo_albums.id = photos.album_id
        and photo_albums.status = 'published'
    )
  );

create policy "Staff can read all photos"
  on public.photos for select
  using (public.is_staff());

create policy "Staff can insert photos"
  on public.photos for insert
  with check (public.is_staff());

create policy "Staff can update photos"
  on public.photos for update
  using (public.is_staff());

create policy "Staff can delete photos"
  on public.photos for delete
  using (public.is_staff());


-- ══════════════════════════════════════════════
-- 7. Storage Buckets & Policies
-- ══════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public)
VALUES ('sermons', 'sermons', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public read access to sermons bucket
DO $$ BEGIN
    CREATE POLICY "Public read access to sermons bucket"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'sermons');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Allow public read access to photos bucket
DO $$ BEGIN
    CREATE POLICY "Public read access to photos bucket"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'photos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Allow authenticated users to insert/update/delete in sermons bucket
DO $$ BEGIN
    CREATE POLICY "Authenticated users can upload sermons"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'sermons');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Authenticated users can update sermons"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'sermons');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Authenticated users can delete sermons"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'sermons');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Allow authenticated users to insert/update/delete in photos bucket
DO $$ BEGIN
    CREATE POLICY "Authenticated users can upload photos"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'photos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Authenticated users can update photos"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'photos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Authenticated users can delete photos"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'photos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
