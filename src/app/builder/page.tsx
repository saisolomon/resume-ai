"use client";

import { ResumeProvider } from "@/lib/resume/context";
import { Navbar } from "@/components/layout/Navbar";
import { SplitLayout } from "@/components/layout/SplitLayout";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { ResumePreview } from "@/components/resume/ResumePreview";

export default function BuilderPage() {
  return (
    <ResumeProvider>
      <div className="flex h-screen flex-col">
        <Navbar />
        <div className="flex-1 overflow-hidden">
          <SplitLayout
            left={<ChatPanel />}
            right={<ResumePreview />}
          />
        </div>
      </div>
    </ResumeProvider>
  );
}
