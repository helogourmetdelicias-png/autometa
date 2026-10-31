-- Execute no SQL Editor do mesmo projeto Supabase já usado para as fotos.
-- Os vídeos são públicos para permitir que a Meta os busque; escrita só pelo servidor
-- ou por uma autorização temporária de upload gerada após validar ADMIN_SECRET.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('marketing-videos', 'marketing-videos', true, 52428800, array['video/mp4'])
on conflict (id) do update set public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
