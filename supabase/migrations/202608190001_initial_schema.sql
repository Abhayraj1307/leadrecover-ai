-- LeadRecover AI initial multi-tenant schema
create extension if not exists pgcrypto;

create type public.lead_status as enum ('new', 'callback_needed', 'booked', 'won', 'lost');
create type public.customer_type as enum ('new', 'existing', 'unknown');
create type public.urgency_level as enum ('low', 'normal', 'high', 'emergency', 'unknown');
create type public.followup_type as enum ('sms', 'callback');
create type public.followup_status as enum ('pending', 'queued', 'sent', 'completed', 'cancelled', 'failed');

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  company_name text not null check (char_length(company_name) between 1 and 160),
  owner_name text not null check (char_length(owner_name) between 1 and 160),
  email text not null check (char_length(email) <= 320),
  phone text,
  timezone text not null default 'America/New_York',
  business_hours jsonb not null default '{}'::jsonb,
  emergency_phone text,
  service_area jsonb not null default '[]'::jsonb,
  services_offered jsonb not null default '[]'::jsonb,
  emergency_rules text,
  callback_number text,
  created_at timestamptz not null default now()
);

create table public.business_members (
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'staff')),
  created_at timestamptz not null default now(),
  primary key (business_id, user_id)
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  caller_name text,
  caller_phone text,
  address text,
  zip_code text,
  customer_type public.customer_type not null default 'unknown',
  service_type text,
  issue_description text,
  urgency public.urgency_level not null default 'unknown',
  status public.lead_status not null default 'new',
  preferred_time text,
  source text not null default 'voice_call',
  internal_notes text,
  created_at timestamptz not null default now()
);

create table public.calls (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  provider_call_id text not null,
  caller_phone text,
  transcript text,
  summary text,
  duration integer check (duration is null or duration >= 0),
  outcome text,
  call_started_at timestamptz,
  call_ended_at timestamptz,
  created_at timestamptz not null default now(),
  unique (business_id, provider_call_id)
);

create table public.followups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  type public.followup_type not null,
  status public.followup_status not null default 'pending',
  scheduled_at timestamptz not null default now(),
  completed_at timestamptz,
  message text,
  created_at timestamptz not null default now()
);

create index leads_business_created_idx on public.leads (business_id, created_at desc);
create index leads_business_status_idx on public.leads (business_id, status);
create index calls_business_created_idx on public.calls (business_id, created_at desc);
create index calls_lead_idx on public.calls (lead_id);
create index followups_lead_status_idx on public.followups (lead_id, status);

create or replace function public.is_business_member(target_business_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.business_members
    where business_id = target_business_id and user_id = auth.uid()
  );
$$;

alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.leads enable row level security;
alter table public.calls enable row level security;
alter table public.followups enable row level security;

create policy "members can view their businesses" on public.businesses for select using (public.is_business_member(id));
create policy "owners can update their businesses" on public.businesses for update using (
  exists (select 1 from public.business_members where business_id = id and user_id = auth.uid() and role = 'owner')
) with check (public.is_business_member(id));
create policy "users can view their memberships" on public.business_members for select using (user_id = auth.uid());
create policy "members can view business leads" on public.leads for select using (public.is_business_member(business_id));
create policy "members can update business leads" on public.leads for update using (public.is_business_member(business_id)) with check (public.is_business_member(business_id));
create policy "members can view business calls" on public.calls for select using (public.is_business_member(business_id));
create policy "members can view business followups" on public.followups for select using (
  exists (select 1 from public.leads where leads.id = lead_id and public.is_business_member(leads.business_id))
);
