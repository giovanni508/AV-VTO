import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
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
