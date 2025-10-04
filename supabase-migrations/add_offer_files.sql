-- Create dedicated bucket for offer file uploads (idempotent)
insert into storage.buckets (id, name, public)
values ('quote-uploads', 'quote-uploads', false)
on conflict (id) do update set public = excluded.public;

-- Table to track uploaded files tied to chat sessions/offers
create table if not exists public.offer_files (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid references public.offers(id) on delete cascade,
  session_id uuid not null,
  file_name text not null,
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists offer_files_session_idx on public.offer_files (session_id);
create index if not exists offer_files_offer_idx on public.offer_files (offer_id);

alter table public.offer_files enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'offer_files'
      and policyname = 'Offer files service access'
  ) then
    execute 'create policy "Offer files service access" on public.offer_files
      for all
      using (auth.role() = ''service_role'')
      with check (auth.role() = ''service_role'')';
  end if;
end $$;
