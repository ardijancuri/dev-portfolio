create extension if not exists "pgcrypto";

create schema if not exists private;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 3 and 160),
  title_sq text check (title_sq is null or char_length(trim(title_sq)) between 3 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  excerpt text not null check (char_length(trim(excerpt)) between 10 and 800),
  excerpt_sq text check (excerpt_sq is null or char_length(trim(excerpt_sq)) between 10 and 800),
  content text not null check (char_length(trim(content)) >= 20),
  content_sq text check (content_sq is null or char_length(trim(content_sq)) >= 20),
  hero_image_path text not null,
  hero_image_url text not null,
  hero_media_mode text not null default 'slider'
    check (hero_media_mode in ('slider', 'scroll')),
  hero_slider_image_paths text[] not null default '{}',
  hero_slider_image_urls text[] not null default '{}',
  author text not null default 'Ardijan Curi',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.blog_posts
  add column if not exists title_sq text,
  add column if not exists excerpt_sq text,
  add column if not exists content_sq text,
  add column if not exists hero_media_mode text not null default 'slider',
  add column if not exists hero_slider_image_paths text[] not null default '{}',
  add column if not exists hero_slider_image_urls text[] not null default '{}';

alter table public.blog_posts
  drop constraint if exists blog_posts_hero_media_mode_check,
  add constraint blog_posts_hero_media_mode_check
  check (hero_media_mode in ('slider', 'scroll'));

alter table public.blog_posts
  drop constraint if exists blog_posts_excerpt_check,
  add constraint blog_posts_excerpt_check
  check (char_length(trim(excerpt)) between 10 and 800);

alter table public.blog_posts
  drop constraint if exists blog_posts_title_sq_check,
  add constraint blog_posts_title_sq_check
  check (title_sq is null or char_length(trim(title_sq)) between 3 and 160);

alter table public.blog_posts
  drop constraint if exists blog_posts_excerpt_sq_check,
  add constraint blog_posts_excerpt_sq_check
  check (excerpt_sq is null or char_length(trim(excerpt_sq)) between 10 and 800);

alter table public.blog_posts
  drop constraint if exists blog_posts_content_sq_check,
  add constraint blog_posts_content_sq_check
  check (content_sq is null or char_length(trim(content_sq)) >= 20);

alter table public.blog_posts
  drop constraint if exists blog_posts_hero_slider_image_paths_count_check,
  add constraint blog_posts_hero_slider_image_paths_count_check
  check (cardinality(hero_slider_image_paths) <= 5);

alter table public.blog_posts
  drop constraint if exists blog_posts_hero_slider_image_urls_count_check,
  add constraint blog_posts_hero_slider_image_urls_count_check
  check (cardinality(hero_slider_image_urls) <= 5);

alter table public.blog_posts
  drop constraint if exists blog_posts_hero_slider_image_arrays_match_check,
  add constraint blog_posts_hero_slider_image_arrays_match_check
  check (cardinality(hero_slider_image_paths) = cardinality(hero_slider_image_urls));

alter table public.blog_posts
  drop constraint if exists blog_posts_scroll_mode_has_no_slider_images_check,
  add constraint blog_posts_scroll_mode_has_no_slider_images_check
  check (
    hero_media_mode = 'slider'
    or (
      cardinality(hero_slider_image_paths) = 0
      and cardinality(hero_slider_image_urls) = 0
    )
  );

create index if not exists blog_posts_created_at_idx
  on public.blog_posts (created_at desc);

create index if not exists blog_posts_created_by_idx
  on public.blog_posts (created_by);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_blog_posts_updated_at on public.blog_posts;
create trigger set_blog_posts_updated_at
before update on public.blog_posts
for each row
execute function public.set_updated_at();

create or replace function private.is_blog_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on schema private from public;
revoke all on function private.is_blog_admin() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_blog_admin() to authenticated;

alter table public.admin_users enable row level security;
alter table public.blog_posts enable row level security;

drop policy if exists "Admins can read their own admin record" on public.admin_users;
create policy "Admins can read their own admin record"
on public.admin_users
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "Public can read blog posts" on public.blog_posts;
create policy "Public can read blog posts"
on public.blog_posts
for select
to anon, authenticated
using (true);

drop policy if exists "Admins can create blog posts" on public.blog_posts;
create policy "Admins can create blog posts"
on public.blog_posts
for insert
to authenticated
with check (
  (select private.is_blog_admin())
  and created_by = (select auth.uid())
);

drop policy if exists "Admins can update blog posts" on public.blog_posts;
create policy "Admins can update blog posts"
on public.blog_posts
for update
to authenticated
using ((select private.is_blog_admin()))
with check (
  (select private.is_blog_admin())
  and created_by = (select auth.uid())
);

drop policy if exists "Admins can delete blog posts" on public.blog_posts;
create policy "Admins can delete blog posts"
on public.blog_posts
for delete
to authenticated
using ((select private.is_blog_admin()));

grant select on public.blog_posts to anon, authenticated;
grant insert, update, delete on public.blog_posts to authenticated;
grant select on public.admin_users to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-heroes',
  'blog-heroes',
  true,
  15728640,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read blog hero images" on storage.objects;
create policy "Public can read blog hero images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'blog-heroes');

drop policy if exists "Admins can upload blog hero images" on storage.objects;
create policy "Admins can upload blog hero images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'blog-heroes'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (select private.is_blog_admin())
);

drop policy if exists "Admins can update blog hero images" on storage.objects;
create policy "Admins can update blog hero images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'blog-heroes'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (select private.is_blog_admin())
)
with check (
  bucket_id = 'blog-heroes'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (select private.is_blog_admin())
);

drop policy if exists "Admins can delete blog hero images" on storage.objects;
create policy "Admins can delete blog hero images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'blog-heroes'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (select private.is_blog_admin())
);

-- After creating the owner in Supabase Auth, approve the account:
-- insert into public.admin_users (user_id)
-- values ('00000000-0000-0000-0000-000000000000')
-- on conflict do nothing;
