-- ============================================================
-- VSU HazMat — Supabase schema, security & seed
-- Paste this whole file into: Supabase dashboard → SQL Editor → New query → Run.
-- Safe to re-run (uses if-not-exists / create-or-replace where possible).
-- ============================================================

-- ---------- Tables ----------
create table if not exists public.units (
  id          text primary key,
  name        text not null,
  short       text not null,
  building    text,
  coordinator text,
  focal_email text,
  deadline    date,
  created_at  timestamptz not null default now()
);
-- add the column too if the table already existed from an earlier run:
alter table public.units add column if not exists focal_email text;

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  name       text not null,
  role       text not null default 'focal'   check (role   in ('admin','focal')),
  status     text not null default 'pending' check (status in ('pending','approved','rejected')),
  unit_id    text references public.units(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.waste_streams (
  id              uuid primary key default gen_random_uuid(),
  unit_id         text not null references public.units(id) on delete cascade,
  category        text not null check (category in ('Chemical','Biological')),
  name            text not null,
  source_activity text not null,
  hazard_class    text,
  hazard_code     text,
  physical_state  text,
  volume_per_month text,
  storage         text,
  disposal_activity text,
  method          text,
  treatment       text,
  hauler          text,
  manifest        text,
  status          text not null check (status in ('Compliant','Partially compliant','Non-compliant')),
  ai              jsonb,                       -- { verdict, severity, summary, actions[], standards[] }
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now()
);

-- ---------- Helper functions (security definer avoids RLS recursion) ----------
create or replace function public.is_admin() returns boolean
  language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_approved() returns boolean
  language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and status = 'approved');
$$;

create or replace function public.my_unit() returns text
  language sql security definer stable set search_path = public as $$
  select unit_id from public.profiles where id = auth.uid();
$$;

-- ---------- Auto-create a profile on sign-up (restrict to @vsu.edu.ph) ----------
create or replace function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  if new.email !~* '@vsu\.edu\.ph$' then
    raise exception 'Only @vsu.edu.ph email addresses may register.';
  end if;
  insert into public.profiles (id, email, name, role, status, unit_id)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data->>'name',''), split_part(new.email,'@',1)),
    'focal',
    'pending',
    nullif(new.raw_user_meta_data->>'unit_id','')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Row-Level Security ----------
alter table public.units          enable row level security;
alter table public.profiles       enable row level security;
alter table public.waste_streams  enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.units, public.profiles, public.waste_streams to authenticated;
-- the units roster is public so the registration page can list units before login:
grant select on public.units to anon;

-- profiles: see own row or (admin sees all); only admin edits (approve/reject/role)
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- units: everyone signed-in can read; only admin can change the roster
drop policy if exists units_select on public.units;
create policy units_select on public.units for select using (true);  -- public read (incl. logged-out registration page)
drop policy if exists units_write on public.units;
create policy units_write on public.units for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- waste_streams: shared read; approved focal (own unit) or admin can add; creator/admin can edit
drop policy if exists waste_select on public.waste_streams;
create policy waste_select on public.waste_streams for select to authenticated using (true);
drop policy if exists waste_insert on public.waste_streams;
create policy waste_insert on public.waste_streams for insert to authenticated
  with check (public.is_admin() or (public.is_approved() and unit_id = public.my_unit()));
drop policy if exists waste_update on public.waste_streams;
create policy waste_update on public.waste_streams for update to authenticated
  using (public.is_admin() or created_by = auth.uid());
drop policy if exists waste_delete on public.waste_streams;
create policy waste_delete on public.waste_streams for delete to authenticated
  using (public.is_admin() or created_by = auth.uid());

-- ---------- Seed the academic units ----------
insert into public.units (id, name, short, building, coordinator, deadline) values
  ('chem',   'Department of Chemistry',                       'Chemistry',           'Chemistry Complex',            'Prof. M. Delgado',     '2026-06-20'),
  ('biosci', 'Department of Biological Sciences',             'Biological Sciences', 'Biological Sciences',          'Dr. J. Ferrer',        '2026-06-20'),
  ('agchem', 'Agri-Chemical Research Center',                 'Agri-Chem Research',  'Agri-Chem Research Center',    'Dr. A. Bonifacio',     '2026-07-15'),
  ('vetmed', 'College of Veterinary Medicine',                'Vet Medicine',        'Vet Medicine',                'Dr. L. Ocampo',        '2026-07-15'),
  ('foodsci','Department of Food Science & Technology',       'Food Science',        'Food Science',                'Prof. R. Villamor',    '2026-06-20'),
  ('ecoinst','Tropical Ecology Institute',                    'Tropical Ecology',    'Tropical Ecology Institute',   'Dr. S. Mendez',        '2026-07-02'),
  ('agron',  'Department of Agronomy',                        'Agronomy',            'Agri-Chem Research Center',    'Prof. E. Castaneda',   '2026-07-02'),
  ('pharma', 'Pharmacology Laboratory',                       'Pharmacology',        'Vet Medicine',                'Dr. C. Rosales',       '2026-07-15')
on conflict (id) do nothing;

-- ============================================================
-- AFTER you sign up the admin account in the app once, run this ONE line
-- (in the SQL editor) to promote it. Change the email if yours differs:
--
--   update public.profiles set role='admin', status='approved', unit_id=null
--   where lower(email) = 'lfgabuanda@vsu.edu.ph';
-- ============================================================
