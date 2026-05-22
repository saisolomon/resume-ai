import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { generateResume } from "@/lib/docx/generate";
import type { ResumeData } from "@/lib/resume/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ cardId: string }> },
) {
  const { userId, getToken } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { cardId } = await params;
  const token = await getToken({ template: "convex" });
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  if (token) convex.setAuth(token);

  // Owner-gated query — returns null for non-owners. Public
  // api.cards._getCardById would let any signed-in user download any
  // other user's resume by guessing the card ID.
  const card = await convex.query(api.dashboard.getMyCard, { cardId: cardId as Id<"cards"> });
  if (!card || card.status !== "ready" || !card.content) {
    return NextResponse.json({ error: "card_not_ready" }, { status: 404 });
  }

  const buf = await generateResume(card.content as ResumeData);

  return new NextResponse(buf as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "X-Filename": `resume-${card.angle}.docx`,
      "Content-Disposition": `attachment; filename="resume-${card.angle}.docx"`,
    },
  });
}
