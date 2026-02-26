import { prisma } from "./prisma";

export async function syncUser(clerkId: string, email: string, name?: string | null) {
  return prisma.user.upsert({
    where: { clerkId },
    update: { email, name: name ?? undefined },
    create: { clerkId, email, name },
  });
}

export async function getUserByClerkId(clerkId: string) {
  return prisma.user.findUnique({ where: { clerkId } });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}
