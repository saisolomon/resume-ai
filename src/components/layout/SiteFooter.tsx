import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-900 py-6 px-6 mt-12 text-sm text-neutral-500">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:justify-between gap-3">
        <span>&copy; {new Date().getFullYear()} resume.ai</span>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-white">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-white">
            Terms
          </Link>
          <a href="mailto:hi@resume.ai" className="hover:text-white">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
