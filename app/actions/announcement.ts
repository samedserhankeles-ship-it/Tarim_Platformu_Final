"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function fetchAnnouncementsAction(query: string): Promise<any[]> {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    redirect("/"); // Unauthorized access
  }

  const whereClause: any = {};
  if (query) {
    whereClause.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { content: { contains: query, mode: "insensitive" } },
    ];
  }

  const announcements = await prisma.announcement.findMany({
    where: whereClause,
    include: {
      author: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return announcements;
}
