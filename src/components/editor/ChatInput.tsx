"use client";
import { useState, KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";

/**
 * Chat composer.
 *
 * Sticky footer of the ChatPanel — textarea + submit. Enter submits;
 * Shift-Enter inserts a newline. Disabled while the regenerate action
 * is in flight so the user can't double-submit. The submit button is
 * an icon-only square (compact, the textarea takes the bulk of width).
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
    <div className="border-t border-neutral-900 bg-neutral-950 p-3">
      <div className="flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKey}
          placeholder='Tell the AI what to change. e.g. "lead with the FAANG line".'
          disabled={disabled}
          rows={2}
          aria-label="Chat with the editor"
          className="flex-1 resize-none rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-600 transition-colors focus:border-white focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-60"
        />
        <button
          onClick={submit}
          disabled={!text.trim() || disabled}
          aria-label="Send message"
          className="inline-flex size-10 shrink-0 items-center justify-center self-end rounded-md bg-white text-black transition-colors hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50"
        >
          <ArrowUp className="size-4" aria-hidden="true" />
        </button>
      </div>
      <p className="mt-2 text-[11px] text-neutral-600">
        Enter to send. Shift + Enter for newline.
      </p>
    </div>
  );
}