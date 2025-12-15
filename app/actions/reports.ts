"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function fetchReportsAction(): Promise<any[]> {
  const { prisma: serverPrisma } = await import("@/lib/prisma"); // Dynamically import prisma for server action
  const { getCurrentUser: serverGetCurrentUser } = await import("@/lib/auth");

  const currentUser = await serverGetCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    redirect("/"); // Unauthorized access
  }

  // Currently no query parameter for search, but can be added later if needed
      const reports = await serverPrisma.report.findMany({
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        reported: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: { // Include product details
          select: {
            id: true,
            title: true, // Only need title for display
          },
        },
        jobPosting: { // Include job posting details
          select: {
            id: true,
            title: true, // Only need title for display
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });  return reports;
}
