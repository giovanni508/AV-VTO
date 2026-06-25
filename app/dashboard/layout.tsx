import Link from "next/link";
import { redirect } from "next/navigation";
import { Coins } from "lucide-react";

import { AccountMenu } from "@/components/account-menu";
import { DashboardNav } from "@/components/dashboard-nav";
import { Logo } from "@/components/logo";
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
          className="transition-opacity hover:opacity-80"
          aria-label="AV-VTO, vai alla dashboard"
        >
          <Logo />
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/account"
            className="brand-gradient shadow-brand-700/30 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.03]"
            aria-label="Crediti disponibili, vai all'account"
          >
            <Coins className="size-4" />
            {credits.toLocaleString("it-IT")}
          </Link>
          <AccountMenu email={profile?.email ?? user.email ?? ""} />
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
