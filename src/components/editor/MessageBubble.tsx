/**
 * Single chat message.
 *
 * Design.md keeps the editorial blue scoped to angle chips only — so the
 * user bubble uses the brand-inversion (white on black) rather than the
 * v2's `bg-blue-600`. Assistant bubbles stay on neutral-900.
 */
export function MessageBubble({
  role,
  content,
}: {
  role: "user" | "assistant";
  content: string;
}) {
  const isUser = role === "user";
  return (
    <div className={`mb-3 flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? "bg-white text-black"
            : "border border-neutral-800 bg-neutral-900 text-neutral-100"
        }`}
      >
        {content}
      </div>
    </div>
  );
}