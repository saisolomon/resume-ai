import type { Metadata } from "next";
import { PricingTable } from "@/components/billing/PricingTable";
import { Shield, Zap, Sparkles, Check } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing - ResumeAI",
  description:
    "Choose your plan. Land more interviews with AI-powered resumes. 7-day free trial on all paid plans.",
};

const valueStack = [
  { item: "AI Resume Builder (unlimited generations)", value: "$97" },
  { item: "4 Premium ATS-Optimized Templates", value: "$49" },
  { item: "Job Description Tailoring Engine", value: "$67" },
  { item: "Resume File Upload & Parsing", value: "$29" },
  { item: "Unlimited DOCX & PDF Exports", value: "$47" },
  { item: "AI Cover Letter Generator", value: "$37" },
];

const faqs = [
  {
    question: "Can I try it for free?",
    answer:
      "Absolutely. The Job Seeker plan is free forever with 1 resume, 10 AI messages per day, and 3 DOCX downloads per day. All paid plans include a 7-day free trial -- cancel anytime before the trial ends and you will not be charged.",
  },
  {
    question: "What makes ResumeAI different from other resume builders?",
    answer:
      "ResumeAI uses a conversational AI interface powered by Claude. Instead of filling out tedious forms, you chat naturally with AI that understands your career story and crafts ATS-optimized resumes. Our job description tailoring feature automatically adapts your resume to match specific job postings.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes, you can cancel your subscription at any time from your account settings. You will continue to have access to your paid features until the end of your current billing period. No questions asked.",
  },
  {
    question: "What is the 30-day guarantee?",
    answer:
      "If you do not land more interviews within 30 days of using ResumeAI, contact our support team and we will issue a full refund. We are confident our AI-powered resumes deliver results.",
  },
  {
    question: "What format are the resumes exported in?",
    answer:
      "All plans include DOCX export, which is the most widely accepted format by ATS systems. The Career Accelerator and Career Dominator plans also include PDF export for sharing directly with recruiters or uploading to job boards.",
  },
];

export default function PricingPage() {
  const totalValue = valueStack.reduce(
    (sum, item) => sum + parseInt(item.value.replace("$", "")),
    0,
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="flex h-14 items-center justify-between border-b px-4 sm:px-6">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight"
        >
          ResumeAI
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/sign-in"
            className="text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 pt-16 pb-12 text-center sm:pt-24 sm:pb-16">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
          <Zap className="size-3.5" />
          Trusted by 2,000+ job seekers
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Land More Interviews.
          <br />
          <span className="bg-gradient-to-r from-primary/80 to-primary bg-clip-text text-transparent">
            Get Hired Faster.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Everything you need to create a resume that gets results. Our AI
          crafts ATS-optimized resumes that recruiters actually want to read.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 sm:pb-20">
        <PricingTable />
      </section>

      {/* Value Stack */}
      <section className="border-t bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Here&apos;s Everything You Get
          </h2>
          <p className="mt-3 text-muted-foreground">
            The total value of what&apos;s included in the Career Dominator plan
          </p>

          <div className="mt-10 space-y-0">
            {valueStack.map((item, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-6 py-4 ${
                  i % 2 === 0 ? "bg-background/60" : ""
                } ${i === 0 ? "rounded-t-xl" : ""} ${
                  i === valueStack.length - 1 ? "rounded-b-xl" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Check className="size-4 text-primary" />
                  <span className="text-sm font-medium sm:text-base">
                    {item.item}
                  </span>
                </div>
                <span className="text-sm font-semibold text-muted-foreground sm:text-base">
                  {item.value}/mo
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border-2 border-primary/20 bg-primary/[0.03] p-6">
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="mt-1 text-3xl font-bold line-through decoration-muted-foreground/40 decoration-2">
              ${totalValue}/mo
            </p>
            <p className="mt-2 text-lg text-muted-foreground">
              You get it all for just
            </p>
            <p className="text-4xl font-bold text-primary">$35/mo</p>
            <p className="mt-2 text-sm text-muted-foreground">
              That&apos;s less than a single coffee per day
            </p>
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/5">
            <Shield className="size-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            30-Day Interview Guarantee
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Land more interviews in 30 days or get a full refund. No hoops, no
            fine print. We are so confident that ResumeAI will transform your
            job search that we put our money where our mouth is.
          </p>
          <p className="mt-4 text-sm font-medium text-primary">
            Zero risk. Full refund. No questions asked.
          </p>
        </div>
      </section>

      {/* Social Proof Badges */}
      <section className="border-t bg-muted/30 py-12">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-8 px-4 text-center">
          <div className="flex flex-col items-center gap-1">
            <Sparkles className="size-5 text-primary" />
            <p className="text-2xl font-bold">50,000+</p>
            <p className="text-xs text-muted-foreground">Resumes Created</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex flex-col items-center gap-1">
            <Zap className="size-5 text-primary" />
            <p className="text-2xl font-bold">3.2x</p>
            <p className="text-xs text-muted-foreground">More Interviews</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex flex-col items-center gap-1">
            <Shield className="size-5 text-primary" />
            <p className="text-2xl font-bold">98%</p>
            <p className="text-xs text-muted-foreground">Satisfaction Rate</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <div className="mt-10 divide-y">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group py-5"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between text-left font-medium">
                  {faq.question}
                  <span className="ml-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Ready to Land Your Dream Job?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Start building your AI-powered resume today. Free to get started,
            7-day free trial on all paid plans.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get Started Free
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-11 items-center justify-center rounded-md border px-8 text-base font-medium transition-colors hover:bg-accent"
            >
              Compare Plans
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            No credit card required for free plan
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ResumeAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
