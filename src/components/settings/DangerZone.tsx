"use client";
import { useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { Trash2, AlertTriangle } from "lucide-react";

export function DangerZone() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteAccount() {
    if (!confirm("Delete your account permanently? All runs will be erased.")) return;
    if (!confirm("Are you absolutely sure? This cannot be undone.")) return;

    setLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/account", { method: "DELETE" });
      if (!resp.ok) {
        console.error("account delete failed", { status: resp.status });
        setError("Couldn't delete account. Try again or email hi@resume.ai.");
        setLoading(false);
        return;
      }
      await user?.delete();
      await signOut({ redirectUrl: "/" });
    } catch (err) {
      console.error("delete threw", err);
      setError("Couldn't delete account. Try again or email hi@resume.ai.");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-red-900 bg-red-950/30 p-6">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-red-400">
        <AlertTriangle className="size-3" aria-hidden="true" />
        Danger zone
      </div>
      <h3 className="mt-3 text-h3 text-white">Delete your account.</h3>
      <p className="mt-2 max-w-md text-sm text-neutral-400">
        Permanently erases every run, resume, and chat message tied to your
        account. Cancels any active subscription. This cannot be undone.
      </p>
      <button
        onClick={deleteAccount}
        disabled={loading}
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-md border border-red-900 bg-transparent px-4 text-sm font-semibold text-red-400 transition-colors hover:border-red-800 hover:bg-red-950/30 focus:outline-none focus:ring-2 focus:ring-red-900/50 disabled:opacity-60"
      >
        <Trash2 className="size-4" aria-hidden="true" />
        {loading ? "Deleting…" : "Delete account"}
      </button>
      {error && (
        <p role="alert" className="mt-3 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}