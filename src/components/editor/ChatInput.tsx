"use client";
import { useState, KeyboardEvent } from "react";

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
    <div className="border-t border-neutral-800 p-3 flex gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKey}
        placeholder='e.g. "make the leadership angle stronger" or "remove the bullet about AWS"'
        disabled={disabled}
        rows={2}
        className="flex-1 rounded border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white placeholder:text-neutral-600 resize-none"
      />
      <button
        onClick={submit}
        disabled={!text.trim() || disabled}
        className="rounded bg-white text-black px-4 py-2 text-sm font-semibold disabled:opacity-50"
      >
        Send
      </button>
    </div>
  );
}
