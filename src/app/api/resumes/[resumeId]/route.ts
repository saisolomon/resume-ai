import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserByClerkId } from "@/lib/db/user";
import { getResume, updateResume, deleteResume } from "@/lib/db/queries/resumes";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ resumeId: string }> },
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getUserByClerkId(clerkId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { resumeId } = await params;
  const resume = await getResume(resumeId, user.id);
  if (!resume) return NextResponse.json({ error: "Resume not found" }, { status: 404 });

  return NextResponse.json(resume);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ resumeId: string }> },
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getUserByClerkId(clerkId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { resumeId } = await params;
  const body = await req.json();
  await updateResume(resumeId, user.id, body);

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ resumeId: string }> },
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getUserByClerkId(clerkId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { resumeId } = await params;
  await deleteResume(resumeId, user.id);

  return NextResponse.json({ success: true });
}
