-- MKP Supabase schema
-- Run this in Supabase SQL Editor after creating your project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  tos_accepted boolean not null default false,
  tos_accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.pastes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text default '',
  visibility text not null default 'public' check (visibility in ('public','private')),
  file_path text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.pastes enable row level security;

create policy "Public profiles readable"
on public.profiles for select
to anon, authenticated
using (true);

create policy "Users can create own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Public pastes readable"
on public.pastes for select
to anon, authenticated
using (visibility = 'public' or auth.uid() = user_id);

create policy "Users can create own pastes"
on public.pastes for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own pastes"
on public.pastes for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own pastes"
on public.pastes for delete
to authenticated
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('pastes', 'pastes', false)
on conflict (id) do nothing;

create policy "Authenticated users can upload paste files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'pastes'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can read their paste files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'pastes'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete their paste files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'pastes'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Optional trigger: automatically create a profile shell when a user signs up.
-- The frontend also upserts a profile after signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
