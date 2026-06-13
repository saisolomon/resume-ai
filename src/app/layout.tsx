import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ConvexClerkProvider } from "@/providers/ConvexClerkProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// metadataBase lets relative og:image and twitter:image paths resolve to
// absolute URLs. Fallback to the canonical Vercel preview origin if the
// custom domain env isn't wired up yet.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://jdresumes.com";

const TITLE = "jdresumes — Four resumes. One application.";
const DESCRIPTION =
  "One job. Four angles. Thirty seconds. We tailor your resume four ways so you can pick the one that lands.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · jdresumes",
  },
  description: DESCRIPTION,
  applicationName: "jdresumes",
  authors: [{ name: "jdresumes" }],
  keywords: [
    "AI resume",
    "resume tailoring",
    "ATS optimization",
    "job application",
    "cover letter",
    "resume builder",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "jdresumes",
    title: TITLE,
    description: DESCRIPTION,
    // Next will inject opengraph-image.tsx automatically; this is for
    // engines / scrapers that look for an explicit images array.
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Tells Apple devices the site is web-app capable when added to home
  // screen. Doesn't affect non-Apple platforms.
  appleWebApp: {
    capable: true,
    title: "jdresumes",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#F5F5F7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConvexClerkProvider>{children}</ConvexClerkProvider>
        {/* Vercel Analytics (page views, custom events) + Speed Insights
            (Core Web Vitals). Both auto-skip in dev, no env vars required.
            PII-safe: no IPs stored, no fingerprinting — only aggregate
            metrics. Enable from the Vercel dashboard per project. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
