"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2, Crown, User, Shield } from "lucide-react";

interface UsageData {
  tier: "FREE" | "PRO" | "CAREER";
  usage: {
    chatMessages: number;
    docxDownloads: number;
    pdfDownloads: number;
    resumesCreated: number;
  };
}

const tierLabels: Record<string, { label: string; description: string }> = {
  FREE: {
    label: "Job Seeker (Free)",
    description: "Basic features with limited usage",
  },
  PRO: {
    label: "Career Accelerator",
    description: "Unlimited resumes, all templates, and JD tailoring",
  },
  CAREER: {
    label: "Career Dominator",
    description: "Everything in Pro plus AI cover letters and priority support",
  },
};

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await fetch("/api/usage");
        if (!res.ok) throw new Error("Failed to load usage data");
        const data = await res.json();
        setUsageData(data);
      } catch {
        setError("Could not load account data. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchUsage();
  }, []);

  async function handleManageBilling() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.assign(data.url);
      } else {
        setError(data.error || "Could not open billing portal.");
        setPortalLoading(false);
      }
    } catch {
      setError("Could not open billing portal. Please try again.");
      setPortalLoading(false);
    }
  }

  const tier = usageData?.tier ?? "FREE";
  const tierInfo = tierLabels[tier] ?? tierLabels.FREE;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and subscription
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading || !isLoaded ? (
        <div className="mt-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {/* Account Info */}
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/5">
                <User className="size-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold">Account</h2>
                <p className="text-sm text-muted-foreground">
                  Your personal information
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                <span className="text-sm text-muted-foreground">Name</span>
                <span className="text-sm font-medium">
                  {user?.fullName || "Not set"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm font-medium">
                  {user?.primaryEmailAddress?.emailAddress || "Not set"}
                </span>
              </div>
            </div>
          </div>

          {/* Subscription */}
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/5">
                <Crown className="size-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold">Subscription</h2>
                <p className="text-sm text-muted-foreground">
                  Your current plan and billing
                </p>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{tierInfo.label}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {tierInfo.description}
                  </p>
                </div>
                {tier !== "FREE" && (
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    Active
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              {tier !== "FREE" ? (
                <Button
                  onClick={handleManageBilling}
                  disabled={portalLoading}
                  variant="outline"
                >
                  {portalLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CreditCard className="size-4" />
                  )}
                  Manage Billing
                </Button>
              ) : (
                <Button asChild>
                  <a href="/pricing">
                    <Crown className="size-4" />
                    Upgrade Plan
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Usage */}
          {usageData && (
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/5">
                  <Shield className="size-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">Today&apos;s Usage</h2>
                  <p className="text-sm text-muted-foreground">
                    Your usage resets daily at midnight
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-muted/50 px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    Chat Messages
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {usageData.usage.chatMessages}
                    {tier === "FREE" && (
                      <span className="text-sm font-normal text-muted-foreground">
                        {" "}
                        / 10
                      </span>
                    )}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    DOCX Downloads
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {usageData.usage.docxDownloads}
                    {tier === "FREE" && (
                      <span className="text-sm font-normal text-muted-foreground">
                        {" "}
                        / 3
                      </span>
                    )}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    PDF Downloads
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {usageData.usage.pdfDownloads}
                    {tier === "FREE" && (
                      <span className="text-sm font-normal text-muted-foreground">
                        {" "}
                        / 0
                      </span>
                    )}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    Active Resumes
                  </p>
                  <p className="mt-1 text-lg font-semibold">
                    {usageData.usage.resumesCreated}
                    {tier === "FREE" && (
                      <span className="text-sm font-normal text-muted-foreground">
                        {" "}
                        / 1
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
