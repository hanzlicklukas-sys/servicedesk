create table if not exists public.customers (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  phone text not null default '',
  address text not null default '',
  service text not null check (service in ('Garten', 'Technik', 'Beides')),
  note text not null default '',
  created_at date not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  customer_id text not null references public.customers(id) on delete cascade,
  title text not null,
  service text not null check (service in ('Garten', 'Technik')),
  date text not null default '',
  time text not null default '',
  price numeric,
  duration_minutes integer,
  material_cost numeric,
  payment_method text not null default 'Bar' check (payment_method in ('Offen', 'Bar', 'Überweisung', 'PayPal')),
  paid_at text not null default '',
  note text not null default '',
  status text not null check (status in ('Anfrage', 'Geplant', 'Erledigt', 'Bezahlt')),
  updated_at timestamptz not null default now()
);

create table if not exists public.deleted_records (
  record_type text not null check (record_type in ('customer', 'job')),
  record_id text not null,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  deleted_at timestamptz not null default now(),
  primary key (record_type, record_id)
);

alter table public.customers
add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

alter table public.jobs
add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

create index if not exists customers_user_id_idx on public.customers(user_id);
create index if not exists jobs_user_id_idx on public.jobs(user_id);
create index if not exists deleted_records_user_id_idx on public.deleted_records(user_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.set_servicedesk_owner()
returns trigger as $$
begin
  if new.user_id is null then
    new.user_id = auth.uid();
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists customers_updated_at on public.customers;
create trigger customers_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

drop trigger if exists customers_set_owner on public.customers;
create trigger customers_set_owner
before insert or update on public.customers
for each row execute function public.set_servicedesk_owner();

drop trigger if exists jobs_updated_at on public.jobs;
create trigger jobs_updated_at
before update on public.jobs
for each row execute function public.set_updated_at();

drop trigger if exists jobs_set_owner on public.jobs;
create trigger jobs_set_owner
before insert or update on public.jobs
for each row execute function public.set_servicedesk_owner();

drop trigger if exists deleted_records_set_owner on public.deleted_records;
create trigger deleted_records_set_owner
before insert or update on public.deleted_records
for each row execute function public.set_servicedesk_owner();

alter table public.customers enable row level security;
alter table public.jobs enable row level security;
alter table public.deleted_records enable row level security;

drop policy if exists "ServiceDesk customers read" on public.customers;
drop policy if exists "ServiceDesk customers write" on public.customers;
drop policy if exists "ServiceDesk customers own read" on public.customers;
drop policy if exists "ServiceDesk customers own insert" on public.customers;
drop policy if exists "ServiceDesk customers own update" on public.customers;
drop policy if exists "ServiceDesk customers own delete" on public.customers;

create policy "ServiceDesk customers own read"
on public.customers for select
to authenticated
using (user_id = auth.uid() or user_id is null);

create policy "ServiceDesk customers own insert"
on public.customers for insert
to authenticated
with check (user_id = auth.uid() or user_id is null);

create policy "ServiceDesk customers own update"
on public.customers for update
to authenticated
using (user_id = auth.uid() or user_id is null)
with check (user_id = auth.uid() or user_id is null);

create policy "ServiceDesk customers own delete"
on public.customers for delete
to authenticated
using (user_id = auth.uid() or user_id is null);

drop policy if exists "ServiceDesk jobs read" on public.jobs;
drop policy if exists "ServiceDesk jobs write" on public.jobs;
drop policy if exists "ServiceDesk jobs own read" on public.jobs;
drop policy if exists "ServiceDesk jobs own insert" on public.jobs;
drop policy if exists "ServiceDesk jobs own update" on public.jobs;
drop policy if exists "ServiceDesk jobs own delete" on public.jobs;

create policy "ServiceDesk jobs own read"
on public.jobs for select
to authenticated
using (user_id = auth.uid() or user_id is null);

create policy "ServiceDesk jobs own insert"
on public.jobs for insert
to authenticated
with check (user_id = auth.uid() or user_id is null);

create policy "ServiceDesk jobs own update"
on public.jobs for update
to authenticated
using (user_id = auth.uid() or user_id is null)
with check (user_id = auth.uid() or user_id is null);

create policy "ServiceDesk jobs own delete"
on public.jobs for delete
to authenticated
using (user_id = auth.uid() or user_id is null);

drop policy if exists "ServiceDesk deleted records own read" on public.deleted_records;
drop policy if exists "ServiceDesk deleted records own insert" on public.deleted_records;
drop policy if exists "ServiceDesk deleted records own update" on public.deleted_records;
drop policy if exists "ServiceDesk deleted records own delete" on public.deleted_records;

create policy "ServiceDesk deleted records own read"
on public.deleted_records for select
to authenticated
using (user_id = auth.uid() or user_id is null);

create policy "ServiceDesk deleted records own insert"
on public.deleted_records for insert
to authenticated
with check (user_id = auth.uid() or user_id is null);

create policy "ServiceDesk deleted records own update"
on public.deleted_records for update
to authenticated
using (user_id = auth.uid() or user_id is null)
with check (user_id = auth.uid() or user_id is null);

create policy "ServiceDesk deleted records own delete"
on public.deleted_records for delete
to authenticated
using (user_id = auth.uid() or user_id is null);
