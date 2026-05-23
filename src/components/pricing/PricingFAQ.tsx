import { Plus } from "lucide-react";

const faqs = [
  {
    q: "Can I try it without paying?",
    a: "Yes. Try gives you 3 runs per week and keeps your last 3. No card, no trial timer — use it as long as the limits work for you.",
  },
  {
    q: "What's the difference between Apply and Hunt?",
    a: "Apply gets you unlimited tailored runs, the chat fine-tune editor, ATS deep-scan, and JD watchlist — everything you need if you already know how to job-hunt. Hunt adds cover letters, LinkedIn rewrite, interview prep, outreach templates, and one human review per month. Pick Hunt if you want the whole pipeline; Apply if you just need the resume layer.",
  },
  {
    q: "How does the 30-day guarantee work?",
    a: "If you don't land an interview in 30 days, email us. We refund you in full. No questionnaire, no exit survey, no \"let me transfer you\" — one reply, money back.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. One click in Settings. You keep access until the end of the billing period. No retention call.",
  },
  {
    q: "Do my runs stay private?",
    a: "Your resume, JDs, and runs are tied to your account. We don't sell, share, or train public models on your content. You can delete a run any time and it's gone.",
  },
  {
    q: "What if I outgrow Try?",
    a: "Upgrade to Apply or Hunt from Settings — your existing runs and history come with you. No re-onboarding.",
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