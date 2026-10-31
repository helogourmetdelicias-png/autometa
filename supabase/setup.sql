-- Execute uma vez no SQL Editor do seu projeto Supabase.
create table if not exists public.autometa_data (
  key text primary key,
  value jsonb not null
);
alter table public.autometa_data enable row level security;
revoke all on public.autometa_data from anon, authenticated;
grant all on public.autometa_data to service_role;

-- Fotos promocionais públicas; gravação somente pelo servidor autorizado.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('marketing-images', 'marketing-images', true, 3145728, array['image/jpeg', 'image/png'])
on conflict (id) do update set public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
