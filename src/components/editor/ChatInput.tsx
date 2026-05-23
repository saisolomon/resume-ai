"use client";
import { useState, KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";

/**
 * Chat composer — Apple-light.
 *
 * Sticky footer of the ChatPanel — textarea + submit. Enter submits;
 * Shift-Enter inserts a newline. Disabled while the regenerate action
 * is in flight so the user can't double-submit. Submit button is a
 * compact dark pill matching brand inversion.
 */
export function ChatInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void | Promise<void>;
  disabled: boolean;
}) {
  const [text, setText] = useState("");

  async function submit() {
    if (!text.trim() || disabled) return;
    const t = text;
    setText("");
    await onSend(t);
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="border-t border-[#D2D2D7]/70 bg-white p-4">
      <div className="flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          placeholder='Tell the AI what to change. e.g. "lead with the FAANG line".'
          disabled={disabled}
          rows={2}
          aria-label="Chat with the editor"
          className="focus-ring flex-1 resize-none rounded-xl border border-[#D2D2D7] bg-white px-3 py-2 text-[15px] text-[#1D1D1F] placeholder:text-[#A1A1A6] transition-colors duration-150 focus:border-[#86868B] focus:outline-none disabled:opacity-60"
        />
        <button
          onClick={submit}
          disabled={!text.trim() || disabled}
          aria-label="Send message"
          className="focus-ring inline-flex size-11 shrink-0 items-center justify-center self-end rounded-full bg-[#1D1D1F] text-white transition-colors duration-200 hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowUp className="size-4" aria-hidden="true" />
        </button>
      </div>
      <p className="mt-2 text-[12px] text-[#A1A1A6]">
        Enter to send. Shift + Enter for newline.
      </p>
    </div>
  );
}
