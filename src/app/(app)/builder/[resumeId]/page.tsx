"use client";

import { use, useEffect, useState } from "react";
import { ResumeProvider, useResume } from "@/lib/resume/context";
import { Navbar } from "@/components/layout/Navbar";
import { SplitLayout } from "@/components/layout/SplitLayout";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { ResumeData } from "@/lib/resume/types";

interface BuilderPageProps {
  params: Promise<{ resumeId: string }>;
}

function BuilderContent({ resumeId }: { resumeId: string }) {
  const { updateResume } = useResume();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadResume() {
      try {
        const res = await fetch(`/api/resumes/${resumeId}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Resume not found");
          }
          throw new Error("Failed to load resume");
        }
        const data = await res.json();
        if (!cancelled && data.resumeData) {
          updateResume(data.resumeData as ResumeData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load resume"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadResume();
    return () => {
      cancelled = true;
    };
  }, [resumeId, updateResume]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col">
        <nav className="flex h-14 items-center justify-between border-b px-4">
          <span className="text-lg font-semibold tracking-tight">ResumeAI</span>
        </nav>
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Loading your resume...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col">
        <nav className="flex h-14 items-center justify-between border-b px-4">
          <span className="text-lg font-semibold tracking-tight">ResumeAI</span>
        </nav>
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10">
              <AlertCircle className="size-7 text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{error}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                The resume you are looking for may have been deleted or does not
                exist.
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <div className="flex-1 overflow-hidden">
        <SplitLayout left={<ChatPanel />} right={<ResumePreview />} />
      </div>
    </div>
  );
}

export default function PersistentBuilderPage({ params }: BuilderPageProps) {
  const { resumeId } = use(params);

  return (
    <ResumeProvider>
      <BuilderContent resumeId={resumeId} />
    </ResumeProvider>
  );
}
