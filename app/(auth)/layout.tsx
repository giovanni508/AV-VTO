import Link from "next/link";

import { Logo } from "@/components/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <Link
        href="/"
        className="animate-fade-up mb-8 transition-opacity hover:opacity-80"
        aria-label="AV-VTO, torna alla home"
      >
        <Logo size="lg" />
      </Link>
      <div className="animate-fade-up w-full max-w-sm">{children}</div>
    </div>
  );
}
