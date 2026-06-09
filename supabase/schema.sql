create extension if not exists "pgcrypto";

create table if not exists public.advisor_profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  role text not null,
  biography text,
  credentials text[] not null default '{}',
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.advisory_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  message text not null,
  preferred_channel text not null check (preferred_channel in ('whatsapp', 'phone', 'email')),
  status text not null default 'pending' check (status in ('pending', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  advisor_id uuid references public.advisor_profiles(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text not null,
  scheduled_for timestamptz not null,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.pension_estimates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  children_count integer not null check (children_count > 0),
  monthly_food numeric(12, 2) not null default 0,
  monthly_education numeric(12, 2) not null default 0,
  monthly_health numeric(12, 2) not null default 0,
  monthly_housing numeric(12, 2) not null default 0,
  other_monthly_expenses numeric(12, 2) not null default 0,
  estimated_total numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

alter table public.advisor_profiles enable row level security;
alter table public.advisory_requests enable row level security;
alter table public.appointments enable row level security;
alter table public.pension_estimates enable row level security;

create policy "Public can view active advisors"
on public.advisor_profiles for select
using (is_active = true);

create policy "Public can create advisory requests"
on public.advisory_requests for insert
with check (true);

create policy "Public can request appointments"
on public.appointments for insert
with check (true);

create policy "Users can manage their estimates"
on public.pension_estimates for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Antes de producción, protege los inserts públicos con CAPTCHA o Edge Functions.
