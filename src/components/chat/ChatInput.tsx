"use client";

import { useRef, useCallback, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const maxHeight = 4 * 24; // ~4 lines
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, []);

  const handleSend = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const text = el.value.trim();
    if (!text || disabled) return;
    onSend(text);
    el.value = "";
    el.style.height = "auto";
  }, [onSend, disabled]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="flex items-end gap-2 rounded-xl border bg-background p-2 shadow-sm transition-shadow focus-within:shadow-md">
      <textarea
        ref={textareaRef}
        rows={1}
        placeholder="Tell me about your experience..."
        className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground/60"
        onInput={adjustHeight}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <Button
        size="sm"
        onClick={handleSend}
        disabled={disabled}
        className="shrink-0 rounded-lg"
      >
        {disabled ? (
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
            Thinking
          </span>
        ) : (
          "Send"
        )}
      </Button>
    </div>
  );
}
