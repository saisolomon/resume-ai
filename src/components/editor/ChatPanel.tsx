"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useAction } from "convex/react";
import { Sparkles, Lock } from "lucide-react";
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
      <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-card">
        <div className="border-b border-[#D2D2D7]/70 px-5 py-3">
          <div className="flex items-center gap-2 text-[13px] font-medium text-[#86868B]">
            <Lock className="size-4" aria-hidden="true" />
            Fine-tune editor
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <Sparkles className="size-7 text-[#86868B]" aria-hidden="true" />
          <h3 className="mt-4 text-h3 text-[#1D1D1F]">
            Apply+ unlocks the editor.
          </h3>
          <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-[#6E6E73]">
            Edit any card with chat AI. Unlimited rewrites. The AI rescores
            after each change.
          </p>
          <Link
            href="/pricing"
            className="focus-ring mt-6 inline-flex h-11 items-center rounded-full bg-[#1D1D1F] px-5 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-black"
          >
            See pricing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-[#D2D2D7]/70 px-5 py-3">
        <div className="flex items-center gap-2 text-[13px] font-medium text-[#1D1D1F]">
          <Sparkles className="size-4" aria-hidden="true" />
          Fine-tune editor
        </div>
        {thinking && (
          <span className="flex items-center gap-2 text-[12px] text-[#86868B]">
            <span
              className="size-1.5 animate-pulse rounded-full bg-[#86868B]"
              aria-hidden="true"
            />
            Rewriting + rescoring
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {messages === undefined ? (
          <div className="text-[13px] text-[#86868B]">Loading.</div>
        ) : messages.length === 0 ? (
          <div className="space-y-4">
            <p className="text-[14px] leading-relaxed text-[#6E6E73]">
              Tell the editor how to change this card. The card rewrites and
              re-scores after each message.
            </p>
            <div className="rounded-xl bg-[#FAFAFA] p-4 text-[13px] leading-relaxed text-[#6E6E73]">
              <div className="mb-2 text-[12px] font-medium text-[#86868B]">
                Try
              </div>
              <ul className="space-y-1.5">
                <li>&ldquo;Lead with the FAANG experience.&rdquo;</li>
                <li>&ldquo;Make the bullets more quantitative.&rdquo;</li>
                <li>
                  &ldquo;Drop the early-career section, keep the last 6
                  years.&rdquo;
                </li>
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