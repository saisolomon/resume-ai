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
    <div className="rounded-2xl border border-[#FCA5A5] bg-[#FEF2F2] p-6 sm:p-8">
      <div className="flex items-center gap-2 text-[13px] font-medium text-[#B91C1C]">
        <AlertTriangle className="size-4" aria-hidden="true" />
        Danger zone
      </div>
      <h3 className="mt-3 text-h3 text-[#1D1D1F]">Delete your account.</h3>
      <p className="mt-2 max-w-md text-[15px] leading-relaxed text-[#6E6E73]">
        Permanently erases every run, resume, and chat message tied to your
        account. Cancels any active subscription. This cannot be undone.
      </p>
      <button
        onClick={deleteAccount}
        disabled={loading}
        className="focus-ring mt-6 inline-flex h-11 items-center gap-2 rounded-full border border-[#FCA5A5] bg-white px-5 text-[15px] font-medium text-[#B91C1C] transition-colors duration-200 hover:border-[#B91C1C] hover:bg-[#FEF2F2] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Trash2 className="size-4" aria-hidden="true" />
        {loading ? "Deleting." : "Delete account"}
      </button>
      {error && (
        <p role="alert" className="mt-3 text-[13px] text-[#B91C1C]">
          {error}
        </p>
      )}
    </div>
  );
}