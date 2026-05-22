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

export function PricingFAQ() {
  return (
    <section className="border-t border-neutral-900 py-20">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-center text-2xl font-semibold sm:text-3xl text-white">
          Questions
        </h2>
        <div className="mt-10 divide-y divide-neutral-900 border-y border-neutral-900">
          {faqs.map((f, i) => (
            <details key={i} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-left text-base font-medium text-white">
                {f.q}
                <span
                  aria-hidden="true"
                  className="ml-4 shrink-0 text-neutral-500 transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-neutral-400">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
