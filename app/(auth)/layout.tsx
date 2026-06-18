import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="brand-glow flex flex-1 flex-col items-center justify-center px-6 py-12">
      <Link
        href="/"
        className="animate-fade-up mb-8 text-2xl font-bold tracking-tight"
      >
        AV<span className="text-gradient">·VTO</span>
      </Link>
      <div className="animate-fade-up w-full max-w-sm">{children}</div>
    </div>
  );
}
