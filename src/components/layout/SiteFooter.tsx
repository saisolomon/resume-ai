import Link from "next/link";

/**
 * Footer — light variant. Hairline divider above, lowercase wordmark, three
 * inline links in mist-gray. No decorative chrome, no second column.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-[#D2D2D7]/70 bg-[#F5F5F7]">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-3 text-[13px] text-[#86868B]">
          <span className="font-semibold tracking-tight text-[#1D1D1F]">
            resume.ai
          </span>
          <span aria-hidden="true" className="text-[#D2D2D7]">
            ·
          </span>
          <span>&copy; {year}</span>
        </div>
        <div className="flex gap-x-8 text-[13px] text-[#86868B]">
          <Link
            href="/privacy"
            className="transition-colors hover:text-[#1D1D1F]"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="transition-colors hover:text-[#1D1D1F]"
          >
            Terms
          </Link>
          <Link
            href="/contact"
            className="transition-colors hover:text-[#1D1D1F]"
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
