"use client";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient, ConvexProvider } from "convex/react";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function ConvexClerkProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    // Convex URL not set — render children unwrapped so the app still builds.
    return <>{children}</>;
  }
  if (!clerkKey) {
    // Clerk not configured — wrap in Convex only (signed-in surfaces will not work).
    return <ConvexProvider client={convex}>{children}</ConvexProvider>;
  }
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
