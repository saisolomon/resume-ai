"use client";
import { useUser } from "@clerk/nextjs";
import { CreditBalanceCard } from "@/components/settings/CreditBalanceCard";
import { PurchaseHistoryCard } from "@/components/settings/PurchaseHistoryCard";
import { LegacySubscriptionCard } from "@/components/settings/LegacySubscriptionCard";
import { DangerZone } from "@/components/settings/DangerZone";
import { SiteNav, NavLink } from "@/components/layout/SiteNav";

export default function SettingsPage() {
  const { user } = useUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  return (
    <main className="min-h-screen bg-black text-white">
      <SiteNav home="/dashboard">
        <NavLink href="/dashboard">Dashboard</NavLink>
      </SiteNav>

      <div className="mx-auto max-w-2xl space-y-6 px-6 py-12 sm:py-16">
        <div className="border-b border-neutral-900 pb-6">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
            Account
          </span>
          <h1 className="mt-3 text-h1 text-white">Settings</h1>
          {email && (
            <p className="mt-2 font-mono text-sm text-neutral-500">{email}</p>
          )}
        </div>

        {/* v4 credit-pack model — balance + purchase history.
            The LegacySubscriptionCard self-hides unless the user has an
            actual subscription row, so most users never see it. */}
        <CreditBalanceCard />
        <PurchaseHistoryCard />
        <LegacySubscriptionCard />
        <DangerZone />
      </div>
    </main>
  );
}
