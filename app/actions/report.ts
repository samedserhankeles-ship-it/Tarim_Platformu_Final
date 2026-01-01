"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createActivityLog } from "@/lib/audit";

export async function createReportAction(
    reportedUserId: string, 
    reason: string, 
    reportedListingId?: string,
    forumTopicId?: string,
    forumPostId?: string,
    socialPostId?: string
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return { success: false, message: "Oturum açmanız gerekiyor." };
  }

  if (currentUser.id === reportedUserId) {
    return { success: false, message: "Kendinizi şikayet edemezsiniz." };
  }

  if (!reason.trim()) {
    return { success: false, message: "Şikayet sebebi boş olamaz." };
  }

  let productId: string | undefined;
  let jobPostingId: string | undefined;

  if (reportedListingId) {
    if (reportedListingId.startsWith("prod-")) {
      productId = reportedListingId.substring(5);
    } else if (reportedListingId.startsWith("job-")) {
      jobPostingId = reportedListingId.substring(4);
    }
  }

  try {
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: currentUser.id,
        reportedId: reportedUserId,
        reason: reason,
        productId: productId,
        jobPostingId: jobPostingId,
        forumTopicId,
        forumPostId,
        socialPostId
      },
    });

    if (existingReport) {
      return { success: false, message: "Bu içerik hakkında bu sebeple daha önce şikayette bulundunuz." };
    }

    await prisma.report.create({
      data: {
        reporterId: currentUser.id,
        reportedId: reportedUserId,
        reason: reason,
        productId: productId,
        jobPostingId: jobPostingId,
        forumTopicId,
        forumPostId,
        socialPostId
      },
    });

    await createActivityLog(currentUser.id, "REPORT", { reportedUserId, reason });

    revalidatePath("/dashboard/reports");

    return { success: true, message: "Şikayetiniz başarıyla iletilmiştir. Teşekkür ederiz." };
  } catch (error) {
    console.error("Create Report Error:", error);
    return { success: false, message: "Şikayet oluşturulurken bir hata oluştu." };
  }
}