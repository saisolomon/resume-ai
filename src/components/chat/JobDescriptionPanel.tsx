"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

interface JobDescriptionPanelProps {
  onTailor: (jobDescription: string) => void;
  disabled?: boolean;
}

export function JobDescriptionPanel({
  onTailor,
  disabled,
}: JobDescriptionPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleTailor() {
    const text = textareaRef.current?.value.trim();
    if (!text) return;
    onTailor(text);
    setExpanded(false);
  }

  return (
    <div className="border-t">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <svg
          className={`h-3 w-3 transition-transform ${expanded ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5l7 7-7 7"
          />
        </svg>
        Tailor to Job Description
      </button>

      {expanded && (
        <div className="animate-in fade-in slide-in-from-top-1 space-y-3 px-4 pb-4 duration-200">
          <textarea
            ref={textareaRef}
            rows={5}
            placeholder="Paste the job description here..."
            className="w-full resize-none rounded-lg border bg-muted/50 p-3 text-sm outline-none placeholder:text-muted-foreground/50 focus:border-primary/30"
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={handleTailor}
            disabled={disabled}
            className="w-full"
          >
            Tailor Resume
          </Button>
        </div>
      )}
    </div>
  );
}
