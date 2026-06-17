-- =============================================================================
-- AV-VTO — Funzioni RPC per la gestione sicura dei crediti  (OPZIONALE ma consigliato)
-- =============================================================================
-- Le mutazioni del saldo crediti NON passano mai dal client. Si usano queste
-- funzioni atomiche (a prova di race-condition) chiamate da:
--   * consume_credits_for_generation -> Server Action / route handler di Next.js
--                                       eseguita con la sessione dell'utente
--                                       (createServerClient) => auth.uid() valido.
--   * credit_purchase                -> webhook Stripe, lato server, con la chiave
--                                       service_role (nessuna sessione utente).
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Scala i crediti e registra la generation in UN'UNICA transazione atomica.
-- Ritorna la riga creata. Solleva eccezione se il saldo è insufficiente.
-- -----------------------------------------------------------------------------
create or replace function public.consume_credits_for_generation(
  p_original_garment_url text,
  p_garment_type         text,
  p_cost                 integer
)
returns public.generations
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_row     public.generations;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_cost < 0 then
    raise exception 'Il costo non può essere negativo';
  end if;

  -- Scala i crediti SOLO se il saldo è sufficiente. L'UPDATE prende un lock di
  -- riga: due richieste concorrenti dello stesso utente vengono serializzate,
  -- quindi il saldo non può mai andare sotto zero.
  update public.users
     set credits_balance = credits_balance - p_cost
   where id = v_user_id
     and credits_balance >= p_cost;

  if not found then
    raise exception 'Crediti insufficienti';
  end if;

  insert into public.generations (user_id, original_garment_url, garment_type, cost_in_credits)
  values (v_user_id, p_original_garment_url, p_garment_type, p_cost)
  returning * into v_row;

  return v_row;
end;
$$;


-- -----------------------------------------------------------------------------
-- Accredita i crediti dopo un pagamento Stripe e registra la transazione.
-- Idempotente sui webhook ripetuti grazie a stripe_payment_id UNIQUE.
-- Da chiamare SOLO lato server (service_role).
-- -----------------------------------------------------------------------------
create or replace function public.credit_purchase(
  p_user_id           uuid,
  p_stripe_payment_id text,
  p_credits           integer,
  p_amount_eur        numeric
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Se la transazione esiste già (webhook duplicato), non accreditiamo due volte.
  insert into public.transactions (user_id, stripe_payment_id, credits_added, amount_eur)
  values (p_user_id, p_stripe_payment_id, p_credits, p_amount_eur)
  on conflict (stripe_payment_id) do nothing;

  if not found then
    return;  -- pagamento già processato
  end if;

  update public.users
     set credits_balance = credits_balance + p_credits
   where id = p_user_id;
end;
$$;


-- -----------------------------------------------------------------------------
-- Permessi di esecuzione
-- -----------------------------------------------------------------------------
-- consume: la chiama l'utente loggato (tramite il nostro server) => OK ad authenticated.
grant execute on function public.consume_credits_for_generation(text, text, integer) to authenticated;

-- credit_purchase: la usa SOLO il server (service_role). Mai esposta al client.
revoke execute on function public.credit_purchase(uuid, text, integer, numeric) from public, anon, authenticated;
