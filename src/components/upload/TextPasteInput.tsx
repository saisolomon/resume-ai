"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TextPasteInputProps {
  onParsed: (resumeData: unknown) => void;
  disabled?: boolean;
}

export function TextPasteInput({ onParsed, disabled }: TextPasteInputProps) {
  const [text, setText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleParse() {
    if (!text.trim()) return;
    setParsing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("text", text);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Parsing failed");
      }

      const { resumeData } = await res.json();
      onParsed(resumeData);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Parsing failed");
    } finally {
      setParsing(false);
    }
  }

  return (
    <div className="space-y-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your resume text here..."
        className="min-h-[120px] w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        disabled={disabled || parsing}
      />
      <div className="flex items-center justify-between">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          size="sm"
          onClick={handleParse}
          disabled={!text.trim() || parsing || disabled}
          className="ml-auto"
        >
          {parsing ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Parsing...
            </>
          ) : (
            "Import Text"
          )}
        </Button>
      </div>
    </div>
  );
}
