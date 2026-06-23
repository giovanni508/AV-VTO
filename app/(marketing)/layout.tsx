import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { createClient } from "@/lib/supabase/server";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="font-inter flex min-h-dvh flex-col bg-[#070b16] text-white">
      <header className="relative z-30 px-4 py-4 sm:px-10 sm:py-6 lg:px-12">
        <MarketingNav isAuthed={!!user} />
      </header>
      <div className="flex-1">{children}</div>
      <MarketingFooter />
    </div>
  );
}
