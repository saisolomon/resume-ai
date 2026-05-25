"use client";
import { use, useCallback, useEffect, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import type { TemplateSlug } from "@/components/try/ResumePreviewHtml";
import type { ResumeData } from "@/lib/resume/types";
import { SiteNav } from "@/components/layout/SiteNav";
import { EditableResume } from "@/components/workspace/EditableResume";
import { StylePanel } from "@/components/workspace/StylePanel";
import { useAutoSave } from "@/components/workspace/useAutoSave";

/**
 * Resume Workspace — the Apple-light visual editor.
 *
 * Replaces the chat-based /run/[runId]/edit/[cardId] surface as the
 * primary edit experience. Click-to-edit text, drag-reorder bullets,
 * template/style picker on the right. The old chat editor is still
 * one click away via the "Chat fine-tune" action in the side panel.
 *
 * State flow:
 *   server card.content  ──▶  local `localContent` (working copy)
 *                           ▲   │
 *                           │   └──▶ EditableResume (controlled)
 *                           │                 │
 *                           │                 └──▶ onChange ──▶ setLocalContent
 *                           │
 *                       useAutoSave (debounced, 600ms)
 *                           │
 *                           └──▶ updateMyCardContent mutation
 *
 * The local-mirror pattern prevents the workspace from feeling laggy:
 * we render the local copy immediately and let the server catch up.
 */
export default function WorkspacePage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = use(params);
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  const card = useQuery(api.dashboard.getMyCard, {
    cardId: cardId as Id<"cards">,
  });
  const updateMyCardContent = useMutation(api.dashboard.updateMyCardContent);
  const translateMyCard = useAction(api.translateActions.translateMyCard);

  // Local working copy of the resume — initialized once card loads.
  // We keep templateSlug in local state too so template switches feel
  // instant; useAutoSave persists both together.
  const [localContent, setLocalContent] = useState<ResumeData | null>(null);
  const [localTemplate, setLocalTemplate] = useState<TemplateSlug | null>(null);

  // Initial hydration when the card first loads. We don't overwrite
  // local state on subsequent server updates — the user's in-flight
  // edits should win until they navigate away.
  useEffect(() => {
    if (card && !localContent) {
      setLocalContent(card.content as ResumeData);
      setLocalTemplate(card.templateSlug as TemplateSlug);
    }
  }, [card, localContent]);

  // Translate handler — called from StylePanel. The Convex action
  // patches card.content server-side; once the query re-fires we
  // refresh the local working copy from the new server state so the
  // editor immediately shows the translated content. We deliberately
  // do NOT update localContent synchronously here — the server is the
  // source of truth for translated text, and we want any stale local
  // edits to be replaced wholesale.
  const handleTranslate = useCallback(
    async (targetLanguage: string) => {
      await translateMyCard({
        cardId: cardId as Id<"cards">,
        targetLanguage,
      });
      // Force a re-hydration from the next server snapshot by clearing
      // localContent — the useEffect above will repopulate when the
      // useQuery delivers the patched card.
      setLocalContent(null);
    },
    [cardId, translateMyCard],
  );

  // Auth redirect — single source of truth, mirrors /edit page pattern.
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace(`/sign-in?redirect_url=/workspace/${cardId}`);
    }
  }, [isLoaded, isSignedIn, cardId, router]);

  // Auto-save plumbing. We combine content + template into a single
  // dependency so a template-only change still triggers a save.
  const persistKey = JSON.stringify({
    content: localContent,
    template: localTemplate,
  });
  const persist = useCallback(
    async () => {
      if (!localContent || !localTemplate) return;
      await updateMyCardContent({
        cardId: cardId as Id<"cards">,
        content: localContent,
        templateSlug: localTemplate,
      });
    },
    [localContent, localTemplate, cardId, updateMyCardContent],
  );
  const saveStatus = useAutoSave(persistKey, persist);

  // ── Guards ──────────────────────────────────────────────────────────
  if (isLoaded && !isSignedIn) return null;
  if (card === undefined) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
        <SiteNav home="/dashboard" />
        <div className="mx-auto max-w-2xl px-6 py-16 text-[15px] text-[#6E6E73] sm:px-8">
          Loading workspace.
        </div>
      </div>
    );
  }
  if (!card || !card.content) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
        <SiteNav home="/dashboard" />
        <div className="mx-auto max-w-2xl px-6 py-24 text-center sm:px-8">
          <h1 className="text-h1 text-[#1D1D1F]">Card not ready.</h1>
          <p className="mt-3 text-[15px] text-[#6E6E73]">
            Either this card is still generating, or it failed during the run.
          </p>
          <Link
            href="/dashboard"
            className="focus-ring mt-8 inline-flex h-12 items-center rounded-full bg-[#1D1D1F] px-6 text-[15px] font-medium text-white transition-colors duration-200 hover:bg-black"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }
  if (!localContent || !localTemplate) {
    // Hydration tick — card is here, local state catching up.
    return (
      <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
        <SiteNav home="/dashboard" />
        <div className="mx-auto max-w-2xl px-6 py-16 text-[15px] text-[#6E6E73] sm:px-8">
          Loading workspace.
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5F7] text-[#1D1D1F]">
      <SiteNav home="/dashboard">
        <Link
          href={`/run/${card.runId}`}
          className="inline-flex items-center gap-1.5 text-[15px] font-medium text-[#1D1D1F] transition-colors hover:text-[#6E6E73]"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to gallery
        </Link>
      </SiteNav>

      {/* Two-column split: editable preview on the left, style panel on
          the right. Stack on mobile (preview first, panel below). */}
      <div className="grid flex-1 grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-[1fr_320px]">
        <div className="overflow-y-auto rounded-2xl bg-white shadow-card">
          <EditableResume
            data={localContent}
            template={localTemplate}
            onChange={setLocalContent}
          />
        </div>
        <StylePanel
          angleLabel={card.angleLabel}
          templateSlug={localTemplate}
          onTemplateChange={setLocalTemplate}
          atsTotal={card.atsScore?.total ?? null}
          saveStatus={saveStatus}
          downloadHref={`/api/download/${cardId}`}
          chatHref={`/run/${card.runId}/edit/${cardId}?chat=1`}
          onTranslate={handleTranslate}
        />
      </div>
    </div>
  );
}
