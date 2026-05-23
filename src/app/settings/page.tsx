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
    <main className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
      <SiteNav home="/dashboard">
        <NavLink href="/dashboard">Dashboard</NavLink>
      </SiteNav>

      <div className="mx-auto max-w-2xl space-y-6 px-6 py-16 sm:px-8 sm:py-20">
        <div className="border-b border-[#D2D2D7]/70 pb-8">
          <h1 className="text-h1 text-[#1D1D1F]">Settings</h1>
          {email && (
            <p className="mt-3 font-mono text-[14px] text-[#86868B]">{email}</p>
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
