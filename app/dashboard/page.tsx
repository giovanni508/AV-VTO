import { ImageIcon, Plus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Le query rispettano la RLS: ritornano solo i dati dell'utente corrente.
  const [{ count: modelsCount }, { count: generationsCount }] =
    await Promise.all([
      supabase
        .from("ai_models")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id),
      supabase
        .from("generations")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id),
    ]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Panoramica</h1>
        <p className="text-muted-foreground mt-1">
          Crea un nuovo shooting o gestisci i tuoi modelli.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <EmptyState
          icon={<Users className="size-5" />}
          title="I tuoi modelli"
          count={modelsCount ?? 0}
          description="Salva i modelli AI da riutilizzare nei tuoi shooting."
          actionLabel="Aggiungi modello"
        />
        <EmptyState
          icon={<ImageIcon className="size-5" />}
          title="I tuoi shooting"
          count={generationsCount ?? 0}
          description="Lo storico delle immagini generate apparirà qui."
          actionLabel="Nuovo shooting"
        />
      </div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  count,
  description,
  actionLabel,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  description: string;
  actionLabel: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="text-muted-foreground flex items-center gap-2">
          {icon}
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-3xl font-semibold tabular-nums">{count}</p>
        <Button size="sm" variant="outline" className="w-fit" disabled>
          <Plus className="size-4" />
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
