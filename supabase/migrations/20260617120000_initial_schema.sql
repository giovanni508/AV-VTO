-- =============================================================================
-- AV-VTO — Schema iniziale del database (Supabase / PostgreSQL)
-- =============================================================================
-- Virtual Try-On SaaS per negozi di abbigliamento.
-- Esegui questo script nell'SQL Editor di Supabase (o tramite `supabase db push`).
--
-- Contenuto:
--   1. Tabelle:   users, ai_models, generations, transactions
--   2. Indici sulle foreign key (Postgres non li crea in automatico)
--   3. Trigger di creazione automatica del profilo utente
--   4. Row Level Security (RLS) + policy per ogni tabella
--   5. "Blindatura" del saldo crediti (modificabile solo lato server)
--
-- Convenzione: nomi tabelle/colonne in snake_case minuscolo (best practice PG).
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. TABELLA: users
--    Profilo applicativo collegato 1:1 con auth.users (gestita da Supabase Auth).
--    Teniamo i dati di business qui, NON dentro lo schema `auth`.
-- -----------------------------------------------------------------------------
create table if not exists public.users (
  id              uuid        primary key references auth.users (id) on delete cascade,
  email           text,
  credits_balance integer     not null default 0 check (credits_balance >= 0),
  created_at      timestamptz not null default now()
);

comment on table  public.users                 is 'Profilo utente applicativo, collegato 1:1 con auth.users.';
comment on column public.users.credits_balance is 'Saldo crediti. Modificabile SOLO lato server (service_role) — mai dal client.';


-- -----------------------------------------------------------------------------
-- 2. TABELLA: ai_models
--    Modelli AI (foto di modelli) generati o salvati dall'utente.
-- -----------------------------------------------------------------------------
create table if not exists public.ai_models (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references public.users (id) on delete cascade,
  image_url  text        not null,
  name       text,
  created_at timestamptz not null default now()
);

create index if not exists ai_models_user_id_idx on public.ai_models (user_id);

comment on table public.ai_models is 'Modelli AI salvati o generati dall''utente.';


-- -----------------------------------------------------------------------------
-- 3. TABELLA: generations
--    Storico degli shooting generati (capo caricato -> immagine finale).
-- -----------------------------------------------------------------------------
create table if not exists public.generations (
  id                   uuid        primary key default gen_random_uuid(),
  user_id              uuid        not null references public.users (id) on delete cascade,
  original_garment_url text        not null,
  -- Modalità di input/generazione. CHECK invece di ENUM: più facile da estendere.
  garment_type         text        not null check (garment_type in ('mannequin', 'flat_lay', 'model')),
  generated_image_url  text,        -- null finché Replicate non ha risposto
  cost_in_credits      integer     not null default 0 check (cost_in_credits >= 0),
  created_at           timestamptz not null default now()
);

create index if not exists generations_user_id_idx on public.generations (user_id);

comment on table public.generations is 'Storico degli shooting Virtual Try-On generati.';


-- -----------------------------------------------------------------------------
-- 4. TABELLA: transactions
--    Storico delle ricariche crediti (pagamenti Stripe).
--    Scrivibile SOLO lato server (webhook Stripe con service_role).
-- -----------------------------------------------------------------------------
create table if not exists public.transactions (
  id                uuid          primary key default gen_random_uuid(),
  user_id           uuid          not null references public.users (id) on delete cascade,
  stripe_payment_id text          unique,  -- unique = idempotenza sui webhook ripetuti
  credits_added     integer       not null check (credits_added > 0),
  amount_eur        numeric(10,2) not null check (amount_eur >= 0),
  created_at        timestamptz   not null default now()
);

create index if not exists transactions_user_id_idx on public.transactions (user_id);

comment on table public.transactions is 'Storico ricariche crediti via Stripe. Scrittura solo lato server.';


-- -----------------------------------------------------------------------------
-- 5. TRIGGER: creazione automatica del profilo
--    Quando un utente si registra (riga in auth.users), creiamo in automatico
--    la riga corrispondente in public.users.
--    SECURITY DEFINER + search_path vuoto = funzione "blindata" (anti-hijack).
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- =============================================================================
-- 6. ROW LEVEL SECURITY
-- =============================================================================
-- Abilitando la RLS, di default NESSUNA riga è leggibile/scrivibile: apriamo
-- poi solo lo stretto necessario. Regola d'oro: ogni riga "appartiene" a un
-- utente identificato da auth.uid() (l'id ricavato dal JWT della sessione).
-- Tutte le policy sono limitate al ruolo `authenticated`: il ruolo `anon`
-- (utente non loggato) non ha alcuna policy => non vede e non scrive nulla.
-- Nota performance: auth.uid() è incapsulato in (select ...) così il planner
-- lo valuta UNA volta sola invece che riga per riga.
-- =============================================================================

alter table public.users        enable row level security;
alter table public.ai_models    enable row level security;
alter table public.generations  enable row level security;
alter table public.transactions enable row level security;


-- ---- users -----------------------------------------------------------------
drop policy if exists "users_select_own" on public.users;
create policy "users_select_own"
  on public.users for select
  to authenticated
  using ( (select auth.uid()) = id );

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own"
  on public.users for update
  to authenticated
  using      ( (select auth.uid()) = id )
  with check ( (select auth.uid()) = id );

-- Nessuna policy INSERT/DELETE: il profilo lo crea il trigger,
-- e l'eliminazione avviene in cascata dalla cancellazione in auth.users.

-- BLINDATURA SALDO: l'utente può aggiornare SOLO la colonna `email`.
-- Qualsiasi tentativo di toccare `credits_balance` dal client fallisce con
-- "permission denied" a livello di privilegi di colonna (prima ancora della RLS).
-- Il service_role (lato server) non è soggetto a questa revoca.
revoke update             on public.users from authenticated;
grant  update (email)     on public.users to   authenticated;


-- ---- ai_models -------------------------------------------------------------
-- CRUD completo: i modelli sono dati "innocui", l'utente li gestisce liberamente.
drop policy if exists "ai_models_select_own" on public.ai_models;
create policy "ai_models_select_own"
  on public.ai_models for select
  to authenticated
  using ( (select auth.uid()) = user_id );

drop policy if exists "ai_models_insert_own" on public.ai_models;
create policy "ai_models_insert_own"
  on public.ai_models for insert
  to authenticated
  with check ( (select auth.uid()) = user_id );

drop policy if exists "ai_models_update_own" on public.ai_models;
create policy "ai_models_update_own"
  on public.ai_models for update
  to authenticated
  using      ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

drop policy if exists "ai_models_delete_own" on public.ai_models;
create policy "ai_models_delete_own"
  on public.ai_models for delete
  to authenticated
  using ( (select auth.uid()) = user_id );


-- ---- generations -----------------------------------------------------------
-- L'utente legge/crea/cancella i propri shooting. Niente UPDATE dal client:
-- `generated_image_url` lo scrive il server (service_role) quando Replicate
-- ha finito; lo storico per il resto è immutabile.
drop policy if exists "generations_select_own" on public.generations;
create policy "generations_select_own"
  on public.generations for select
  to authenticated
  using ( (select auth.uid()) = user_id );

drop policy if exists "generations_insert_own" on public.generations;
create policy "generations_insert_own"
  on public.generations for insert
  to authenticated
  with check ( (select auth.uid()) = user_id );

drop policy if exists "generations_delete_own" on public.generations;
create policy "generations_delete_own"
  on public.generations for delete
  to authenticated
  using ( (select auth.uid()) = user_id );


-- ---- transactions ----------------------------------------------------------
-- SOLO lettura lato client. L'inserimento avviene esclusivamente lato server
-- dal webhook Stripe (chiave service_role, che bypassa la RLS). Così l'utente
-- non può "auto-regalarsi" crediti scrivendo transazioni fasulle.
drop policy if exists "transactions_select_own" on public.transactions;
create policy "transactions_select_own"
  on public.transactions for select
  to authenticated
  using ( (select auth.uid()) = user_id );

-- (Nessuna policy INSERT/UPDATE/DELETE => bloccate per ogni utente loggato.)
