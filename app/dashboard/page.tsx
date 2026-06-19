import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Coins,
  ImageIcon,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/count-up";
import { CreditsChart } from "@/components/credits-chart";
import { EmptyState } from "@/components/empty-state";
import { createClient } from "@/lib/supabase/server";
import { createSignedUrl } from "@/lib/storage";
import { GARMENT_TYPES, STORAGE_BUCKETS } from "@/lib/config";

const TYPE_LABELS = Object.fromEntries(GARMENT_TYPES.map((t) => [t.value, t.label]));

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const uid = user!.id;

  // Inizio finestra grafico: 30 giorni fa, a mezzanotte.
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - 29);

  // Tutte le query rispettano la RLS: solo i dati dell'utente corrente.
  const [
    { data: profile },
    { count: modelsCount },
    { count: generationsCount },
    { data: costs },
    { data: usage },
    { data: recentGenerations },
    { data: recentModels },
  ] = await Promise.all([
    supabase.from("users").select("credits_balance").eq("id", uid).single(),
    supabase
      .from("ai_models")
      .select("*", { count: "exact", head: true })
      .eq("user_id", uid),
    supabase
      .from("generations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", uid),
    supabase.from("generations").select("cost_in_credits"),
    supabase
      .from("generations")
      .select("cost_in_credits, created_at")
      .gte("created_at", since.toISOString()),
    supabase
      .from("generations")
      .select("id, garment_type, generated_image_url, created_at")
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("ai_models")
      .select("id, name, image_url")
      .order("created_at", { ascending: false })
      .limit(4),
  ]);

  const creditsUsed = (costs ?? []).reduce(
    (sum, row) => sum + (row.cost_in_credits ?? 0),
    0,
  );

  // Aggrega l'uso crediti per giorno (30 bucket) per il grafico.
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    return {
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" }),
      value: 0,
    };
  });
  const indexByKey = new Map(days.map((d, i) => [d.key, i]));
  for (const row of usage ?? []) {
    const key = new Date(row.created_at).toISOString().slice(0, 10);
    const idx = indexByKey.get(key);
    if (idx != null) days[idx].value += row.cost_in_credits ?? 0;
  }
  const chartData = days.map((d) => ({ label: d.label, value: d.value }));

  const generations = await Promise.all(
    (recentGenerations ?? []).map(async (g) => ({
      ...g,
      imageUrl: await createSignedUrl(
        supabase,
        STORAGE_BUCKETS.generations,
        g.generated_image_url,
      ),
    })),
  );
  const models = await Promise.all(
    (recentModels ?? []).map(async (m) => ({
      ...m,
      thumbUrl: await createSignedUrl(
        supabase,
        STORAGE_BUCKETS.models,
        m.image_url,
      ),
    })),
  );

  const stats = [
    {
      icon: Coins,
      label: "Crediti disponibili",
      value: profile?.credits_balance ?? 0,
    },
    { icon: ImageIcon, label: "Shooting totali", value: generationsCount ?? 0 },
    { icon: Users, label: "Modelli salvati", value: modelsCount ?? 0 },
    { icon: TrendingUp, label: "Crediti usati", value: creditsUsed },
  ];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      {/* Header */}
      <div className="animate-fade-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Panoramica</h1>
          <p className="text-muted-foreground mt-1">
            Crea un nuovo shooting o gestisci i tuoi modelli.
          </p>
        </div>
        <Button asChild variant="brand" size="lg">
          <Link href="/dashboard/generations/new">
            <Sparkles className="size-4" />
            Nuovo shooting
          </Link>
        </Button>
      </div>

      {/* Statistiche */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="animate-fade-up bg-card hover:shadow-brand hover:border-brand-400/50 rounded-xl border p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5"
            style={{ animationDelay: `${i * 70 + 60}ms` }}
          >
            <div className="brand-gradient mb-3 inline-flex size-9 items-center justify-center rounded-lg text-white shadow-sm">
              <s.icon className="size-5" />
            </div>
            <p className="text-3xl font-semibold tracking-tight tabular-nums">
              <CountUp value={s.value} />
            </p>
            <p className="text-muted-foreground mt-1 text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Grafico uso crediti */}
      <section
        className="animate-fade-up bg-card rounded-xl border p-5 shadow-sm"
        style={{ animationDelay: "300ms" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Uso crediti</h2>
          <span className="text-muted-foreground text-xs">Ultimi 30 giorni</span>
        </div>
        <CreditsChart data={chartData} />
      </section>

      {/* Ultimi shooting */}
      <section
        className="animate-fade-up flex flex-col gap-4"
        style={{ animationDelay: "380ms" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Ultimi shooting</h2>
          {generations.length > 0 ? (
            <Link
              href="/dashboard/generations"
              className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
            >
              Vedi tutti
              <ArrowRight className="size-3.5" />
            </Link>
          ) : null}
        </div>

        {generations.length > 0 ? (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {generations.map((g, i) => (
              <li
                key={g.id}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 70 + 360}ms` }}
              >
                <Link
                  href={`/dashboard/generations/${g.id}`}
                  className="hover:border-brand-400/60 block overflow-hidden rounded-lg border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="bg-muted aspect-[3/4] w-full">
                    {g.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={g.imageUrl}
                        alt="Shooting generato"
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground flex size-full flex-col items-center justify-center gap-1 text-xs">
                        <Clock className="size-4" />
                        In lavorazione
                      </div>
                    )}
                  </div>
                  <p className="truncate px-2 py-1.5 text-xs">
                    {TYPE_LABELS[g.garment_type] ?? g.garment_type}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={<ImageIcon className="size-6" />}
            title="Ancora nessuno shooting"
            description="Genera il tuo primo scatto: con modello o packshot per l'e-commerce."
            action={
              <Button asChild variant="brand" size="sm">
                <Link href="/dashboard/generations/new">
                  <Plus className="size-4" />
                  Crea il primo shooting
                </Link>
              </Button>
            }
          />
        )}
      </section>

      {/* I tuoi modelli */}
      <section
        className="animate-fade-up flex flex-col gap-4"
        style={{ animationDelay: "420ms" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">I tuoi modelli</h2>
          <Link
            href="/dashboard/models"
            className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
          >
            Gestisci
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {models.length > 0 ? (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {models.map((m, i) => (
              <li
                key={m.id}
                className="animate-fade-up hover:border-brand-400/60 overflow-hidden rounded-lg border transition-all duration-300 hover:shadow-md"
                style={{ animationDelay: `${i * 70 + 460}ms` }}
              >
                <div className="bg-muted aspect-[3/4] w-full">
                  {m.thumbUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.thumbUrl}
                      alt={m.name ?? "Modello"}
                      className="size-full object-cover"
                    />
                  ) : null}
                </div>
                <p className="truncate px-2 py-1.5 text-xs font-medium">
                  {m.name ?? "Senza nome"}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={<Users className="size-6" />}
            title="Nessun modello ancora"
            description="Aggiungi la foto di un modello per generare shooting con modello."
            action={
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/models">
                  <Plus className="size-4" />
                  Aggiungi modello
                </Link>
              </Button>
            }
          />
        )}
      </section>
    </div>
  );
}
