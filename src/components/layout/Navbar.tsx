"use client";

import { Button } from "@/components/ui/button";
import { useResume } from "@/lib/resume/context";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { UserButton, SignInButton } from "@clerk/nextjs";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  const { resume, resumeId, isSaving, lastSavedAt } = useResume();
  const { isSignedIn } = useAuth();
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
      <div className="flex items-center gap-3">
        {resumeId && (
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        )}
        <span className="text-lg font-semibold tracking-tight">ResumeAI</span>
        {resumeId && (
          <span className="text-xs text-muted-foreground">
            {isSaving ? (
              <span className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </span>
            ) : lastSavedAt ? (
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3" />
                Saved
              </span>
            ) : null}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleDownload}
          disabled={!resume || downloading}
          size="sm"
        >
          {downloading ? "Generating..." : "Download .docx"}
        </Button>

        {isSignedIn ? (
          <UserButton />
        ) : (
          <SignInButton mode="modal">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </SignInButton>
        )}
      </div>
    </nav>
  );
}
