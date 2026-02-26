import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import type { ResumeData } from "@/lib/resume/types";

export async function listResumes(userId: string) {
  return prisma.resume.findMany({
    where: { userId, isActive: true },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      templateId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getResume(id: string, userId: string) {
  return prisma.resume.findFirst({
    where: { id, userId },
  });
}

export async function createResume(userId: string, title?: string) {
  const emptyData: ResumeData = {
    name: "",
    contactLine1: "",
    education: [],
    experienceSections: [],
    additionalInfo: [],
  };

  return prisma.resume.create({
    data: {
      userId,
      title: title ?? "Untitled Resume",
      data: emptyData as unknown as Prisma.InputJsonValue,
    },
  });
}

export async function updateResume(
  id: string,
  userId: string,
  data: { title?: string; data?: ResumeData; templateId?: string },
) {
  return prisma.resume.updateMany({
    where: { id, userId },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.data !== undefined && { data: data.data as unknown as Prisma.InputJsonValue }),
      ...(data.templateId !== undefined && { templateId: data.templateId }),
    },
  });
}

export async function deleteResume(id: string, userId: string) {
  return prisma.resume.updateMany({
    where: { id, userId },
    data: { isActive: false },
  });
}
