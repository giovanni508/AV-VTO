-- =============================================================================
-- AV-VTO — Video (animazioni) : tabella `videos` + bucket storage + RLS
-- =============================================================================
-- I video sono generati da un'immagine (foto prodotto / shooting) con un
-- movimento di camera predefinito. Stessa convenzione owner-folder degli altri
-- bucket: ogni file vive sotto `{auth.uid()}/...` e la RLS limita l'accesso al
-- proprietario.
-- =============================================================================

-- ---- Tabella ---------------------------------------------------------------
create table if not exists public.videos (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references public.users (id) on delete cascade,
  source_image_url text,
  video_url        text,
  prompt           text,
  camera_move      text,
  duration         integer     not null default 5,
  resolution       text        not null default '720p',
  cost_in_credits  integer     not null default 0,
  created_at       timestamptz not null default now()
);

create index if not exists videos_user_id_idx on public.videos (user_id);

comment on table public.videos is 'Video (animazioni) generati dall''utente da un''immagine.';

alter table public.videos enable row level security;

-- CRUD completo per il proprietario (come ai_models).
drop policy if exists "videos_select_own" on public.videos;
create policy "videos_select_own"
  on public.videos for select
  to authenticated
  using ( (select auth.uid()) = user_id );

drop policy if exists "videos_insert_own" on public.videos;
create policy "videos_insert_own"
  on public.videos for insert
  to authenticated
  with check ( (select auth.uid()) = user_id );

drop policy if exists "videos_update_own" on public.videos;
create policy "videos_update_own"
  on public.videos for update
  to authenticated
  using      ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

drop policy if exists "videos_delete_own" on public.videos;
create policy "videos_delete_own"
  on public.videos for delete
  to authenticated
  using ( (select auth.uid()) = user_id );


-- ---- Storage bucket --------------------------------------------------------
-- Bucket PRIVATO per i file video (mp4). Limite più alto delle immagini.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('videos', 'videos', false, 104857600, array['video/mp4','video/quicktime','video/webm'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "videos_storage_select_own" on storage.objects;
create policy "videos_storage_select_own"
  on storage.objects for select
  to authenticated
  using ( bucket_id = 'videos' and (select auth.uid())::text = (storage.foldername(name))[1] );

drop policy if exists "videos_storage_insert_own" on storage.objects;
create policy "videos_storage_insert_own"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'videos' and (select auth.uid())::text = (storage.foldername(name))[1] );

drop policy if exists "videos_storage_update_own" on storage.objects;
create policy "videos_storage_update_own"
  on storage.objects for update
  to authenticated
  using      ( bucket_id = 'videos' and (select auth.uid())::text = (storage.foldername(name))[1] )
  with check ( bucket_id = 'videos' and (select auth.uid())::text = (storage.foldername(name))[1] );

drop policy if exists "videos_storage_delete_own" on storage.objects;
create policy "videos_storage_delete_own"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'videos' and (select auth.uid())::text = (storage.foldername(name))[1] );
