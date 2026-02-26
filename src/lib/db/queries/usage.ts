import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export type UsageEventType =
  | "chat_message"
  | "docx_download"
  | "pdf_download"
  | "resume_created"
  | "file_upload"
  | "jd_tailor";

export async function logUsageEvent(
  userId: string,
  type: UsageEventType,
  metadata?: Record<string, unknown>,
) {
  return prisma.usageEvent.create({
    data: {
      userId,
      type,
      metadata: (metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
    },
  });
}

export async function countUsageEvents(
  userId: string,
  type: UsageEventType,
  since: Date,
) {
  return prisma.usageEvent.count({
    where: {
      userId,
      type,
      createdAt: { gte: since },
    },
  });
}

export async function getUsageSummary(userId: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [chatMessages, docxDownloads, pdfDownloads, resumesCreated] =
    await Promise.all([
      countUsageEvents(userId, "chat_message", startOfDay),
      countUsageEvents(userId, "docx_download", startOfDay),
      countUsageEvents(userId, "pdf_download", startOfDay),
      prisma.resume.count({ where: { userId, isActive: true } }),
    ]);

  return { chatMessages, docxDownloads, pdfDownloads, resumesCreated };
}
