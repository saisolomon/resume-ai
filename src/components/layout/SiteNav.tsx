"use client";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import type { ReactNode } from "react";

/**
 * Single source of truth for the top nav.
 *
 * Design.md mandates: h-14 (56px), border-b border-neutral-900, px-6,
 * lowercase wordmark in Geist Sans semibold, links text-neutral-400 →
 * text-white on hover. Auth slot right-aligned with a single hydration
 * placeholder so signed-in users never see a "Sign in" flash.
 *
 * Pages provide their own link set via children. The logo is canonical and
 * always points to `home` (override per page — dashboard sends signed-in
 * users to `/dashboard` instead of `/`).
 */
export function SiteNav({
  home = "/",
  children,
}: {
  home?: string;
  children?: ReactNode;
}) {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <nav className="flex h-14 items-center justify-between border-b border-neutral-900 bg-black/80 px-6 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <Link
        href={home}
        className="text-lg font-semibold tracking-tight text-white transition-colors hover:text-neutral-200"
      >
        resume.ai
      </Link>
      <div className="flex items-center gap-x-6 text-sm">
        {children}
        {!isLoaded ? (
          <span className="h-6 w-16" aria-hidden="true" />
        ) : isSignedIn ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <Link
            href="/sign-in"
            className="text-neutral-400 transition-colors hover:text-white"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}

/** Reusable nav link — matches Design.md's nav anchor style. */
export function NavLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-neutral-400 transition-colors hover:text-white"
    >
      {children}
    </Link>
  );
}

/**
 * Conditional nav link — shows only when signed in / signed out.
 * Renders nothing until Clerk hydrates so the dashboard link doesn't
 * appear-then-disappear on first paint.
 */
export function AuthAwareNavLink({
  href,
  children,
  when,
}: {
  href: string;
  children: ReactNode;
  when: "signed-in" | "signed-out";
}) {
  const { isSignedIn, isLoaded } = useUser();
  if (!isLoaded) return null;
  const matches =
    (when === "signed-in" && isSignedIn) ||
    (when === "signed-out" && !isSignedIn);
  if (!matches) return null;
  return <NavLink href={href}>{children}</NavLink>;
}
