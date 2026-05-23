export function MessageBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  return (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
          role === "user" ? "bg-blue-600 text-white" : "bg-neutral-800 text-white"
        }`}
      >
        {content}
      </div>
    </div>
  );
}
