import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export async function getChatHistory(resumeId: string) {
  return prisma.chatMessage.findMany({
    where: { resumeId },
    orderBy: { createdAt: "asc" },
  });
}

export async function saveChatMessage(
  resumeId: string,
  role: string,
  content: string,
  meta?: Prisma.InputJsonValue | null,
) {
  return prisma.chatMessage.create({
    data: {
      resumeId,
      role,
      content,
      meta: meta ?? Prisma.JsonNull,
    },
  });
}
