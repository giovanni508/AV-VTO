"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

/** Marchio "pinwheel" (4 quadranti), bianco. */
function Pinwheel({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" fill="currentColor" className={className} aria-hidden>
      <path d="M 228 0 C 172.772 0 128 44.772 128 100 L 128 0 L 0 0 L 0 28 C 0 83.228 44.772 128 100 128 L 0 128 L 0 256 L 28 256 C 83.228 256 128 211.228 128 156 L 128 256 L 256 256 L 256 228 C 256 172.772 211.228 128 156 128 L 256 128 L 256 0 Z" />
    </svg>
  );
}

const LINKS = [
  { href: "#funzionalita", label: "Funzionalità" },
  { href: "#come-funziona", label: "Come funziona" },
];

export function MarketingNav({ isAuthed }: { isAuthed: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="flex items-center justify-between">
      {/* Pill sinistra */}
      <div className="flex items-center rounded-2xl border border-white/10 bg-black/20 px-4 py-2.5 backdrop-blur-md sm:px-6 sm:py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <Pinwheel className="size-5 text-white sm:size-7" />
          <span className="font-askan text-base tracking-wide text-white sm:text-xl">
            AV·VTO
          </span>
        </Link>

        <div className="ml-8 hidden items-center gap-6 text-sm text-white/75 sm:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Chiudi menu" : "Apri menu"}
          aria-expanded={open}
          className="ml-4 text-white sm:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Azioni destra (desktop) */}
      <div className="hidden items-center gap-2 sm:flex">
        {isAuthed ? (
          <Link
            href="/dashboard"
            className="rounded-full bg-white px-6 py-3 text-sm font-medium text-gray-900 transition-transform hover:scale-[1.03]"
          >
            Dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-full px-5 py-3 text-sm font-medium text-white/90 transition-colors hover:text-white"
            >
              Accedi
            </Link>
            <Link
              href="/signup"
              className="brand-gradient rounded-full px-6 py-3 text-sm font-medium text-white shadow-lg transition-transform hover:scale-[1.03]"
            >
              Registrati
            </Link>
          </>
        )}
      </div>

      {/* Menu mobile */}
      {open ? (
        <div className="absolute top-[4.5rem] right-4 left-4 z-20 rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-xl sm:hidden">
          <div className="flex flex-col gap-4">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-white/90 transition-colors hover:text-white"
              >
                {l.label}
              </a>
            ))}
            {isAuthed ? (
              <Link
                href="/dashboard"
                className="rounded-full bg-white py-3 text-center text-sm font-medium text-gray-900"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-white/90 hover:text-white">
                  Accedi
                </Link>
                <Link
                  href="/signup"
                  className="brand-gradient rounded-full py-3 text-center text-sm font-medium text-white"
                >
                  Registrati
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </nav>
  );
}
