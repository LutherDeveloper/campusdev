-- CAMPUSDEV MVP schema. Run in Supabase Dashboard > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default 'Developer' check (char_length(full_name) between 2 and 80),
  university text check (university is null or char_length(university) <= 120),
  major text check (major is null or char_length(major) <= 100),
  bio text check (bio is null or char_length(bio) <= 500),
  github_url text check (github_url is null or char_length(github_url) <= 300),
  skills text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 5 and 100),
  description text not null check (char_length(description) between 20 and 3000),
  category text not null default 'Other' check (category in ('Web Development','Mobile Development','Cybersecurity','Data & AI','UI/UX Design','Other')),
  skills text[] not null default '{}',
  looking_for text check (looking_for is null or char_length(looking_for) <= 300),
  status text not null default 'open' check (status in ('open','in_progress','completed','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists projects_created_at_idx on public.projects(created_at desc);
create index if not exists projects_category_idx on public.projects(category);
create index if not exists projects_user_id_idx on public.projects(user_id);

-- Automatically create a profile for every new Auth user.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'Developer'))
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;

grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant select on public.projects to anon, authenticated;
grant insert, update, delete on public.projects to authenticated;

-- Public profile fields are intended for the CAMPUSDEV community.
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone" on public.profiles for select to anon, authenticated using (true);
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Anyone can view projects; only authenticated users can publish; owners can edit/delete their own.
drop policy if exists "Projects are viewable by everyone" on public.projects;
create policy "Projects are viewable by everyone" on public.projects for select to anon, authenticated using (true);
drop policy if exists "Authenticated users can create projects for themselves" on public.projects;
create policy "Authenticated users can create projects for themselves" on public.projects for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Owners can update their projects" on public.projects;
create policy "Owners can update their projects" on public.projects for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Owners can delete their projects" on public.projects;
create policy "Owners can delete their projects" on public.projects for delete to authenticated using ((select auth.uid()) = user_id);

-- Project team applications: students can apply; project owners review applications.
create table if not exists public.project_applications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  applicant_id uuid not null references public.profiles(id) on delete cascade,
  message text not null check (char_length(message) between 10 and 1000),
  status text not null default 'pending' check (status in ('pending','accepted','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, applicant_id)
);
create index if not exists project_applications_project_idx on public.project_applications(project_id, created_at desc);
create index if not exists project_applications_applicant_idx on public.project_applications(applicant_id, created_at desc);
alter table public.project_applications enable row level security;
grant select, insert on public.project_applications to authenticated;
grant update on public.project_applications to authenticated;

drop policy if exists "Applicants and project owners can view applications" on public.project_applications;
create policy "Applicants and project owners can view applications"
on public.project_applications for select to authenticated
using (
  applicant_id = (select auth.uid())
  or exists (
    select 1 from public.projects p
    where p.id = project_applications.project_id and p.user_id = (select auth.uid())
  )
);
drop policy if exists "Students can apply as themselves" on public.project_applications;
create policy "Students can apply as themselves"
on public.project_applications for insert to authenticated
with check (
  applicant_id = (select auth.uid())
  and exists (
    select 1 from public.projects p
    where p.id = project_applications.project_id
      and p.user_id <> (select auth.uid())
      and p.status = 'open'
  )
);
drop policy if exists "Project owners can review applications" on public.project_applications;
create policy "Project owners can review applications"
on public.project_applications for update to authenticated
using (
  exists (
    select 1 from public.projects p
    where p.id = project_applications.project_id and p.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.projects p
    where p.id = project_applications.project_id and p.user_id = (select auth.uid())
  )
);
