"use client";

import { useState, type ReactNode } from "react";

interface SplitLayoutProps {
  left: ReactNode;
  right: ReactNode;
}

export function SplitLayout({ left, right }: SplitLayoutProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "preview">("chat");

  return (
    <>
      {/* Desktop: side-by-side */}
      <div className="hidden lg:flex h-full">
        <div className="w-[40%] border-r flex flex-col">{left}</div>
        <div className="w-[60%] flex flex-col">{right}</div>
      </div>

      {/* Tablet / Mobile: tabbed */}
      <div className="flex flex-col h-full lg:hidden">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              activeTab === "chat"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              activeTab === "preview"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground"
            }`}
          >
            Preview
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          {activeTab === "chat" ? left : right}
        </div>
      </div>
    </>
  );
}
