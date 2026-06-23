import { Coins, LogOut, Mail, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChangePasswordForm } from "@/components/change-password-form";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("email, credits_balance, created_at")
    .eq("id", user!.id)
    .single();

  const email = profile?.email ?? user!.email ?? "—";
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="text-muted-foreground mt-1">
          Gestisci il tuo profilo, la sicurezza e la sessione.
        </p>
      </div>

      {/* Profilo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profilo</CardTitle>
          <CardDescription>I dati del tuo account.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col divide-y">
          <Row icon={<Mail className="size-4" />} label="Email" value={email} />
          <Row
            icon={<Coins className="size-4" />}
            label="Crediti disponibili"
            value={(profile?.credits_balance ?? 0).toLocaleString("it-IT")}
          />
          <Row
            icon={<ShieldCheck className="size-4" />}
            label="Membro dal"
            value={memberSince}
          />
        </CardContent>
      </Card>

      {/* Sicurezza */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sicurezza</CardTitle>
          <CardDescription>Cambia la password di accesso.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>

      {/* Sessione */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sessione</CardTitle>
          <CardDescription>Esci da questo dispositivo.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="outline">
              <LogOut className="size-4" />
              Esci dall&apos;account
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <span className="text-muted-foreground flex items-center gap-2 text-sm">
        {icon}
        {label}
      </span>
      <span className="truncate text-sm font-medium tabular-nums">{value}</span>
    </div>
  );
}
