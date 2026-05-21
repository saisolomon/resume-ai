import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "resume.ai — Stop letting AI decide your job for you",
  description:
    "Paste a job. Drop your resume. See four ways to win it — with real ATS scores.",
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
      </body>
    </html>
  );
}
