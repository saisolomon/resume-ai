"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ResumeCardProps {
  id: string;
  title: string;
  updatedAt: string;
  templateId: string;
}

function relativeTime(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? "" : "s"} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
  return `${diffWeek} week${diffWeek === 1 ? "" : "s"} ago`;
}

export function ResumeCard({ id, title, updatedAt, templateId }: ResumeCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!confirmDelete) {
      setConfirmDelete(true);
      // Reset confirmation after 3 seconds
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      // Trigger a page refresh by dispatching a custom event
      window.dispatchEvent(new CustomEvent("resume-deleted", { detail: id }));
    } catch {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <Link
      href={`/builder/${id}`}
      className={cn(
        "group relative flex flex-col rounded-xl border bg-card p-5 shadow-sm transition-all duration-200",
        "hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      {/* Delete button */}
      <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          variant={confirmDelete ? "destructive" : "ghost"}
          size="icon-xs"
          onClick={handleDelete}
          disabled={deleting}
          className={cn(
            !confirmDelete && "text-muted-foreground hover:text-destructive"
          )}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      {/* Icon and title */}
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
          <FileText className="size-5" />
        </div>
        <div className="min-w-0 flex-1 pr-6">
          <h3 className="truncate text-sm font-semibold text-card-foreground">
            {title}
          </h3>
        </div>
      </div>

      {/* Meta row */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3" />
          <span>{relativeTime(updatedAt)}</span>
        </div>
        <Badge variant="secondary" className="text-[10px] capitalize">
          {templateId}
        </Badge>
      </div>

      {/* Confirm delete tooltip */}
      {confirmDelete && (
        <div className="absolute right-3 top-10 z-10 rounded-md bg-destructive px-2 py-1 text-[10px] font-medium text-white shadow-sm">
          Click again to delete
        </div>
      )}
    </Link>
  );
}
