"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function blockUserAction(userIdToBlock: string) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { success: false, message: "Oturum açmanız gerekiyor." };
    }

    if (currentUser.id === userIdToBlock) {
      return { success: false, message: "Kendinizi engelleyemezsiniz." };
    }

    await prisma.block.create({
      data: {
        blockerId: currentUser.id,
        blockedId: userIdToBlock,
      },
    });

    revalidatePath(`/ilan/${userIdToBlock}`); // Refresh relevant pages if necessary, though listing pages use ID not user ID mostly
    revalidatePath("/dashboard/mesajlar");
    
    return { success: true, message: "Kullanıcı engellendi." };
  } catch (error) {
    console.error("Block User Error:", error);
    // Unique constraint error check could be done here, but UI should prevent it
    return { success: false, message: "Kullanıcı engellenirken bir hata oluştu." };
  }
}

export async function unblockUserAction(userIdToUnblock: string) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { success: false, message: "Oturum açmanız gerekiyor." };
    }

    await prisma.block.delete({
      where: {
        blockerId_blockedId: {
          blockerId: currentUser.id,
          blockedId: userIdToUnblock,
        },
      },
    });

    revalidatePath("/dashboard/settings"); // Assuming there might be a blocked users list here
    
    return { success: true, message: "Kullanıcı engeli kaldırıldı." };
  } catch (error) {
    console.error("Unblock User Error:", error);
    return { success: false, message: "Engel kaldırılırken bir hata oluştu." };
  }
}

export async function checkBlockStatus(userId1: string, userId2: string) {
    // Check if either user has blocked the other
    const block = await prisma.block.findFirst({
        where: {
            OR: [
                { blockerId: userId1, blockedId: userId2 },
                { blockerId: userId2, blockedId: userId1 }
            ]
        }
    });

    return !!block;
}
