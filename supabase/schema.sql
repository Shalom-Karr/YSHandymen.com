-- Y.S. Handymen — Supabase schema
-- Paste into the Supabase SQL editor and run. Idempotent — safe to re-run.
--
-- Sets up:
--   admins   — emails allowed to moderate (seeded with the owner)
--   reviews  — customer-submitted, hidden until an admin approves
--   gallery  — before/after project photos, admin-managed
--   storage  — public "gallery" image bucket, admin-only writes

-- ---------------------------------------------------------------- admins

create table if not exists public.admins (
  email      text primary key,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- SECURITY DEFINER so policies on other tables can consult the admins list
-- without granting the caller any direct visibility into it.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt()->>'email', ''))
  );
$$;

drop policy if exists "admins read admins"   on public.admins;
drop policy if exists "admins manage admins" on public.admins;

create policy "admins read admins" on public.admins
  for select to authenticated
  using (public.is_admin());

create policy "admins manage admins" on public.admins
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into public.admins (email)
values ('yshandymen@gmail.com')
on conflict (email) do nothing;

-- --------------------------------------------------------------- reviews

create table if not exists public.reviews (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name       text not null check (char_length(name) between 2 and 80),
  location   text check (location is null or char_length(location) <= 80),
  rating     int  not null check (rating between 1 and 5),
  body       text not null check (char_length(body) between 10 and 1200),
  approved   boolean not null default false
);

alter table public.reviews enable row level security;

drop policy if exists "public submits reviews"       on public.reviews;
drop policy if exists "public reads approved reviews" on public.reviews;
drop policy if exists "admins update reviews"         on public.reviews;
drop policy if exists "admins delete reviews"         on public.reviews;

-- Anyone may submit, but a submission can only arrive unapproved.
create policy "public submits reviews" on public.reviews
  for insert to anon, authenticated
  with check (approved = false);

-- The public sees approved reviews; admins see everything.
create policy "public reads approved reviews" on public.reviews
  for select to anon, authenticated
  using (approved = true or public.is_admin());

create policy "admins update reviews" on public.reviews
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "admins delete reviews" on public.reviews
  for delete to authenticated
  using (public.is_admin());

-- --------------------------------------------------------------- gallery

create table if not exists public.gallery (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  title       text not null check (char_length(title) between 2 and 120),
  description text check (description is null or char_length(description) <= 600),
  before_path text not null,
  after_path  text not null,
  sort_order  int not null default 0
);

alter table public.gallery enable row level security;

drop policy if exists "public reads gallery"  on public.gallery;
drop policy if exists "admins manage gallery" on public.gallery;

create policy "public reads gallery" on public.gallery
  for select to anon, authenticated
  using (true);

create policy "admins manage gallery" on public.gallery
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- --------------------------------------------------- storage: gallery bucket

-- Public bucket: images are served from the CDN URL without auth.
-- Writes are gated below to admins only. 10 MB cap, images only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gallery', 'gallery', true, 10485760,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public            = excluded.public,
    file_size_limit   = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "admins upload gallery images" on storage.objects;
drop policy if exists "admins update gallery images" on storage.objects;
drop policy if exists "admins delete gallery images" on storage.objects;

create policy "admins upload gallery images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'gallery' and public.is_admin());

create policy "admins update gallery images" on storage.objects
  for update to authenticated
  using (bucket_id = 'gallery' and public.is_admin());

create policy "admins delete gallery images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'gallery' and public.is_admin());
