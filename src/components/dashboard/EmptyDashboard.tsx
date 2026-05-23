import Link from "next/link";

export function EmptyDashboard() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24">
      <h2 className="text-2xl font-semibold">No runs yet</h2>
      <p className="text-neutral-500 mt-2">Tailor your resume to your first job posting.</p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center rounded bg-white text-black px-5 py-2 font-semibold"
      >
        New run →
      </Link>
    </div>
  );
}
