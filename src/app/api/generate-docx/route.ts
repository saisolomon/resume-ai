import { NextRequest, NextResponse } from "next/server";
import { generateResume } from "@/lib/docx/generate";
import type { ResumeData } from "@/lib/resume/types";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Rate limit: 5 downloads per hour per IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const allowed = rateLimit(`docx:${ip}`, 5, 60 * 60 * 1000);
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

  // Validate required fields
  if (!data || typeof data.name !== "string" || data.name.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing or empty 'name' field" },
      { status: 400 },
    );
  }

  try {
    const buffer = await generateResume(data);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="resume.docx"',
      },
    });
  } catch (err) {
    console.error("DOCX generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate resume document" },
      { status: 500 },
    );
  }
}
