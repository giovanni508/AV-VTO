import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/10 px-6 py-12 sm:px-10 lg:px-12">
      <div className="mx-auto grid max-w-[1400px] gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <span className="font-askan text-xl tracking-wide text-white">
            AV·VTO
          </span>
          <p className="mt-3 max-w-xs text-sm text-white/50">
            Shooting di moda generati con l&apos;AI. Il tuo abbigliamento,
            fotografato senza set.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm">
          <span className="font-medium text-white/80">Prodotto</span>
          <Link href="/#funzionalita" className="text-white/50 hover:text-white">
            Funzionalità
          </Link>
          <Link href="/#come-funziona" className="text-white/50 hover:text-white">
            Come funziona
          </Link>
          <Link href="/prezzi" className="text-white/50 hover:text-white">
            Prezzi
          </Link>
          <Link href="/#faq" className="text-white/50 hover:text-white">
            FAQ
          </Link>
        </div>

        <div className="flex flex-col gap-3 text-sm">
          <span className="font-medium text-white/80">Azienda</span>
          <Link href="/contatti" className="text-white/50 hover:text-white">
            Contatti
          </Link>
          <Link href="/login" className="text-white/50 hover:text-white">
            Accedi
          </Link>
          <Link href="/signup" className="text-white/50 hover:text-white">
            Registrati
          </Link>
          <a
            href="https://abbigliamentovincente.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/50 hover:text-white"
          >
            Abbigliamento Vincente
          </a>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-[1400px] flex-col items-center justify-between gap-2 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
        <p>
          © {new Date().getFullYear()} AV·VTO — Virtual Try-On per il tuo negozio.
        </p>
        <p>Realizzato da Abbigliamento Vincente.</p>
      </div>
    </footer>
  );
}
