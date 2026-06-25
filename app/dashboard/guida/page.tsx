import Link from "next/link";
import {
  BookOpen,
  Coins,
  ImagePlus,
  Lightbulb,
  Settings2,
  Sparkles,
  UserPlus,
  Wand2,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CREDITS_PER_GENERATION,
  CREDITS_PER_MODEL_GENERATION,
  CREDITS_PER_PRODUCT_SHOT,
} from "@/lib/config";

const TOC = [
  { id: "panoramica", label: "Panoramica" },
  { id: "modelli", label: "Creare un modello" },
  { id: "shooting", label: "Creare uno shooting" },
  { id: "variabili", label: "Le variabili dello scatto" },
  { id: "crediti", label: "Crediti e costi" },
  { id: "consigli", label: "Consigli per risultati migliori" },
];

function Section({
  id,
  icon,
  title,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
        <span className="brand-gradient inline-flex size-8 items-center justify-center rounded-lg text-white shadow-sm">
          {icon}
        </span>
        {title}
      </h2>
      <div className="text-muted-foreground mt-3 flex flex-col gap-3 text-sm leading-relaxed">
        {children}
      </div>
    </section>
  );
}

export default function GuidaPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <BookOpen className="text-brand-700 size-6" />
          Guida
        </h1>
        <p className="text-muted-foreground mt-1">
          Tutto ciò che serve per generare shooting professionali con AV·VTO.
        </p>
      </div>

      {/* Indice */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">In questa guida</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2">
            {TOC.map((t, i) => (
              <li key={t.id}>
                <a
                  href={`#${t.id}`}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm"
                >
                  <span className="text-brand-400 font-semibold tabular-nums">
                    {i + 1}.
                  </span>
                  {t.label}
                </a>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="mt-10 flex flex-col gap-12">
        <Section id="panoramica" icon={<Sparkles className="size-4" />} title="Panoramica">
          <p>
            AV·VTO genera foto professionali dei tuoi capi a partire da
            un&apos;immagine che hai già. Due modalità:
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li>
              <strong className="text-foreground">Con modello</strong>: il capo
              viene indossato da un modello AI (Virtual Try-On).
            </li>
            <li>
              <strong className="text-foreground">Senza modello</strong>:
              packshot del capo isolato su sfondo pulito, ideale per le schede
              prodotto.
            </li>
          </ul>
          <p>
            Il flusso è sempre lo stesso: prepara un modello (solo per la
            modalità con modello), crea lo shooting, scarica l&apos;immagine.
          </p>
        </Section>

        <Section id="modelli" icon={<UserPlus className="size-4" />} title="Creare un modello">
          <p>
            Vai in <strong className="text-foreground">I tuoi modelli</strong>.
            Hai due opzioni:
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li>
              <strong className="text-foreground">Genera con AI</strong>: scegli
              genere, età, etnia, corporatura e capelli. Il modello viene creato
              iper-realistico, a figura intera, pronto per il try-on. Costa{" "}
              {CREDITS_PER_MODEL_GENERATION} crediti.
            </li>
            <li>
              <strong className="text-foreground">Carica foto</strong>: usa la
              foto di un tuo modello (figura intera, sfondo pulito, posa
              frontale per risultati migliori).
            </li>
          </ul>
          <p>
            Clicca su un modello per vederlo a tutto schermo e scaricarlo. I
            modelli salvati si riutilizzano in tutti gli shooting.
          </p>
        </Section>

        <Section id="shooting" icon={<Wand2 className="size-4" />} title="Creare uno shooting">
          <p>
            Vai in <strong className="text-foreground">Shooting → Nuovo
            shooting</strong>. La barra in basso è il tuo &ldquo;composer&rdquo;:
          </p>
          <ol className="ml-4 list-decimal space-y-1">
            <li>
              Premi <strong className="text-foreground">+</strong> e allega la
              foto del capo.
            </li>
            <li>
              Scegli la modalità{" "}
              <strong className="text-foreground">Con / Senza modello</strong>.
            </li>
            <li>
              In modalità con modello, seleziona il{" "}
              <strong className="text-foreground">Modello</strong>.
            </li>
            <li>
              Apri <strong className="text-foreground">Opzioni</strong> per
              regolare le variabili dello scatto (vedi sotto).
            </li>
            <li>
              Imposta il numero di{" "}
              <strong className="text-foreground">variazioni</strong> (fino a 4)
              e premi <strong className="text-foreground">Genera</strong>.
            </li>
          </ol>
          <p>
            Lo spazio sopra la barra mostra i tuoi shooting precedenti: cliccali
            per aprire il dettaglio (capo originale e risultato).
          </p>
        </Section>

        <Section id="variabili" icon={<Settings2 className="size-4" />} title="Le variabili dello scatto">
          <p>
            Dentro <strong className="text-foreground">Opzioni</strong> puoi
            controllare l&apos;aspetto del risultato.
          </p>
          <p className="text-foreground font-medium">Con modello</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>
              <strong className="text-foreground">Categoria</strong>: parte
              superiore, inferiore o vestito (aiuta l&apos;AI a posizionare il
              capo).
            </li>
            <li>
              <strong className="text-foreground">Posa</strong>: frontale, tre
              quarti, profilo, in camminata, mani in tasca, seduto.
            </li>
            <li>
              <strong className="text-foreground">Inquadratura</strong>: figura
              intera, fino alle ginocchia o mezzo busto.
            </li>
            <li>
              <strong className="text-foreground">Sfondo / scena</strong>:
              studio, bianco, grigio, esterno urbano, interno minimal, natura.
            </li>
            <li>
              <strong className="text-foreground">Luce</strong>: studio soft,
              naturale, drammatica, calda.
            </li>
          </ul>
          <p className="text-foreground font-medium">Senza modello (packshot)</p>
          <ul className="ml-4 list-disc space-y-1">
            <li>
              <strong className="text-foreground">Sfondo</strong>: bianco,
              grigio, legno, marmo, neutro caldo.
            </li>
            <li>
              <strong className="text-foreground">Angolazione</strong>:
              frontale, tre quarti, dall&apos;alto (flat lay), appeso.
            </li>
            <li>
              <strong className="text-foreground">Luce</strong>: come sopra.
            </li>
          </ul>
          <p>
            Comune a entrambe: <strong className="text-foreground">Modello
            AI</strong> (lascia su &ldquo;Auto&rdquo; per la qualità migliore) e
            il campo <strong className="text-foreground">descrizione</strong> per
            indicazioni libere (es. &ldquo;sorriso, occhiali da sole&rdquo;).
          </p>
        </Section>

        <Section id="crediti" icon={<Coins className="size-4" />} title="Crediti e costi">
          <p>Ogni azione consuma crediti dal tuo saldo:</p>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <tbody className="divide-y">
                <Cost
                  label="Shooting con modello"
                  cost={`${CREDITS_PER_GENERATION} crediti`}
                />
                <Cost
                  label="Packshot senza modello"
                  cost={`${CREDITS_PER_PRODUCT_SHOT} crediti`}
                />
                <Cost
                  label="Generazione di un modello AI"
                  cost={`${CREDITS_PER_MODEL_GENERATION} crediti`}
                />
                <Cost label="Caricare la foto di un modello" cost="Gratis" />
              </tbody>
            </table>
          </div>
          <p>
            Con più variazioni il costo si moltiplica (es. 3 shooting con
            modello = {CREDITS_PER_GENERATION * 3} crediti). I crediti si scalano
            solo se la generazione va a buon fine. Il saldo è sempre visibile in
            alto;{" "}
            <Link href="/dashboard/account" className="text-primary underline-offset-4 hover:underline">
              gestisci l&apos;account
            </Link>{" "}
            per i dettagli.
          </p>
        </Section>

        <Section id="consigli" icon={<Lightbulb className="size-4" />} title="Consigli per risultati migliori">
          <ul className="ml-4 list-disc space-y-1.5">
            <li>
              Usa una foto del capo{" "}
              <strong className="text-foreground">nitida e ben illuminata</strong>,
              possibilmente su sfondo pulito.
            </li>
            <li>
              Imposta la{" "}
              <strong className="text-foreground">categoria corretta</strong>{" "}
              (superiore/inferiore/vestito): migliora molto il posizionamento.
            </li>
            <li>
              Per i modelli, preferisci immagini a{" "}
              <strong className="text-foreground">figura intera</strong> e in
              posa frontale.
            </li>
            <li>
              Genera <strong className="text-foreground">più variazioni</strong>{" "}
              e scegli la migliore: spesso basta cambiare posa o sfondo.
            </li>
            <li>
              Se vendi capi con{" "}
              <strong className="text-foreground">stampe complesse</strong>,
              valuta il modello AI &ldquo;IDM-VTON&rdquo; in Opzioni per la
              massima fedeltà.
            </li>
          </ul>
        </Section>

        <Card className="bg-muted/40">
          <CardContent className="flex flex-col items-start gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <ImagePlus className="text-brand-700 size-6 shrink-0" />
              <p className="text-sm font-medium">
                Pronto? Crea il tuo primo shooting.
              </p>
            </div>
            <Link
              href="/dashboard/generations/new"
              className="brand-gradient inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
            >
              <Sparkles className="size-4" />
              Nuovo shooting
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Cost({ label, cost }: { label: string; cost: string }) {
  return (
    <tr>
      <td className="px-4 py-2.5">{label}</td>
      <td className="text-foreground px-4 py-2.5 text-right font-medium tabular-nums">
        {cost}
      </td>
    </tr>
  );
}
