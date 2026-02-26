import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { parsePdf } from "@/lib/upload/parse-pdf";
import { parseDocx } from "@/lib/upload/parse-docx";
import { isLinkedInPdf, parseLinkedInPdf } from "@/lib/upload/parse-linkedin";
import { structureResumeText } from "@/lib/upload/structure";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const pastedText = formData.get("text") as string | null;

  let rawText: string;

  if (pastedText) {
    rawText = pastedText;
  } else if (file) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".pdf")) {
      rawText = await parsePdf(buffer);
    } else if (fileName.endsWith(".docx")) {
      rawText = await parseDocx(buffer);
    } else if (fileName.endsWith(".txt")) {
      rawText = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload PDF, DOCX, or TXT." },
        { status: 400 },
      );
    }
  } else {
    return NextResponse.json(
      { error: "No file or text provided" },
      { status: 400 },
    );
  }

  if (!rawText.trim()) {
    return NextResponse.json(
      { error: "Could not extract text from file" },
      { status: 400 },
    );
  }

  // Check for LinkedIn PDF format
  const linkedInInfo = isLinkedInPdf(rawText)
    ? parseLinkedInPdf(rawText)
    : null;

  // Use AI to structure the text into ResumeData
  const textToStructure = linkedInInfo
    ? `LinkedIn Profile:\n${Object.entries(linkedInInfo.sections)
        .map(([k, v]) => `## ${k}\n${v}`)
        .join("\n\n")}`
    : rawText;

  const resumeData = await structureResumeText(textToStructure);

  return NextResponse.json({ resumeData });
}
