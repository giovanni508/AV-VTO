# Deploy di AV-VTO su Vercel

Guida passo-passo per mettere online l'app. Tempo stimato: ~15 minuti.

Prerequisiti già pronti:

- ✅ Codice su GitHub (`giovanni508/AV-VTO`, branch da deployare).
- ✅ Progetto Supabase (`xhxhushkeoeegkyxqbyt`) con schema, RLS e bucket applicati.
- ✅ Token Replicate.

---

## 1. Importa il progetto su Vercel

1. Vai su [vercel.com/new](https://vercel.com/new) e accedi con GitHub.
2. Importa il repository **AV-VTO**.
3. Framework: **Next.js** (rilevato in automatico). Non cambiare build/output.
4. **Non** premere ancora "Deploy": prima imposta le variabili (passo 2).

## 2. Variabili d'ambiente

In Vercel → Project → **Settings → Environment Variables**, aggiungi (per gli
ambienti *Production* e *Preview*):

| Nome | Valore | Note |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xhxhushkeoeegkyxqbyt.supabase.co` | pubblica |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key del progetto | pubblica |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key | **segreta** |
| `REPLICATE_API_TOKEN` | token Replicate | **segreta** |
| `REPLICATE_MODEL` | `cuuupid/idm-vton` | opzionale |

> Le prime due le trovi su Supabase → Project Settings → API; lì c'è anche la
> `service_role` (sezione "Project API keys", mostrala con "Reveal").

Poi premi **Deploy**. Al termine avrai un URL tipo `https://av-vto.vercel.app`.

## 3. Configura Supabase Auth per il dominio di produzione

Senza questo passo, i link di conferma email punterebbero a `localhost`.

In Supabase → **Authentication → URL Configuration**:

- **Site URL**: `https://IL-TUO-DOMINIO.vercel.app`
- **Redirect URLs**: aggiungi `https://IL-TUO-DOMINIO.vercel.app/**`

In **Authentication → Email Templates → Confirm signup**, assicurati che il
link punti al nostro handler:

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
```

## 4. Schema del database

Già applicato a questo progetto. Per un progetto Supabase nuovo, esegui le
migration in `supabase/migrations/` (in ordine) con `supabase db push` oppure
incollandole nell'SQL Editor, più `supabase/seed_test_user.sql` (solo dev).

## 5. Prova finale (smoke test)

1. Apri l'URL di produzione.
2. Accedi con l'utente di test (`test@av-vto.dev` / `Password123!`) — è già
   confermato, non serve email.
3. Dashboard → **I tuoi modelli** → carica una foto di un modello.
4. **Nuovo shooting** → scegli il modello, carica un capo, genera.
5. Controlla che l'immagine finale compaia nello storico.

---

## Note di produzione

- **Durata generazione**: il Virtual Try-On può richiedere ~1 minuto. La route
  è impostata a `maxDuration = 60` (limite del piano **Hobby**). Per margine
  maggiore usa il piano **Pro** (fino a 300s).
- **Upload immagini**: avvengono direttamente browser → Supabase Storage, quindi
  non sono soggetti al limite di ~4,5 MB del body delle function Vercel.
- **Sicurezza**: `SUPABASE_SERVICE_ROLE_KEY` e `REPLICATE_API_TOKEN` restano
  solo lato server (nessun prefisso `NEXT_PUBLIC_`). Non vengono mai inviate al
  browser.
- **Token Replicate in chiaro**: se è transitato in canali non fidati,
  rigeneralo su Replicate e aggiorna la variabile su Vercel.
