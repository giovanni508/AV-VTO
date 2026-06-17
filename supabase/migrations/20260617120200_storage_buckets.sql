-- =============================================================================
-- AV-VTO — Storage: bucket `garments` e `generations` + policy RLS
-- =============================================================================
-- Due bucket PRIVATI (public = false): l'accesso avviene via sessione utente
-- (RLS) oppure, lato server, con la chiave service_role (che bypassa la RLS).
--
-- Convenzione di path: ogni file è salvato sotto una cartella con l'UID del
-- proprietario, es. `{auth.uid()}/capo.jpg`. La RLS limita ogni operazione ai
-- file la cui PRIMA cartella corrisponde all'utente loggato.
--
--   * garments    -> capi caricati dall'utente (upload dal client)
--   * generations -> immagini finali del Virtual Try-On. L'upload del risultato
--                    lo fa il server (service_role); il client legge/cancella.
--
-- Limiti: solo immagini (png/jpeg/webp), max 10 MB per file.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('garments',    'garments',    false, 10485760, array['image/png','image/jpeg','image/webp']),
  ('generations', 'generations', false, 10485760, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;


-- ---- garments --------------------------------------------------------------
drop policy if exists "garments_select_own" on storage.objects;
create policy "garments_select_own"
  on storage.objects for select
  to authenticated
  using ( bucket_id = 'garments' and (select auth.uid())::text = (storage.foldername(name))[1] );

drop policy if exists "garments_insert_own" on storage.objects;
create policy "garments_insert_own"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'garments' and (select auth.uid())::text = (storage.foldername(name))[1] );

drop policy if exists "garments_update_own" on storage.objects;
create policy "garments_update_own"
  on storage.objects for update
  to authenticated
  using      ( bucket_id = 'garments' and (select auth.uid())::text = (storage.foldername(name))[1] )
  with check ( bucket_id = 'garments' and (select auth.uid())::text = (storage.foldername(name))[1] );

drop policy if exists "garments_delete_own" on storage.objects;
create policy "garments_delete_own"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'garments' and (select auth.uid())::text = (storage.foldername(name))[1] );


-- ---- generations -----------------------------------------------------------
drop policy if exists "generations_select_own" on storage.objects;
create policy "generations_select_own"
  on storage.objects for select
  to authenticated
  using ( bucket_id = 'generations' and (select auth.uid())::text = (storage.foldername(name))[1] );

drop policy if exists "generations_insert_own" on storage.objects;
create policy "generations_insert_own"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'generations' and (select auth.uid())::text = (storage.foldername(name))[1] );

drop policy if exists "generations_update_own" on storage.objects;
create policy "generations_update_own"
  on storage.objects for update
  to authenticated
  using      ( bucket_id = 'generations' and (select auth.uid())::text = (storage.foldername(name))[1] )
  with check ( bucket_id = 'generations' and (select auth.uid())::text = (storage.foldername(name))[1] );

drop policy if exists "generations_delete_own" on storage.objects;
create policy "generations_delete_own"
  on storage.objects for delete
  to authenticated
  using ( bucket_id = 'generations' and (select auth.uid())::text = (storage.foldername(name))[1] );
