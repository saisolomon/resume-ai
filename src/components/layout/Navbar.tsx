"use client";

import { Button } from "@/components/ui/button";
import { useResume } from "@/lib/resume/context";
import { useState } from "react";

export function Navbar() {
  const { resume } = useResume();
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (!resume) return;
    setDownloading(true);
    try {
      const res = await fetch("/api/generate-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resume),
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resume.name || "resume"}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <nav className="flex h-14 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold tracking-tight">ResumeAI</span>
      </div>
      <Button
        onClick={handleDownload}
        disabled={!resume || downloading}
        size="sm"
      >
        {downloading ? "Generating..." : "Download .docx"}
      </Button>
    </nav>
  );
}
