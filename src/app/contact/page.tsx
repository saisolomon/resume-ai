import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageCircle, ShieldAlert } from "lucide-react";
import { SiteNav } from "@/components/layout/SiteNav";
import { SiteFooter } from "@/components/layout/SiteFooter";

/**
 * Contact page — Apple-light editorial.
 *
 * No inbound form for the MVP: form submissions need an email provider,
 * spam handling, and a queue to read them. A clearly-stated mailto +
 * three categories (general / billing / something-broke) covers the
 * actual support volume of a pre-launch product without us pretending
 * to operate a ticketing system we haven't built yet.
 *
 * When/if support volume grows, swap the mailto blocks for a Resend-
 * backed form route. The page structure was built with that swap in
 * mind — replace the `<a href="mailto:">` with `<form action="/api/
 * contact">` and shape the rest stays.
 */

const SUPPORT_EMAIL = "saisolomon45@gmail.com";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the resume.ai team. Billing questions, bug reports, feature requests, partnerships.",
};

type Channel = {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  description: string;
  cta: string;
  href: string;
};

const CHANNELS: Channel[] = [
  {
    icon: MessageCircle,
    title: "General questions",
    description:
      "Pre-purchase questions, how-things-work, partnership inquiries. We read every message and reply within one business day.",
    cta: "Email general support",
    href: `mailto:${SUPPORT_EMAIL}?subject=resume.ai%20%E2%80%94%20general%20question`,
  },
  {
    icon: ShieldAlert,
    title: "Something broke",
    description:
      "Checkout failed, a credit didn't drop, generation hung, the workspace lost edits. Include your account email + a one-line description; we'll dig in immediately.",
    cta: "Email the on-call",
    href: `mailto:${SUPPORT_EMAIL}?subject=resume.ai%20%E2%80%94%20bug%20report`,
  },
  {
    icon: Mail,
    title: "Billing and refunds",
    description:
      "We don't refund consumed credits (see Terms), but if Stripe charged you twice, a credit didn't appear, or you need a receipt re-sent, email here and we'll fix it.",
    cta: "Email billing",
    href: `mailto:${SUPPORT_EMAIL}?subject=resume.ai%20%E2%80%94%20billing`,
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
      <SiteNav home="/" />

      <section className="mx-auto max-w-3xl px-6 pt-20 pb-12 text-center sm:px-8 sm:pt-28">
        <h1 className="text-display text-[#1D1D1F]">Contact.</h1>
        <p className="mx-auto mt-5 max-w-xl text-[17px] leading-relaxed text-[#6E6E73]">
          One inbox. Three reasons to write. Replies within one business day.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-24 sm:px-8">
        <ul className="grid gap-4">
          {CHANNELS.map((channel) => {
            const Icon = channel.icon;
            return (
              <li
                key={channel.title}
                className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-card transition-shadow hover:shadow-card-hover sm:flex-row sm:gap-6 sm:p-8"
              >
                <div
                  className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#F5F5F7]"
                  aria-hidden="true"
                >
                  <Icon className="size-5 text-[#1D1D1F]" aria-hidden={true} />
                </div>
                <div className="flex flex-1 flex-col gap-3">
                  <h2 className="text-[19px] font-semibold leading-tight text-[#1D1D1F]">
                    {channel.title}
                  </h2>
                  <p className="text-[15px] leading-relaxed text-[#6E6E73]">
                    {channel.description}
                  </p>
                  <a
                    href={channel.href}
                    className="focus-ring inline-flex h-10 w-fit items-center gap-1.5 rounded-full border border-[#D2D2D7] bg-white px-4 text-[14px] font-medium text-[#1D1D1F] transition-colors hover:border-[#86868B] hover:bg-[#F5F5F7]"
                  >
                    {channel.cta}
                  </a>
                </div>
              </li>
            );
          })}
        </ul>

        <p className="mt-12 text-center text-[15px] leading-relaxed text-[#6E6E73]">
          Prefer to write the address directly?{" "}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-[#1D1D1F] underline-offset-4 hover:underline"
          >
            {SUPPORT_EMAIL}
          </a>
        </p>

        <p className="mt-2 text-center text-[13px] text-[#86868B]">
          For privacy / data requests, see the{" "}
          <Link
            href="/privacy"
            className="underline-offset-4 hover:underline"
          >
            privacy policy
          </Link>
          . For refund policy, see the{" "}
          <Link
            href="/terms"
            className="underline-offset-4 hover:underline"
          >
            terms of service
          </Link>
          .
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
