import { Plus } from "lucide-react";

// v4 credit-pack model. Per Design.md, the FAQ covers: expiry, what's
// in a credit, fine-tune scope, "why per-credit not subscription", and
// our honest stance on refunds. Voice stays direct — no hedging, no
// marketing-speak.
const faqs = [
  {
    q: "Do credits expire?",
    a: "No. Ever. Buy a 5-pack today, use 1 credit this week, save 4 for the next career move. Credits sit in your account until you spend them.",
  },
  {
    q: "Can I get a refund?",
    a: "Credits are consumed as soon as a run starts — that's the moment we incur AI infrastructure cost — so we don't refund them. What we do instead: credits never expire, you get four tailored angles per credit so you almost never need to spend a second one on the same JD, and unlimited chat fine-tune edits are free on every run. If you're not sure resume.ai will work for you, start with Single ($9) before going larger.",
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
    <section className="bg-[#FAFAFA] py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6 sm:px-8">
        <div className="text-center">
          <h2 className="text-h1 text-[#1D1D1F]">Questions.</h2>
          <p className="mt-4 text-[17px] text-[#6E6E73]">
            Common ones, handled directly.
          </p>
        </div>
        <div className="mt-12 divide-y divide-[#D2D2D7]/70 overflow-hidden rounded-2xl bg-white shadow-card">
          {faqs.map((f, i) => (
            <details key={i} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left text-[17px] font-medium text-[#1D1D1F] transition-colors hover:bg-[#FAFAFA] sm:px-8">
                {f.q}
                <Plus
                  aria-hidden="true"
                  className="size-5 shrink-0 text-[#86868B] transition-transform duration-200 group-open:rotate-45"
                />
              </summary>
              <p className="px-6 pb-5 text-[15px] leading-relaxed text-[#6E6E73] sm:px-8">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
