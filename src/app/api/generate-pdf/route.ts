import { NextRequest, NextResponse } from "next/server";
import { generatePdf } from "@/lib/pdf/generate";
import type { ResumeData } from "@/lib/resume/types";
import { rateLimit } from "@/lib/rate-limit";
import { getUserByClerkId } from "@/lib/db/user";
import { logUsageEvent } from "@/lib/db/queries/usage";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // Check auth (optional -- guest mode still works)
  let clerkId: string | null = null;
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    const { auth } = await import("@clerk/nextjs/server");
    ({ userId: clerkId } = await auth());
  }
  let dbUserId: string | null = null;

  if (clerkId) {
    const user = await getUserByClerkId(clerkId);
    if (user) dbUserId = user.id;
  }

  // Rate limit: IP-based for all users
  const allowed = rateLimit(`pdf:${ip}`, 5, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Download rate limit exceeded. Please try again later." },
      { status: 429 },
    );
  }

  let data: ResumeData;

  try {
    data = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 },
    );
  }

  if (!data || typeof data.name !== "string" || data.name.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing or empty 'name' field" },
      { status: 400 },
    );
  }

  try {
    const buffer = await generatePdf(data);

    // Log usage for authenticated users
    if (dbUserId) {
      await logUsageEvent(dbUserId, "pdf_download");
    }

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="resume.pdf"',
      },
    });
  } catch (err) {
    console.error("PDF generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}
