import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

export async function POST(req: NextRequest) {
  const { userId, getToken } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await currentUser();
  const { fingerprintHash } = (await req.json()) as { fingerprintHash: string };

  const token = await getToken({ template: "convex" });
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  if (token) convex.setAuth(token);

  const result = await convex.mutation(api.claim.claimAnonymousRuns, {
    fingerprintHash,
    email: user?.emailAddresses[0]?.emailAddress ?? "",
    name: user?.firstName ?? undefined,
  });

  return NextResponse.json(result);
}
