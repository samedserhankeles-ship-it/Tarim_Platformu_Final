"use server";

import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const SUPER_ADMIN_EMAIL = "admin@tarim.com";

// Helper to check if current user is admin
async function checkAdmin() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    throw new Error("Yetkisiz erişim: Sadece yöneticiler bu işlemi yapabilir.");
  }
  return currentUser;
}

// Helper to check if target is super admin
async function checkSuperAdminTarget(userId: string) {
    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (targetUser && targetUser.email === SUPER_ADMIN_EMAIL) {
        throw new Error("Ana yönetici hesabı üzerinde bu işlem yapılamaz.");
    }
    return targetUser;
}

// Admin: Kullanıcıyı Banlama
export async function banUserAction(userId: string, durationInDays: number, reason: string) {
  try {
    await checkAdmin();
    await checkSuperAdminTarget(userId);

    const bannedUntil = new Date();
    bannedUntil.setDate(bannedUntil.getDate() + durationInDays);

    await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        bannedUntil,
        banReason: reason,
      },
    });

    revalidatePath("/dashboard/users"); // Kullanıcı listesini güncelle
    return { success: true, message: `Kullanıcı ${durationInDays} gün süreyle yasaklandı.` };
  } catch (error: any) {
    console.error("Ban User Error:", error);
    return { success: false, message: error.message || "Kullanıcı yasaklanırken bir hata oluştu." };
  }
}

// Admin: Kullanıcının Banını Kaldırma
export async function unbanUserAction(userId: string) {
  try {
    await checkAdmin();
    // Super admin zaten banlanamaz ama yine de kontrol ekleyelim
    await checkSuperAdminTarget(userId);

    await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: false,
        bannedUntil: null,
        banReason: null,
      },
    });

    revalidatePath("/dashboard/users");
    return { success: true, message: "Kullanıcının yasağı kaldırıldı." };
  } catch (error: any) {
    console.error("Unban User Error:", error);
    return { success: false, message: error.message || "Yasak kaldırılırken bir hata oluştu." };
  }
}

// Admin: Kullanıcıyı Kısıtlama
export async function restrictUserAction(userId: string, reason: string) {
  try {
    await checkAdmin();
    await checkSuperAdminTarget(userId);

    await prisma.user.update({
      where: { id: userId },
      data: {
        isRestricted: true,
        restrictionReason: reason,
      },
    });

    revalidatePath("/dashboard/users");
    return { success: true, message: "Kullanıcı kısıtlandı." };
  } catch (error: any) {
    console.error("Restrict User Error:", error);
    return { success: false, message: error.message || "Kullanıcı kısıtlanırken bir hata oluştu." };
  }
}

// Admin: Kullanıcının Kısıtlamasını Kaldırma
export async function unrestrictUserAction(userId: string) {
  try {
    await checkAdmin();
    await checkSuperAdminTarget(userId);

    await prisma.user.update({
      where: { id: userId },
      data: {
        isRestricted: false,
        restrictionReason: null,
      },
    });

    revalidatePath("/dashboard/users");
    return { success: true, message: "Kullanıcının kısıtlaması kaldırıldı." };
  } catch (error: any) {
    console.error("Unrestrict User Error:", error);
    return { success: false, message: error.message || "Kısıtlama kaldırılırken bir hata oluştu." };
  }
}

// Admin: İlan Silme
export async function deleteListingAction(listingId: string, type: "product" | "job") {
  try {
    await checkAdmin();

    if (type === "product") {
      await prisma.product.delete({
        where: { id: listingId },
      });
    } else if (type === "job") {
      await prisma.jobPosting.delete({
        where: { id: listingId },
      });
    }

    revalidatePath("/explore"); // Ana ilan sayfasını güncelle
    revalidatePath("/dashboard/ilanlarim"); // İlanlarım sayfasını güncelle
    // Revalidate the new admin listings page once it's created
    revalidatePath("/dashboard/admin/listings"); 

    return { success: true, message: "İlan başarıyla silindi." };
  } catch (error: any) {
    console.error("Delete Listing Error:", error);
    return { success: false, message: error.message || "İlan silinirken bir hata oluştu." };
  }
}

// Admin: İlanın Aktif Durumunu Değiştirme (Gizle/Yayınla)
export async function toggleListingActiveStatusAction(listingId: string, type: "product" | "job", newStatus: boolean) {
  try {
    await checkAdmin();

    let listing;
    let userId;
    let title;

    if (type === "product") {
      listing = await prisma.product.update({
        where: { id: listingId },
        data: { active: newStatus },
        select: { userId: true, title: true }
      });
      userId = listing.userId;
      title = listing.title;
    } else if (type === "job") {
      listing = await prisma.jobPosting.update({
        where: { id: listingId },
        data: { active: newStatus },
        select: { userId: true, title: true }
      });
      userId = listing.userId;
      title = listing.title;
    }

    // Kullanıcıya bildirim gönder
    if (userId && title) {
        let notificationTitle = "";
        let notificationMessage = "";
        let notificationType = "INFO";

        if (newStatus === false) {
            notificationTitle = "İlanınız Yayından Kaldırıldı";
            notificationMessage = `"${title}" başlıklı ilanınız yönetici tarafından yayından kaldırılmıştır.`;
            notificationType = "WARNING";
        } else {
            notificationTitle = "İlanınız Yayına Alındı";
            notificationMessage = `"${title}" başlıklı ilanınız onaylanmış ve yayına alınmıştır.`;
            notificationType = "SUCCESS";
        }

        await prisma.notification.create({
            data: {
                userId: userId,
                title: notificationTitle,
                message: notificationMessage,
                type: notificationType,
                link: "/dashboard/ilanlarim"
            }
        });
    }

    revalidatePath("/explore"); // Ana ilan sayfasını güncelle
    revalidatePath("/dashboard/admin/listings"); // Admin ilan listesini güncelle

    return { success: true, message: `İlan başarıyla ${newStatus ? "yayınlandı" : "gizlendi"}.` };
  } catch (error: any) {
    console.error("Toggle Listing Active Status Error:", error);
    return { success: false, message: error.message || "İlan durumu güncellenirken bir hata oluştu." };
  }
}

// Admin: Duyuru Oluşturma
export async function createAnnouncementAction(title: string, content: string, targetRoles?: string) {
  try {
    const currentUser = await checkAdmin(); // Sadece adminler duyuru oluşturabilir

    await prisma.announcement.create({
      data: {
        title,
        content,
        authorId: currentUser.id,
        targetRoles: targetRoles || null,
      },
    });

    revalidatePath("/dashboard/admin/announcements"); // Duyurular sayfasını güncelle
    // Duyuruların görünmesi gereken diğer yerleri de güncelleyebiliriz (örn: /dashboard/bildirimler)
    revalidatePath("/dashboard/bildirimler");

    return { success: true, message: "Duyuru başarıyla oluşturuldu." };
  } catch (error: any) {
    console.error("Create Announcement Error:", error);
    return { success: false, message: error.message || "Duyuru oluşturulurken bir hata oluştu." };
  }
}

// Admin: Toplu Mesaj Gönderme
export async function sendBulkMessageAction(messageContent: string, targetRoles?: string) {
  try {
    const adminUser = await checkAdmin(); // Sadece adminler toplu mesaj gönderebilir

    if (!messageContent.trim()) {
      return { success: false, message: "Mesaj içeriği boş olamaz." };
    }

    const whereClause: any = {};
    if (targetRoles) {
      const rolesArray = targetRoles.split(",").map(role => role.trim()).filter(Boolean);
      if (rolesArray.length > 0) {
        whereClause.role = { in: rolesArray };
      }
    }
    whereClause.id = { not: adminUser.id }; // Admin kendini hedefleyemez

    const targetUsers = await prisma.user.findMany({
      where: whereClause,
      select: { id: true, name: true },
    });

    let sentCount = 0;
    for (const user of targetUsers) {
      // 1. Sohbeti bul veya oluştur
      let conversation = await prisma.conversation.findFirst({
        where: {
          OR: [
            { participant1Id: adminUser.id, participant2Id: user.id },
            { participant1Id: user.id, participant2Id: adminUser.id },
          ],
        },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            participant1Id: adminUser.id,
            participant2Id: user.id,
          },
        });
      }

      // 2. Mesajı oluştur
      await prisma.message.create({
        data: {
          content: messageContent,
          senderId: adminUser.id,
          receiverId: user.id,
          conversationId: conversation.id,
        },
      });

      // 3. Kullanıcıya bildirim oluştur
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Yeni Mesaj",
          message: `${adminUser.name || 'Admin'} size bir toplu mesaj gönderdi.`,
          link: `/dashboard/mesajlar?conv=${conversation.id}`,
          type: "INFO",
        },
      });
      sentCount++;
    }

    revalidatePath("/dashboard/admin/bulk-messages"); // Toplu mesaj gönderme sayfasını güncelle
    revalidatePath("/dashboard/mesajlar"); // Kullanıcıların mesaj listesini potansiyel olarak güncelle
    revalidatePath("/dashboard/bildirimler"); // Kullanıcıların bildirimlerini güncelle

    return { success: true, message: `${sentCount} kullanıcıya toplu mesaj gönderildi.` };
  } catch (error: any) {
    console.error("Send Bulk Message Error:", error);
    return { success: false, message: error.message || "Toplu mesaj gönderilirken bir hata oluştu." };
  }
}

// Admin: Şikayet Silme
export async function deleteReportAction(reportId: string) {
  try {
    await checkAdmin();

    await prisma.report.delete({
      where: { id: reportId },
    });

    revalidatePath("/dashboard/reports"); // Admin şikayetler sayfasını güncelle
    return { success: true, message: "Şikayet başarıyla silindi." };
  } catch (error: any) {
    console.error("Delete Report Error:", error);
    return { success: false, message: error.message || "Şikayet silinirken bir hata oluştu." };
  }
}

// Admin: Kullanıcıya Özel Duyuru Gönderme
export async function sendPrivateAnnouncementAction(userId: string, title: string, message: string) {
  try {
    await checkAdmin(); // Sadece adminler

    if (!title.trim() || !message.trim()) {
      return { success: false, message: "Başlık ve mesaj boş olamaz." };
    }

    // Kullanıcıya bildirim oluştur
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type: "INFO", // Veya "ANNOUNCEMENT" eğer model destekliyorsa, şimdilik "INFO"
        // link: opsiyonel, eğer bir yere gitmesini istersek
      },
    });

    revalidatePath("/dashboard/users"); // Kullanıcı listesini güncelle (gerekirse)
    revalidatePath(`/dashboard/bildirimler`); // Kullanıcının bildirimlerini güncelle

    return { success: true, message: "Kullanıcıya özel duyuru gönderildi." };
  } catch (error: any) {
    console.error("Send Private Announcement Error:", error);
    return { success: false, message: error.message || "Duyuru gönderilirken bir hata oluştu." };
  }
}

// Admin: Yeni Kullanıcı Oluşturma
export async function createUserAction(formData: FormData) {
  try {
    await checkAdmin();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;

    if (!name || !email || !password || !role) {
      return { success: false, message: "Tüm alanları doldurunuz." };
    }

    // Email kontrolü
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, message: "Bu e-posta adresi zaten kullanımda." };
    }

    const hashedPassword = await hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    revalidatePath("/dashboard/users");
    return { success: true, message: "Kullanıcı başarıyla oluşturuldu." };
  } catch (error: any) {
    console.error("Create User Error:", error);
    return { success: false, message: error.message || "Kullanıcı oluşturulurken bir hata oluştu." };
  }
}

// Admin: Kullanıcı Silme

export async function deleteUserAction(userId: string) {

  try {

    const currentUser = await checkAdmin();



    if (userId === currentUser.id) {

      return { success: false, message: "Kendinizi silemezsiniz." };

    }



    // Super Admin Kontrolü

    await checkSuperAdminTarget(userId);



    // İlişkili verileri temizle (Transaction ile)

    await prisma.$transaction(async (tx) => {

      // 1. İlanları sil

      await tx.jobPosting.deleteMany({ where: { userId } });

      await tx.product.deleteMany({ where: { userId } });



      // 2. Mesajları sil

      await tx.message.deleteMany({ where: { senderId: userId } });

      // Alıcı olduğu mesajlar conversation üzerinden silinmeli ama modelde receiverId opsiyonel.



      // Konuşmaları sil (Katılımcı olduğu)

      await tx.conversation.deleteMany({

        where: {

          OR: [

            { participant1Id: userId },

            { participant2Id: userId }

          ]

        }

      });



      // Bildirimleri sil

      await tx.notification.deleteMany({ where: { userId } });



      // Favorileri sil

      await tx.favorite.deleteMany({ where: { userId } });

      

      // Favori Gruplarını sil

      await tx.favoriteGroup.deleteMany({ where: { userId } });



      // Duyuruları sil

      await tx.announcement.deleteMany({ where: { authorId: userId } });

      

      // Bloklamaları sil

      await tx.block.deleteMany({

          where: {

              OR: [

                  { blockerId: userId },

                  { blockedId: userId }

              ]

          }

      });

      

      // Şikayetleri sil

      await tx.report.deleteMany({

          where: {

              OR: [

                  { reporterId: userId },

                  { reportedId: userId }

              ]

          }

      });



      // Son olarak kullanıcıyı sil

      await tx.user.delete({ where: { id: userId } });

    });



    revalidatePath("/dashboard/users");

    return { success: true, message: "Kullanıcı ve ilişkili tüm veriler başarıyla silindi." };

  } catch (error: any) {

    console.error("Delete User Error:", error);

    return { success: false, message: error.message || "Kullanıcı silinirken bir hata oluştu." };

  }

}



// Admin: Kullanıcı Rolünü Güncelleme

export async function updateUserRoleAction(userId: string, newRole: string) {

  try {

    const currentUser = await checkAdmin();



    // Sadece Super Admin diğer kullanıcıları ADMIN yapabilir veya ADMIN yetkisini alabilir.

    // Ancak daha basit bir yaklaşım olarak: Her admin rol değiştirebilsin ama Super Admin'e dokunamasın.

    // Ekstra güvenlik: Eğer yeni rol ADMIN ise veya mevcut rol ADMIN ise işlemi yapan Super Admin olmalı mı?

    // Kullanıcı isteği: "bu hesap diğer yönetici hesaplara yetki versin" -> Yani Super Admin yetki dağıtır.

    

    // Hedef Super Admin ise kimse rolünü değiştiremez

    await checkSuperAdminTarget(userId);



    // Eğer kullanıcı kendi rolünü değiştirmeye çalışıyorsa engelle

    if (userId === currentUser.id) {

        return { success: false, message: "Kendi rolünüzü değiştiremezsiniz." };

    }



    // Yetki kontrolü: Sadece Super Admin başka birini ADMIN yapabilir veya ADMIN yetkisini alabilir.

    // Diğer adminler sadece FARMER, BUSINESS, OPERATOR arasında geçiş yapabilsin.

    if (currentUser.email !== SUPER_ADMIN_EMAIL) {

        // Eğer hedef kullanıcı şu an ADMIN ise veya yeni rol ADMIN olacaksa

        const targetUser = await prisma.user.findUnique({ where: { id: userId } });

        if (targetUser?.role === "ADMIN" || newRole === "ADMIN") {

             return { success: false, message: "Yönetici yetkisi verme/alma işlemi sadece Ana Yönetici tarafından yapılabilir." };

        }

    }



    await prisma.user.update({

      where: { id: userId },

      data: { role: newRole },

    });



    revalidatePath("/dashboard/users");

    return { success: true, message: `Kullanıcı rolü ${newRole} olarak güncellendi.` };

  } catch (error: any) {

    console.error("Update User Role Error:", error);

    return { success: false, message: error.message || "Kullanıcı rolü güncellenirken bir hata oluştu." };

  }

}
