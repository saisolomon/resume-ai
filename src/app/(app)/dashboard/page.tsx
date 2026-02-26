"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumeCard } from "@/components/dashboard/ResumeCard";

interface ResumeSummary {
  id: string;
  title: string;
  updatedAt: string;
  templateId: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResumes = useCallback(async () => {
    try {
      const res = await fetch("/api/resumes");
      if (!res.ok) throw new Error("Failed to load resumes");
      const data = await res.json();
      setResumes(data);
      setError(null);
    } catch {
      setError("Could not load your resumes. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  // Listen for resume-deleted events from ResumeCard
  useEffect(() => {
    function handleDeleted(e: Event) {
      const deletedId = (e as CustomEvent).detail;
      setResumes((prev) => prev.filter((r) => r.id !== deletedId));
    }
    window.addEventListener("resume-deleted", handleDeleted);
    return () => window.removeEventListener("resume-deleted", handleDeleted);
  }, []);

  async function handleNewResume() {
    setCreating(true);
    try {
      const res = await fetch("/api/resumes", { method: "POST" });
      if (!res.ok) throw new Error("Failed to create resume");
      const data = await res.json();
      router.push(`/builder/${data.id}`);
    } catch {
      setCreating(false);
      setError("Could not create a new resume. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Resumes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, edit, and manage your resumes
          </p>
        </div>
        <Button onClick={handleNewResume} disabled={creating}>
          {creating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          New Resume
        </Button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="mt-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading your resumes...</p>
        </div>
      ) : resumes.length === 0 && !error ? (
        /* Empty state */
        <div className="mt-16 flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/5">
            <FileText className="size-8 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Create your first resume</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Get started by creating a new resume. Our AI will help you craft a
              professional, ATS-friendly document in minutes.
            </p>
          </div>
          <Button onClick={handleNewResume} disabled={creating} size="lg">
            {creating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            Create Resume
          </Button>
        </div>
      ) : (
        /* Resume grid */
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <ResumeCard
              key={resume.id}
              id={resume.id}
              title={resume.title}
              updatedAt={resume.updatedAt}
              templateId={resume.templateId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
