"use client";

import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/resume/types";

interface MessageBubbleProps {
  message: ChatMessage;
}

function formatContent(text: string) {
  // Simple markdown-like formatting: **bold**, bullet lists
  const lines = text.split("\n");
  return lines.map((line, i) => {
    // Bold
    const formatted = line.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-semibold">$1</strong>'
    );
    // Bullet list items
    if (/^[\-\*•]\s/.test(line)) {
      return (
        <li
          key={i}
          className="ml-4 list-disc"
          dangerouslySetInnerHTML={{
            __html: formatted.replace(/^[\-\*•]\s/, ""),
          }}
        />
      );
    }
    // Numbered list items
    if (/^\d+\.\s/.test(line)) {
      return (
        <li
          key={i}
          className="ml-4 list-decimal"
          dangerouslySetInnerHTML={{
            __html: formatted.replace(/^\d+\.\s/, ""),
          }}
        />
      );
    }
    if (line.trim() === "") {
      return <br key={i} />;
    }
    return (
      <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />
    );
  });
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted text-foreground rounded-bl-md"
        )}
      >
        <div className="space-y-1">{formatContent(message.content)}</div>
      </div>
    </div>
  );
}
