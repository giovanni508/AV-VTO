"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ImageIcon, LayoutDashboard, Users } from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Panoramica", icon: LayoutDashboard },
  { href: "/dashboard/models", label: "I tuoi modelli", icon: Users },
  { href: "/dashboard/generations", label: "Shooting", icon: ImageIcon },
  { href: "/dashboard/guida", label: "Guida", icon: BookOpen },
];

function NavSpinner({ active }: { active: boolean }) {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return <Spinner className={cn("ml-auto size-3.5", active && "text-white")} />;
}

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/dashboard"
            ? pathname === href
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
              active
                ? "brand-gradient text-white shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Icon
              className={cn(
                "size-4 transition-transform duration-200 group-hover:scale-110",
                active && "text-white",
              )}
            />
            {label}
            <NavSpinner active={active} />
          </Link>
        );
      })}
    </nav>
  );
}
