import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

import { AgencyCard } from "@/components/agency-card";
import { NavigationProgress } from "@/components/navigation-progress";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter-src",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AV-VTO — Virtual Try-On per il tuo negozio",
  description:
    "Genera foto di modelli AI che indossano i tuoi capi. Virtual Try-On per negozi di abbigliamento.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full scroll-smooth antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://db.onlinewebfonts.com/c/304a6edcec9f8858eeaafc2ac18243f4?family=Askan+Light"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <div
          aria-hidden
          className="app-aurora pointer-events-none fixed inset-0 -z-10"
        />
        <NavigationProgress />
        {children}
        <AgencyCard />
      </body>
    </html>
  );
}
