import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function createActivityLog(
  userId: string,
  action: string,
  details?: string | object
) {
  try {
    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    const detailsString = typeof details === "object" ? JSON.stringify(details) : details;

    await prisma.activityLog.create({
      data: {
        userId,
        action,
        details: detailsString,
        ipAddress: ipAddress as string,
        userAgent: userAgent as string,
      },
    });
  } catch (error) {
    console.error("Failed to create activity log:", error);
    // Loglama hatası ana işlemi durdurmamalı, o yüzden sessizce geçiyoruz
  }
}
