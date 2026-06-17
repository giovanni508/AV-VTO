-- =============================================================================
-- AV-VTO — Storage: bucket `models` + policy RLS
-- =============================================================================
-- Foto dei modelli (persone) salvati dall'utente e riutilizzabili negli
-- shooting. Bucket PRIVATO, stessa convenzione owner-folder degli altri:
-- ogni file vive sotto `{auth.uid()}/...` e la RLS limita l'accesso al
-- proprietario.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('models', 'models', false, 10485760, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "models_select_own" on storage.objects;
create policy "models_select_own"
  on storage.objects for select
  to authenticated
  using ( bucket_id = 'models' and (select auth.uid())::text = (storage.foldername(name))[1] );

drop policy if exists "models_insert_own" on storage.objects;
create policy "models_insert_own"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'models' and (select auth.uid())::text = (storage.foldername(name))[1] );

drop policy if exists "models_update_own" on storage.objects;
create policy "models_update_own"
  on storage.objects for update
  to authenticated
  using      ( bucket_id = 'models' and (select auth.uid())::text = (storage.foldername(name))[1] )
  with check ( bucket_id = 'models' and (select auth.uid())::text = (storage.foldername(name))[1] );

drop policy if exists "models_delete_own" on storage.objects;
create policy "models_delete_own"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'models' and (select auth.uid())::text = (storage.foldername(name))[1] );
