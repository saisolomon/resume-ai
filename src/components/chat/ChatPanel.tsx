"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { JobDescriptionPanel } from "./JobDescriptionPanel";
import { useResume } from "@/lib/resume/context";
import type { ChatMessage } from "@/lib/resume/types";
import { parseAssistantResponse } from "@/lib/ai/parse-response";

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Hi! I'm your AI resume assistant. I'll help you build a professional, ATS-friendly resume step by step.\n\nLet's start with the basics — **what's your full name** and **contact information** (email, phone, LinkedIn, location)?",
};

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [streaming, setStreaming] = useState(false);
  const [jobDescription, setJobDescription] = useState<string>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { resume, updateResume, updateTailoring } = useResume();

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = useCallback(
    async (text: string, jd?: string) => {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: jd ? `[Tailor to JD] ${text}` : text,
      };

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setStreaming(true);

      try {
        const chatHistory = [...messages, userMsg]
          .filter((m) => m.id !== "welcome")
          .map((m) => ({ role: m.role, content: m.content }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: chatHistory,
            jobDescription: jd || jobDescription,
            currentResume: resume,
          }),
        });

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No reader");

        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id ? { ...m, content: fullText } : m
            )
          );
        }

        // Parse the complete response for resume data
        const parsed = parseAssistantResponse(fullText);

        // Update the displayed message to show only the chat text
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: parsed.chatText }
              : m
          )
        );

        if (parsed.resumeData) {
          updateResume(parsed.resumeData);
        }
        if (
          parsed.matchScore !== undefined &&
          parsed.keywords
        ) {
          updateTailoring(parsed.matchScore, parsed.keywords);
        }
      } catch (err) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? {
                  ...m,
                  content:
                    "Sorry, something went wrong. Please try again.",
                }
              : m
          )
        );
        console.error("Chat error:", err);
      } finally {
        setStreaming(false);
      }
    },
    [messages, jobDescription, resume, updateResume, updateTailoring]
  );

  const handleSend = useCallback(
    (text: string) => {
      sendMessage(text);
    },
    [sendMessage]
  );

  const handleTailor = useCallback(
    (jd: string) => {
      setJobDescription(jd);
      sendMessage(
        "Please tailor my resume to the following job description.",
        jd
      );
    },
    [sendMessage]
  );

  return (
    <div className="flex h-full flex-col">
      <ScrollArea ref={scrollRef} className="flex-1 px-4">
        <div className="space-y-4 py-4">
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          {streaming && (
            <div className="flex justify-start">
              <div className="flex gap-1 rounded-2xl bg-muted px-4 py-3">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t bg-background p-4">
        <ChatInput onSend={handleSend} disabled={streaming} />
      </div>

      <JobDescriptionPanel onTailor={handleTailor} disabled={streaming} />
    </div>
  );
}
