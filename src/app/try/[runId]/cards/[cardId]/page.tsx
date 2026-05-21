"use client";
import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { CardDetail } from "@/components/try/CardDetail";

export default function CardDetailPage({
  params,
}: {
  params: Promise<{ runId: string; cardId: string }>;
}) {
  const { cardId } = use(params);
  const card = useQuery(api.cards._getCardById, { cardId: cardId as Id<"cards"> });

  if (card === undefined) return <div className="p-12 text-center text-neutral-400">Loading…</div>;
  if (!card || card.status !== "ready" || !card.content || !card.atsScore) {
    return <div className="p-12 text-center text-neutral-400">This card isn&apos;t ready yet.</div>;
  }

  return (
    <CardDetail
      cardId={card._id}
      angleLabel={card.angleLabel}
      templateSlug={card.templateSlug}
      content={card.content}
      atsScore={card.atsScore}
    />
  );
}
