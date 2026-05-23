"use client";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { BillingSection } from "@/components/settings/BillingSection";
import { DangerZone } from "@/components/settings/DangerZone";

export default function SettingsPage() {
  const { user } = useUser();

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex h-14 items-center justify-between border-b border-neutral-900 px-6">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight">resume.ai</Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/dashboard" className="text-neutral-400 hover:text-white">Dashboard</Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-sm text-neutral-500 mt-1">{user?.emailAddresses[0]?.emailAddress}</p>
        </div>
        <BillingSection />
        <DangerZone />
      </div>
    </main>
  );
}
