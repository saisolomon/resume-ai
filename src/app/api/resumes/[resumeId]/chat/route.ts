import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserByClerkId } from "@/lib/db/user";
import { getResume } from "@/lib/db/queries/resumes";
import { getChatHistory, saveChatMessage } from "@/lib/db/queries/chat";
import { anthropic, MODEL } from "@/lib/ai/client";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import type { ResumeData } from "@/lib/resume/types";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

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

  const messages = await getChatHistory(resumeId);
  return NextResponse.json(messages);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ resumeId: string }> },
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await getUserByClerkId(clerkId);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { resumeId } = await params;
    const resume = await getResume(resumeId, user.id);
    if (!resume) return NextResponse.json({ error: "Resume not found" }, { status: 404 });

    // Rate limit: 20 requests per 10 minutes per IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
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

    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured" }),
        { status: 503, headers: { "Content-Type": "application/json" } },
      );
    }

    const systemPrompt = buildSystemPrompt(currentResume ?? null, jobDescription);

    const apiMessages = messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // Save the user message (the last message in the array)
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage && lastUserMessage.role === "user") {
      await saveChatMessage(resumeId, "user", lastUserMessage.content);
    }

    const stream = anthropic.messages.stream({
      model: MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages: apiMessages,
    });

    const encoder = new TextEncoder();
    let assistantResponse = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              assistantResponse += event.delta.text;
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();

          // After streaming completes, persist the assistant message
          await saveChatMessage(resumeId, "assistant", assistantResponse);
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
