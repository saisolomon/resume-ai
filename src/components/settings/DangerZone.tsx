"use client";
import { useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";

export function DangerZone() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  async function deleteAccount() {
    if (!confirm("Delete your account permanently? All runs will be erased.")) return;
    if (!confirm("Are you absolutely sure? This cannot be undone.")) return;

    setLoading(true);
    try {
      const resp = await fetch("/api/account", { method: "DELETE" });
      if (!resp.ok) {
        console.error("account delete failed", { status: resp.status });
        alert("Couldn't delete account. Try again or contact support.");
        setLoading(false);
        return;
      }
      await user?.delete();
      await signOut({ redirectUrl: "/" });
    } catch (err) {
      console.error("delete threw", err);
      alert("Couldn't delete account. Try again or contact support.");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-red-900 bg-red-950/30 p-5 mt-6">
      <h3 className="font-semibold mb-2 text-red-400">Danger zone</h3>
      <p className="text-sm text-neutral-400 mb-3">Permanently delete your account and all your runs.</p>
      <button
        onClick={deleteAccount}
        disabled={loading}
        className="rounded border border-red-700 text-red-400 px-4 py-2 text-sm disabled:opacity-60"
      >
        {loading ? "Deleting…" : "Delete account"}
      </button>
    </div>
  );
}
