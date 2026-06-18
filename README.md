# AV-VTO — Virtual Try-On per negozi di abbigliamento

SaaS che genera foto di modelli AI che indossano i tuoi capi. Carichi un capo,
scegli un modello e ottieni uno shooting professionale in pochi secondi.

Stack: **Next.js (App Router) · Supabase (Auth, Postgres, Storage) · Replicate (IDM-VTON)**.

## Funzionalità

- **Auth** email/password con Supabase (conferma email, sessioni via middleware).
- **Crediti**: ogni shooting scala crediti in modo atomico e a prova di
  race-condition (RPC `consume_credits_for_generation`). Il saldo è modificabile
  solo lato server.
- **Modelli**: carica e gestisci le foto dei modelli (bucket privato `models`).
- **Shooting Virtual Try-On**: capo + modello → immagine generata con Replicate,
  salvata nel bucket privato `generations`.
- **RLS** ovunque: ogni utente vede e tocca solo i propri dati.

## Setup

1. Installa le dipendenze:

   ```bash
   pnpm install
   ```

2. Copia `.env.example` in `.env.local` e compila i valori:

   ```bash
   cp .env.example .env.local
   ```

   | Variabile | Dove |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | idem (chiave pubblica) |
   | `SUPABASE_SERVICE_ROLE_KEY` | idem (chiave `service_role`, **segreta**) |
   | `REPLICATE_API_TOKEN` | https://replicate.com/account/api-tokens |
   | `REPLICATE_MODEL` | opzionale, default `cuuupid/idm-vton` |

3. Applica lo schema del database (tabelle, RLS, trigger, funzioni crediti) e
   crea i bucket di storage. Le migration sono in `supabase/migrations/`:

   ```bash
   supabase db push          # oppure esegui gli .sql nell'SQL Editor
   ```

4. (Solo sviluppo) crea l'utente di test con crediti "infiniti" da
   `supabase/seed_test_user.sql` — credenziali `test@av-vto.dev` / `Password123!`.

5. Avvia il dev server:

   ```bash
   pnpm dev
   ```

   Apri [http://localhost:3000](http://localhost:3000).

## Deploy

Per mettere l'app online su Vercel segui **[DEPLOY.md](./DEPLOY.md)** (import del
repo, variabili d'ambiente, configurazione di Supabase Auth per il dominio di
produzione).

## Architettura del flusso di generazione

1. L'utente sceglie un modello e carica un capo (`/dashboard/generations/new`).
2. La Server Action `createGeneration`:
   - verifica i crediti, carica il capo nello storage privato;
   - invia modello + capo a Replicate come data URI (nessun hosting pubblico);
   - **solo a generazione riuscita** scala i crediti e crea la riga
     `generations` (RPC atomica);
   - scarica il risultato, lo salva nel bucket `generations` e scrive l'URL
     usando la chiave `service_role` (il client non può toccare quella colonna).
3. Le immagini dei bucket privati sono mostrate via signed URL temporanei.
