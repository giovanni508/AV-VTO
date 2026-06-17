-- =============================================================================
-- AV-VTO — Utente di TEST con crediti "infiniti"  (SOLO sviluppo, non in prod)
-- =============================================================================
-- Credenziali:  email = test@av-vto.dev   password = Password123!
-- Crediti:      1.000.000.000 (limite massimo di int4 = ~2,1 mld)
--
-- DUE MODI per crearlo:
--
--   MODO A (consigliato, a prova di errore):
--     1. Supabase Dashboard -> Authentication -> Users -> "Add user"
--        - Email: test@av-vto.dev,  Password: Password123!
--        - spunta "Auto Confirm User"
--     2. Esegui SOLO questa riga nell'SQL Editor:
--          update public.users set credits_balance = 1000000000
--           where email = 'test@av-vto.dev';
--
--   MODO B (tutto via SQL): incolla l'intero blocco DO qui sotto nell'SQL Editor.
--     Crea l'utente auth + identity (email già confermata) e setta i crediti.
-- =============================================================================

do $$
declare
  v_user_id uuid := '00000000-0000-0000-0000-0000000000aa';
  v_email   text := 'test@av-vto.dev';
begin
  -- 1. Utente in auth.users (con email già confermata), se non esiste già.
  if not exists (select 1 from auth.users where id = v_user_id) then
    insert into auth.users (
      instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at,
      created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_user_id, 'authenticated', 'authenticated', v_email,
      -- pgcrypto vive nello schema `extensions` su Supabase.
      -- Se dovesse dare errore, prova `crypt(...)` / `gen_salt(...)` senza prefisso.
      extensions.crypt('Password123!', extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb
    );

    -- 2. Identity collegata: necessaria per il login email/password.
    insert into auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', v_email),
      'email', v_user_id::text,
      now(), now(), now()
    );
  end if;

  -- 3. Crediti "infiniti". Il trigger handle_new_user ha già creato il profilo
  --    in public.users con saldo 0: qui lo portiamo al massimo.
  update public.users
     set credits_balance = 1000000000
   where id = v_user_id;
end $$;
