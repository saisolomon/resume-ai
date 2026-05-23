"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { canAccessFeature } from "@/lib/tier";

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
      <div className="flex flex-col items-center justify-center h-full text-center p-6 border border-neutral-800 rounded-lg bg-neutral-950">
        <div className="text-lg font-semibold mb-2">Fine-tune editor is Apply+</div>
        <p className="text-sm text-neutral-500 mb-4">Edit any card with chat AI. Unlimited rewrites.</p>
        <Link href="/pricing" className="rounded bg-white text-black px-5 py-2 font-semibold text-sm">
          Upgrade →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border border-neutral-800 rounded-lg bg-neutral-950">
      <div className="flex-1 overflow-y-auto p-3">
        {messages === undefined ? (
          <div className="text-xs text-neutral-500">Loading…</div>
        ) : messages.length === 0 ? (
          <div className="text-xs text-neutral-500">
            Tell the AI how to change this card. e.g. &quot;lead with the FAANG experience&quot;,
            or &quot;make the bullets more quantitative&quot;.
          </div>
        ) : (
          messages.map((m) => <MessageBubble key={m._id} role={m.role} content={m.content} />)
        )}
        {thinking && (
          <div className="text-xs text-neutral-500 mt-2 italic">Rewriting + rescoring…</div>
        )}
      </div>
      <ChatInput onSend={handleSend} disabled={thinking} />
    </div>
  );
}
