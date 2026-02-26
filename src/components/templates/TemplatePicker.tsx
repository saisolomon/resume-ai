"use client";

import { useResume } from "@/lib/resume/context";
import { TEMPLATES } from "@/lib/templates/registry";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

export function TemplatePicker() {
  const { templateId, setTemplateId } = useResume();

  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-2 border-b">
      {TEMPLATES.map((t) => (
        <button
          key={t.slug}
          onClick={() => setTemplateId(t.slug)}
          className={cn(
            "flex flex-col items-center gap-1 rounded-lg border px-3 py-2 text-xs transition-colors shrink-0",
            templateId === t.slug
              ? "border-primary bg-primary/5 text-primary"
              : "border-transparent hover:border-muted-foreground/20 text-muted-foreground",
          )}
        >
          <span className="font-medium">{t.name}</span>
          {t.tier !== "FREE" && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              <Lock className="mr-0.5 h-2.5 w-2.5" />
              Pro
            </Badge>
          )}
        </button>
      ))}
    </div>
  );
}
