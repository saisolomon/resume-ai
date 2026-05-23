import { Plus } from "lucide-react";

// v4 credit-pack model. Per Design.md, the FAQ MUST cover: expiry,
// guarantee, what's in a credit, fine-tune scope, and "why per-credit not
// subscription". Voice stays direct — no hedging, no marketing-speak.
const faqs = [
  {
    q: "Do credits expire?",
    a: "No. Ever. Buy a 5-pack today, use 1 credit this week, save 4 for the next career move. Credits sit in your account until you spend them.",
  },
  {
    q: "What if I don't land an interview?",
    a: "30 days. Email us, we refund in full. No questionnaire, no exit survey, no \"let me transfer you\" — one reply, money back. The credits don't need to be used; the offer is on the work, not on the volume.",
  },
  {
    q: "What's in one credit?",
    a: "Four tailored resume designs (Engineering depth, Leadership, Cross-functional, Specialist), three cover letter variants matched to the JD, an ATS deep-scan with per-bullet impact scoring, and unlimited chat fine-tune edits on the run. PDF + DOCX downloads. One JD per credit.",
  },
  {
    q: "Can I keep editing after generation?",
    a: "Yes — unlimited fine-tune edits on every run you generate. The credit unlocks the run; chatting with it to rewrite bullets, tighten phrasing, or switch the angle costs nothing extra. Each edit re-scores against the JD live.",
  },
  {
    q: "Why per-credit instead of a subscription?",
    a: "We don't want to charge you when you're not applying. Job hunts are bursty — 20 applications one month, none for six months — and we'd rather get paid when the tool is doing work than nag you with renewal emails when it isn't. Buy what you use.",
  },
  {
    q: "What's the difference between the packs?",
    a: "Same core deliverable per credit — what changes is the bonuses. The 5-pack adds a LinkedIn rewrite. The 20-pack adds interview prep (10 sessions), outreach templates for hiring managers, bilingual cover letters (English + Spanish), and one human review by a certified recruiter. If you're applying to one job, get Single. If you're job-hunting, get the 5-pack. If you're running a real hunt, the 20-pack pays back fast.",
  },
  {
    q: "Do my resumes stay private?",
    a: "Your resume, JDs, and runs are tied to your account. We don't sell, share, or train public models on your content. You can delete a run any time and it's gone.",
  },
];

/**
 * FAQ — native <details>/<summary> for keyboard + screen reader support.
 * The Plus icon rotates 45° to an × when the row opens. Hairline dividers
 * between items keep it editorial.
 */
export function PricingFAQ() {
  return (
    <section className="border-t border-neutral-900 py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
            Objections, handled
          </span>
          <h2 className="mt-4 text-h1 text-white sm:text-3xl">Questions</h2>
        </div>
        <div className="mt-12 divide-y divide-neutral-900 border-y border-neutral-900">
          {faqs.map((f, i) => (
            <details key={i} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-medium text-white transition-colors hover:text-neutral-200">
                {f.q}
                <Plus
                  aria-hidden="true"
                  className="size-4 shrink-0 text-neutral-500 transition-transform duration-200 group-open:rotate-45"
                />
              </summary>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-400">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
