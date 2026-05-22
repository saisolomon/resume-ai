"use client";
import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";

export function ChatPanel({ cardId }: { cardId: string }) {
  const messages = useQuery(api.chatMessages.byCard, { cardId: cardId as Id<"cards"> });
  const sendMessage = useMutation(api.chatMessages.sendUserMessage);
  const regenerate = useAction(api.cardsActions.regenerateCard);
  const [thinking, setThinking] = useState(false);

  async function handleSend(text: string) {
    setThinking(true);
    try {
      await sendMessage({ cardId: cardId as Id<"cards">, content: text });
      await regenerate({ cardId: cardId as Id<"cards"> });
    } finally {
      setThinking(false);
    }
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
