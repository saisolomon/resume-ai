"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Click-to-edit text primitive used throughout the workspace.
 *
 * Two states:
 *  - viewing: a span that renders the current value; clicking enters edit
 *  - editing: an input (or textarea, for multi-line) that auto-focuses,
 *    selects all on enter, commits on blur or Enter (single-line),
 *    discards on Escape
 *
 * onCommit fires only when the value actually changed — keeps Convex
 * write traffic down. The placeholder shows when value is empty so an
 * empty field still has a click target. Optional `inputClassName`
 * controls width so the input doesn't snap to default size.
 */
type Props = {
  value: string;
  placeholder?: string;
  multiline?: boolean;
  onCommit: (next: string) => void;
  className?: string;
  inputClassName?: string;
  // Aria-label for the editable region so screen readers announce what
  // the user is editing (e.g., "Job title", "Bullet point").
  ariaLabel: string;
};

export function InlineField({
  value,
  placeholder = "—",
  multiline = false,
  onCommit,
  className,
  inputClassName,
  ariaLabel,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Sync the draft when the canonical value changes from outside (eg. a
  // template switch reset, or a server-side re-render after AI fine-tune).
  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      // Select-all so the user can start typing immediately to replace.
      if ("setSelectionRange" in inputRef.current) {
        inputRef.current.select();
      }
    }
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft !== value) onCommit(draft);
  };

  const cancel = () => {
    setEditing(false);
    setDraft(value);
  };

  if (editing) {
    const sharedProps = {
      ref: inputRef as never,
      value: draft,
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => setDraft(e.target.value),
      onBlur: commit,
      onKeyDown: (
        e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => {
        if (e.key === "Escape") {
          e.preventDefault();
          cancel();
        }
        // For single-line inputs, Enter commits. For multi-line, Enter
        // adds a newline and ⌘+Enter / Ctrl+Enter commits.
        if (!multiline && e.key === "Enter") {
          e.preventDefault();
          commit();
        }
        if (multiline && e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          commit();
        }
      },
      "aria-label": ariaLabel,
      className: `inline-block w-full rounded-sm bg-[#EEF4FF] px-1 outline-none ring-1 ring-[#3B82F6]/40 focus-visible:ring-2 focus-visible:ring-[#3B82F6] ${
        inputClassName ?? ""
      }`,
    };
    return multiline ? (
      <textarea rows={2} {...sharedProps} />
    ) : (
      <input type="text" {...sharedProps} />
    );
  }

  // Viewing state — clicking the span enters edit mode. Pointer-cursor
  // + subtle hover ring tells the user it's interactive without making
  // the resume look like a form.
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={() => setEditing(true)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setEditing(true);
        }
      }}
      aria-label={ariaLabel}
      className={`cursor-text rounded-sm px-0.5 hover:bg-[#EEF4FF] focus:outline-none focus-visible:bg-[#EEF4FF] focus-visible:ring-1 focus-visible:ring-[#3B82F6] ${
        className ?? ""
      } ${!value ? "text-[#86868B] italic" : ""}`}
    >
      {value || placeholder}
    </span>
  );
}
