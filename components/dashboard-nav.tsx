"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ImageIcon, LayoutDashboard, Users } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Panoramica", icon: LayoutDashboard },
  { href: "/dashboard/models", label: "I tuoi modelli", icon: Users },
  { href: "/dashboard/generations", label: "Shooting", icon: ImageIcon },
];

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
                active ? "text-white" : "",
              )}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
