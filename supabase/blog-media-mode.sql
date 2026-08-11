alter table public.blog_posts
  add column if not exists hero_media_mode text not null default 'slider';

alter table public.blog_posts
  drop constraint if exists blog_posts_hero_media_mode_check,
  add constraint blog_posts_hero_media_mode_check
  check (hero_media_mode in ('slider', 'scroll'));

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

update storage.buckets
set file_size_limit = 15728640
where id = 'blog-heroes';
