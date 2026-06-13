"use client";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";

/**
 * Top nav — Apple-style sticky blur bar.
 *
 * Design.md spec: h-16 (64px) backdrop-blur bg-white/72, hairline bottom
 * border, sentence-case nav links at 15px text-[#1D1D1F], more breathing
 * room between items (gap-x-8) than the prior dev-tool nav. The lowercase
 * "jdresumes" wordmark is the only thing in the left slot.
 *
 * The auth slot has a single hydration placeholder so signed-in users never
 * see a "Sign in" flash on first paint.
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
    <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-[#D2D2D7]/60 apple-nav-blur px-6 sm:px-8">
      <Link
        href={home}
        className="text-[20px] font-semibold tracking-tight text-[#1D1D1F] transition-colors hover:text-[#6E6E73]"
      >
        <span className="text-[#3B82F6]">jd</span>resumes
      </Link>
      <div className="flex items-center gap-x-6 text-[15px] sm:gap-x-8">
        {children}
        {/* Language switcher sits just before the auth slot — present
            on every page (signed-in or not) so international users have
            consistent access. */}
        <LanguageSwitcher />
        {!isLoaded ? (
          <span className="h-7 w-16" aria-hidden="true" />
        ) : isSignedIn ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <Link
            href="/sign-in"
            className="font-medium text-[#1D1D1F] transition-colors hover:text-[#6E6E73]"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}

/** Reusable nav link — sentence case, calm color shift on hover. */
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
      className="font-medium text-[#1D1D1F] transition-colors hover:text-[#6E6E73]"
    >
      {children}
    </Link>
  );
}

/**
 * Conditional nav link — shows only when signed in / signed out.
 * Returns null while Clerk hydrates so the link doesn't appear-then-disappear.
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
