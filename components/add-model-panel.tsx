"use client";

import { useState } from "react";
import { Sparkles, Upload } from "lucide-react";

import { cn } from "@/lib/utils";
import { AddModelForm } from "@/components/add-model-form";
import { GenerateModelForm } from "@/components/generate-model-form";

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "brand-gradient text-white shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export function AddModelPanel({ userId }: { userId: string }) {
  const [tab, setTab] = useState<"generate" | "upload">("generate");

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-muted inline-flex w-fit gap-1 rounded-lg p-1">
        <TabButton
          active={tab === "generate"}
          onClick={() => setTab("generate")}
          icon={<Sparkles className="size-4" />}
        >
          Genera con AI
        </TabButton>
        <TabButton
          active={tab === "upload"}
          onClick={() => setTab("upload")}
          icon={<Upload className="size-4" />}
        >
          Carica foto
        </TabButton>
      </div>

      {tab === "generate" ? (
        <GenerateModelForm />
      ) : (
        <AddModelForm userId={userId} />
      )}
    </div>
  );
}
