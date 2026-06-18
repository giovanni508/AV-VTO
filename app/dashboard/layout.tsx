import Link from "next/link";
import { redirect } from "next/navigation";
import { Coins } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DashboardNav } from "@/components/dashboard-nav";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("email, credits_balance")
    .eq("id", user.id)
    .single();

  const credits = profile?.credits_balance ?? 0;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="bg-background/80 sticky top-0 z-30 flex items-center justify-between border-b px-6 py-3 backdrop-blur">
        <Link
          href="/dashboard"
          className="text-lg font-bold tracking-tight transition-opacity hover:opacity-80"
        >
          AV<span className="text-gradient">·VTO</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="brand-gradient shadow-brand-700/30 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold text-white shadow-sm">
            <Coins className="size-4" />
            {credits.toLocaleString("it-IT")}
          </span>
          <span className="text-muted-foreground hidden text-sm sm:inline">
            {profile?.email ?? user.email}
          </span>
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="outline" size="sm">
              Esci
            </Button>
          </form>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-56 shrink-0 border-r p-4 sm:block">
          <DashboardNav />
        </aside>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
