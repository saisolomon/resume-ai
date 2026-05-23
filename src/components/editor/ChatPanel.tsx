"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useAction } from "convex/react";
import { Sparkles, ArrowRight, Lock } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { canAccessFeature } from "@/lib/tier";

/**
 * Right-pane chat editor.
 *
 * Two states:
 *  - locked (free tier): upsell card with the feature value + price-page link
 *  - unlocked (Apply+): header strip + scrollable message log + composer
 *
 * Behavior preserved from v2: sends user message, then triggers the
 * regenerate action; the "Rewriting + rescoring…" affordance reads
 * during the in-flight regen.
 */
export function ChatPanel({ cardId }: { cardId: string }) {
  const messages = useQuery(api.chatMessages.byCard, { cardId: cardId as Id<"cards"> });
  const sendMessage = useMutation(api.chatMessages.sendUserMessage);
  const regenerate = useAction(api.cardsActions.regenerateCard);
  const [thinking, setThinking] = useState(false);
  const user = useQuery(api.users.getCurrentUser, {});
  const tier = (user?.tier ?? "free") as "free" | "pro" | "career";

  async function handleSend(text: string) {
    setThinking(true);
    try {
      await sendMessage({ cardId: cardId as Id<"cards">, content: text });
      await regenerate({ cardId: cardId as Id<"cards"> });
    } finally {
      setThinking(false);
    }
  }

  if (user !== undefined && !canAccessFeature(tier, "fine_tune_editor")) {
    return (
      <div className="flex h-full flex-col rounded-xl border border-neutral-800 bg-neutral-950">
        <div className="border-b border-neutral-900 px-4 py-3">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
            <Lock className="size-3" aria-hidden="true" />
            Fine-tune editor
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <Sparkles className="size-6 text-neutral-500" aria-hidden="true" />
          <h3 className="mt-4 text-h3 text-white">Apply+ unlocks the editor.</h3>
          <p className="mt-3 max-w-xs text-sm text-neutral-400">
            Edit any card with chat AI. Unlimited rewrites. The AI rescores
            after each change.
          </p>
          <Link
            href="/pricing"
            className="group mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-white px-5 text-sm font-semibold text-black transition-colors hover:bg-neutral-200"
          >
            See pricing
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950">
      <div className="flex items-center justify-between border-b border-neutral-900 px-4 py-3">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
          <Sparkles className="size-3" aria-hidden="true" />
          Fine-tune editor
        </div>
        {thinking && (
          <span className="flex items-center gap-2 font-mono text-[11px] tabular-nums text-neutral-500">
            <span className="size-1.5 animate-pulse rounded-full bg-neutral-400" aria-hidden="true" />
            rewriting + rescoring
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages === undefined ? (
          <div className="text-xs text-neutral-500">Loading…</div>
        ) : messages.length === 0 ? (
          <div className="space-y-3">
            <p className="text-xs leading-relaxed text-neutral-500">
              Tell the editor how to change this card. The card rewrites and
              re-scores after each message.
            </p>
            <div className="rounded-md border border-neutral-800 bg-neutral-900/60 p-3 text-xs leading-relaxed text-neutral-400">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
                Try
              </div>
              <ul className="space-y-1.5">
                <li>&ldquo;Lead with the FAANG experience.&rdquo;</li>
                <li>&ldquo;Make the bullets more quantitative.&rdquo;</li>
                <li>&ldquo;Drop the early-career section, keep the last 6 years.&rdquo;</li>
              </ul>
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <MessageBubble key={m._id} role={m.role} content={m.content} />
          ))
        )}
      </div>

      <ChatInput onSend={handleSend} disabled={thinking} />
    </div>
  );
}