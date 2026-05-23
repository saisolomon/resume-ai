/**
 * Single chat message — Apple-light.
 *
 * User bubble inverts to brand (white text on near-black) — the brand
 * accent moment in the editor. Assistant bubble stays on subtle off-white.
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
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed ${
          isUser
            ? "bg-[#1D1D1F] text-white"
            : "bg-[#F5F5F7] text-[#1D1D1F]"
        }`}
      >
        {content}
      </div>
    </div>
  );
}
