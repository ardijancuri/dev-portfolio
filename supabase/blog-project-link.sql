alter table public.blog_posts
  add column if not exists project_link_label text,
  add column if not exists project_link_url text;

alter table public.blog_posts
  drop constraint if exists blog_posts_project_link_complete_check,
  add constraint blog_posts_project_link_complete_check
  check (
    (
      project_link_label is null
      and project_link_url is null
    )
    or (
      project_link_label is not null
      and char_length(trim(project_link_label)) between 1 and 80
      and project_link_url is not null
      and char_length(trim(project_link_url)) between 1 and 2048
      and project_link_url ~* '^https?://'
    )
  );
