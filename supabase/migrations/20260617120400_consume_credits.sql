-- =============================================================================
-- AV-VTO — RPC generica per scalare crediti senza creare una generation
-- =============================================================================
-- `consume_credits_for_generation` crea una riga `generations`: va bene per gli
-- shooting, ma non per altri addebiti (es. la generazione di un modello).
-- Questa funzione scala i crediti in modo atomico e basta.
-- =============================================================================

create or replace function public.consume_credits(p_cost integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_cost < 0 then
    raise exception 'Il costo non può essere negativo';
  end if;

  update public.users
     set credits_balance = credits_balance - p_cost
   where id = v_user_id
     and credits_balance >= p_cost;

  if not found then
    raise exception 'Crediti insufficienti';
  end if;
end;
$$;

revoke execute on function public.consume_credits(integer) from public, anon;
grant  execute on function public.consume_credits(integer) to authenticated;
