import { anthropic, MODEL } from "@/lib/ai/client";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import type { ResumeData } from "@/lib/resume/types";
import { rateLimit } from "@/lib/rate-limit";
import { getUserByClerkId } from "@/lib/db/user";
import { logUsageEvent } from "@/lib/db/queries/usage";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    // Check auth (optional — guest mode still works)
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

    // Rate limit: IP-based for guests, usage-based for authenticated users
    const allowed = rateLimit(`chat:${ip}`, 20, 10 * 60 * 1000);
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please wait a few minutes." }),
        { status: 429, headers: { "Content-Type": "application/json" } },
      );
    }

    const body = await req.json();
    const { messages, jobDescription, currentResume } = body as {
      messages: Array<{ role: string; content: string }>;
      jobDescription?: string;
      currentResume?: ResumeData | null;
    };

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const systemPrompt = buildSystemPrompt(currentResume ?? null, jobDescription);

    const apiMessages = messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured" }),
        { status: 503, headers: { "Content-Type": "application/json" } },
      );
    }

    // Log usage for authenticated users
    if (dbUserId) {
      await logUsageEvent(dbUserId, "chat_message");
    }

    const stream = anthropic.messages.stream({
      model: MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages: apiMessages,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (err) {
    console.error("Chat API error:", err);
    const message =
      err instanceof Error && err.message.includes("authentication")
        ? "API key is invalid or expired"
        : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
