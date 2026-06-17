import Link from "next/link";
import { redirect } from "next/navigation";
import { Coins, ImageIcon, LayoutDashboard, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

const NAV = [
  { href: "/dashboard", label: "Panoramica", icon: LayoutDashboard },
  { href: "/dashboard/models", label: "I tuoi modelli", icon: Users },
  { href: "/dashboard/generations", label: "Shooting", icon: ImageIcon },
];

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
      <header className="flex items-center justify-between border-b px-6 py-3">
        <Link href="/dashboard" className="font-semibold tracking-tight">
          AV·VTO
        </Link>
        <div className="flex items-center gap-3">
          <span className="bg-muted inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium">
            <Coins className="size-4" />
            {credits} crediti
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
          <nav className="flex flex-col gap-1">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="text-muted-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
