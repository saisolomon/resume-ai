import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserByClerkId } from "@/lib/db/user";
import { getUsageSummary } from "@/lib/db/queries/usage";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await getUserByClerkId(clerkId);
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  const usage = await getUsageSummary(user.id);
  return NextResponse.json({ tier: user.tier, usage });
}
