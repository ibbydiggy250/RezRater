create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'building_type') then
    create type public.building_type as enum ('Corridor', 'Suite', 'Apartment');
  else
    alter type public.building_type add value if not exists 'Corridor';
  end if;

  if not exists (select 1 from pg_type where typname = 'best_for') then
    create type public.best_for as enum ('Quiet', 'Social', 'Convenience', 'Suite-style', 'Apartment-style');
  end if;

  if not exists (select 1 from pg_type where typname = 'class_year') then
    create type public.class_year as enum ('Freshman', 'Sophomore', 'Junior', 'Senior');
  end if;

  if not exists (select 1 from pg_type where typname = 'residence_season') then
    create type public.residence_season as enum ('Fall', 'Winter', 'Spring', 'Summer');
  end if;
end
$$;

create table if not exists public.quads (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.buildings (
  id uuid primary key default gen_random_uuid(),
  quad_id uuid not null references public.quads(id) on delete cascade,
  name text not null,
  slug text not null unique,
  type public.building_type not null,
  has_kitchen boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  unique (quad_id, name)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique check (email ilike '%@stonybrook.edu'),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  building_id uuid not null references public.buildings(id) on delete cascade,
  overall_rating integer not null check (overall_rating between 1 and 5),
  cleanliness_rating integer not null check (cleanliness_rating between 1 and 5),
  noise_rating integer not null check (noise_rating between 1 and 5),
  bathroom_rating integer not null check (bathroom_rating between 1 and 5),
  location_rating integer not null check (location_rating between 1 and 5),
  social_rating integer not null check (social_rating between 1 and 5),
  amenities_rating integer not null check (amenities_rating between 1 and 5),
  room_quality_rating integer not null check (room_quality_rating between 1 and 5),
  would_live_again boolean not null,
  best_for public.best_for not null,
  review_text text not null check (length(trim(review_text)) > 0),
  pros_text text,
  cons_text text,
  class_year_when_lived public.class_year not null,
  residence_season public.residence_season,
  residence_year integer check (residence_year >= 2000),
  photo_urls text[] not null default '{}',
  approved boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, building_id)
);

alter table public.reviews
add column if not exists approved boolean not null default true;

alter table public.reviews
add column if not exists residence_season public.residence_season;

alter table public.reviews
add column if not exists residence_year integer;

alter table public.reviews
add column if not exists photo_urls text[] not null default '{}';

alter table public.reviews
drop constraint if exists reviews_residence_year_range;

alter table public.reviews
add constraint reviews_residence_year_range
check (residence_year is null or residence_year >= 2000);

alter table public.reviews
drop constraint if exists reviews_review_text_length;

alter table public.reviews
add constraint reviews_review_text_length
check (length(trim(review_text)) between 10 and 2000);

alter table public.reviews
drop constraint if exists reviews_pros_text_length;

alter table public.reviews
add constraint reviews_pros_text_length
check (pros_text is null or length(trim(pros_text)) <= 1000);

alter table public.reviews
drop constraint if exists reviews_cons_text_length;

alter table public.reviews
add constraint reviews_cons_text_length
check (cons_text is null or length(trim(cons_text)) <= 1000);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, lower(new.email))
  on conflict (id) do update
  set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into public.profiles (id, email)
select id, lower(email)
from auth.users
where email ilike '%@stonybrook.edu'
on conflict (id) do update
set email = excluded.email;

alter table public.quads enable row level security;
alter table public.buildings enable row level security;
alter table public.profiles enable row level security;
alter table public.reviews enable row level security;

drop policy if exists "Public can read quads" on public.quads;
create policy "Public can read quads"
on public.quads for select
using (true);

drop policy if exists "Public can read buildings" on public.buildings;
create policy "Public can read buildings"
on public.buildings for select
using (true);

drop policy if exists "Public can read reviews" on public.reviews;
create policy "Public can read reviews"
on public.reviews for select
to anon, authenticated
using (approved = true);

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Users can insert own review" on public.reviews;
create policy "Users can insert own review"
on public.reviews for insert
to authenticated
with check (auth.uid() = user_id and approved = true);

drop policy if exists "Users can read own reviews" on public.reviews;
create policy "Users can read own reviews"
on public.reviews for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can update own review" on public.reviews;
create policy "Users can update own review"
on public.reviews for update
to authenticated
using (auth.uid() = user_id and approved = true)
with check (auth.uid() = user_id and approved = true);

drop policy if exists "Users can delete own review" on public.reviews;
create policy "Users can delete own review"
on public.reviews for delete
to authenticated
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('review-photos', 'review-photos', true)
on conflict (id) do update
set public = true;

drop policy if exists "Public can read review photos" on storage.objects;
create policy "Public can read review photos"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'review-photos');

drop policy if exists "Users can upload own review photos" on storage.objects;
create policy "Users can upload own review photos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'review-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can delete own review photos" on storage.objects;
create policy "Users can delete own review photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'review-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
