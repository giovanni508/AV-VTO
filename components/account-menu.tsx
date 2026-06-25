"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, UserCog } from "lucide-react";

export function AccountMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initial = email.charAt(0).toUpperCase() || "?";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu account"
        className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-full border py-1 pr-2.5 pl-1 transition-colors"
      >
        <span className="brand-gradient flex size-7 items-center justify-center rounded-full text-xs font-semibold text-white">
          {initial}
        </span>
        <span className="text-muted-foreground hidden max-w-[16ch] truncate text-sm sm:inline">
          {email}
        </span>
        <ChevronDown className="text-muted-foreground size-4" />
      </button>

      {open ? (
        <div
          role="menu"
          className="bg-popover text-popover-foreground absolute right-0 z-40 mt-2 w-60 overflow-hidden rounded-xl border shadow-lg"
        >
          <div className="border-b px-3 py-2.5">
            <p className="text-muted-foreground text-xs">Connesso come</p>
            <p className="truncate text-sm font-medium">{email}</p>
          </div>
          <Link
            href="/dashboard/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="hover:bg-accent flex items-center gap-2 px-3 py-2.5 text-sm transition-colors"
          >
            <UserCog className="size-4" />
            Gestione account
          </Link>
          <form action="/auth/signout" method="post" className="border-t">
            <button
              type="submit"
              role="menuitem"
              className="hover:bg-accent text-destructive flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-sm transition-colors"
            >
              <LogOut className="size-4" />
              Esci
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
