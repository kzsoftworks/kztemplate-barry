-- Initial schema: profiles + roles.
--
-- * auth.users is owned by Supabase Auth. App data about a user lives in
--   public.profiles, created by a trigger when the user signs up.
-- * Every table has Row Level Security enabled. The publishable key can only
--   do what these policies and grants allow.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  name text,
  picture text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.profiles is
  'One row per auth user. Created by the on_auth_user_created trigger.';

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);
comment on table public.roles is 'Application roles. Reference data.';

create table public.user_roles (
  user_id uuid not null references public.profiles (id) on delete cascade,
  role_id uuid not null references public.roles (id) on delete cascade,
  primary key (user_id, role_id)
);
comment on table public.user_roles is 'Which roles each user has.';

create index user_roles_role_id_idx on public.user_roles (role_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;

-- Privileges: start from nothing and grant only what the app needs.
revoke all on public.profiles from anon, authenticated;
revoke all on public.roles from anon, authenticated;
revoke all on public.user_roles from anon, authenticated;

grant select on public.profiles to authenticated;
-- Users may edit their display fields only. id, email and timestamps are
-- maintained by triggers.
grant update (name, picture) on public.profiles to authenticated;
grant select on public.roles to authenticated;
grant select on public.user_roles to authenticated;

create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Authenticated users can view roles"
  on public.roles for select
  to authenticated
  using (true);

create policy "Users can view their own role assignments"
  on public.user_roles for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- No insert/delete policies: profiles and role assignments are written by the
-- triggers below or by server code using the secret key.

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Runs as the function owner so it can write to public.profiles regardless of
-- the caller. search_path is pinned and every object is schema-qualified.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, name, picture)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'full_name'
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  );

  insert into public.user_roles (user_id, role_id)
  select new.id, r.id
  from public.roles r
  where r.name = 'member';

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();

-- Trigger functions must not be callable through the API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_user_email_change() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Reference data (needed in every environment, so it lives in the migration)
-- ---------------------------------------------------------------------------

insert into public.roles (name) values ('admin'), ('member');
