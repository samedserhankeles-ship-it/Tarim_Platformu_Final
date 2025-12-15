"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function markNotificationsAsReadAction() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    // Should ideally not happen if this action is called from a protected route
    return { success: false, message: "Oturum açmanız gerekiyor." };
  }

  try {
    await prisma.notification.updateMany({
      where: {
        userId: currentUser.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    // Revalidate paths to update UI:
    // 1. The main layout/header (to update the unread count)
    // Revalidating the dashboard root should trigger recalculation in layout.tsx
    revalidatePath("/dashboard"); 

    return { success: true, message: "Bildirimler okundu olarak işaretlendi." };
  } catch (error) {
    console.error("Mark notifications as read error:", error);
    return { success: false, message: "Bildirimler işaretlenirken bir hata oluştu." };
  }
}
