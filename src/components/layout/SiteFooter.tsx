import Link from "next/link";

/**
 * Footer — kept editorial-light. Design.md is explicit: minimal links,
 * no decorative chrome. The hairline above the footer is the section
 * boundary; the wordmark on the left mirrors the nav so the page reads
 * as a single document, not a marketing site with footer afterthought.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-neutral-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-sm text-neutral-500">
          <span className="font-semibold tracking-tight text-white">
            resume.ai
          </span>
          <span aria-hidden="true" className="text-neutral-700">
            ·
          </span>
          <span>&copy; {year}</span>
        </div>
        <div className="flex gap-6 text-sm text-neutral-500">
          <Link
            href="/privacy"
            className="transition-colors hover:text-white"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="transition-colors hover:text-white"
          >
            Terms
          </Link>
          <a
            href="mailto:hi@resume.ai"
            className="transition-colors hover:text-white"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
