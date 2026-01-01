"use server"

import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth" // getCurrentUser import edildi
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { createActivityLog } from "@/lib/audit";

// Helper to get user ID (deprecated in favor of getCurrentUser for more info)
async function getUserId() {
  const cookieStore = await cookies()
  return cookieStore.get("session_user_id")?.value
}

// 1. Yeni Mesaj Gönder (veya Sohbet Başlat) - TEXT ONLY
export async function sendMessageAction(receiverId: string, content: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { success: false, message: "Oturum açmanız gerekiyor." }
  
  const senderId = currentUser.id;
  if (!content.trim()) return { success: false, message: "Mesaj boş olamaz." }

  try {
    // BAN KONTROLÜ
    if (currentUser.isBanned && currentUser.bannedUntil && new Date(currentUser.bannedUntil) > new Date()) {
        // Alıcının rolünü kontrol et
        const receiver = await prisma.user.findUnique({
            where: { id: receiverId },
            select: { role: true }
        });

        if (!receiver || receiver.role !== "ADMIN") {
            return { success: false, message: "Hesabınız yasaklandığı için sadece yöneticilerle iletişime geçebilirsiniz." };
        }
    }

    // Önce mevcut sohbeti bulmaya çalış
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { participant1Id: senderId, participant2Id: receiverId },
          { participant1Id: receiverId, participant2Id: senderId },
        ],
      },
    })

    // Sohbet yoksa oluştur
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participant1Id: senderId,
          participant2Id: receiverId,
        },
      })
    }

    // Mesajı oluştur
    const newMessage = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId, // Opsiyonel ama tutalım
        conversationId: conversation.id,
      },
    });

    // Sohbetin updatedAt zamanını güncelle
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    // Alıcıya bildirim gönder
    const sender = await prisma.user.findUnique({
      where: { id: senderId },
      select: { name: true },
    });

    if (sender && sender.name) {
      await prisma.notification.create({
        data: {
          userId: receiverId,
          title: "Yeni Mesaj",
          message: `${sender.name} size bir mesaj gönderdi.`,
          link: `/dashboard/mesajlar?conv=${conversation.id}`,
          type: "INFO",
        },
      });
    }

    await createActivityLog(currentUser.id, "SEND_MESSAGE", { receiverId, type: "TEXT" });

    revalidatePath("/dashboard/mesajlar")
    revalidatePath("/dashboard/bildirimler")
    return { success: true, message: "Mesaj gönderildi." }

  } catch (error) {
    console.error("Mesaj gönderme hatası:", error)
    return { success: false, message: "Mesaj gönderilirken bir hata oluştu." }
  }
}

// 1.5 Yeni Mesaj Gönder (MEDYA DESTEKLİ)
export async function sendMessageWithMediaAction(formData: FormData) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return { success: false, message: "Oturum açmanız gerekiyor." }
  
  const senderId = currentUser.id;
  const receiverId = formData.get("receiverId") as string;
  const content = formData.get("content") as string;
  const mediaFile = formData.get("media") as File | null;

  if (!receiverId) return { success: false, message: "Alıcı bilgisi eksik." };
  if (!content && !mediaFile) return { success: false, message: "Mesaj veya medya göndermelisiniz." };

  let mediaUrl = null;
  let mediaType = null;

  // Medya yükleme işlemi
  console.log("Action received. Content:", content, "MediaFile:", mediaFile ? { name: mediaFile.name, size: mediaFile.size, type: mediaFile.type } : "None");

  if (mediaFile && mediaFile.size > 0) {
      try {
          console.log("Processing media file...");
          const bytes = await mediaFile.arrayBuffer();
          const buffer = Buffer.from(bytes);
          
          const mimeType = mediaFile.type;
          const isImage = mimeType.startsWith("image/");
          const isVideo = mimeType.startsWith("video/");
          
          if (isImage) mediaType = "IMAGE";
          else if (isVideo) mediaType = "VIDEO";
          else mediaType = "FILE";

          const ext = mediaFile.name.split('.').pop() || 'bin';
          const filename = `msg-${Date.now()}-${Math.round(Math.random() * 1000)}.${ext}`;
          
          const uploadDir = join(process.cwd(), 'public', 'uploads', 'messages');
          if (!existsSync(uploadDir)) {
              console.log("Creating upload directory:", uploadDir);
              await mkdir(uploadDir, { recursive: true });
          }

          const filepath = join(uploadDir, filename);
          await writeFile(filepath, buffer);
          mediaUrl = `/uploads/messages/${filename}`;
          console.log("File saved to:", mediaUrl);

      } catch (error) {
          console.error("Medya yükleme hatası detaylı:", error);
          return { success: false, message: "Dosya yüklenemedi: " + (error instanceof Error ? error.message : "Bilinmeyen hata") };
      }
  }

  try {
      if (currentUser.isBanned && currentUser.bannedUntil && new Date(currentUser.bannedUntil) > new Date()) {
        const receiver = await prisma.user.findUnique({ where: { id: receiverId }, select: { role: true } });
        if (!receiver || receiver.role !== "ADMIN") return { success: false, message: "Hesabınız yasaklandığı için sadece yöneticilerle iletişime geçebilirsiniz." };
      }

      let conversation = await prisma.conversation.findFirst({
        where: {
            OR: [
                { participant1Id: senderId, participant2Id: receiverId },
                { participant1Id: receiverId, participant2Id: senderId },
            ],
        },
      });

      if (!conversation) {
        console.log("Creating new conversation...");
        conversation = await prisma.conversation.create({
            data: {
                participant1Id: senderId,
                participant2Id: receiverId,
            },
        });
      }

      console.log("Creating message in DB...");
      await prisma.message.create({
          data: {
              content: content || "",
              media: mediaUrl,
              mediaType: mediaType,
              senderId,
              receiverId,
              conversationId: conversation.id
          }
      });
      console.log("Message created successfully.");

      await prisma.conversation.update({
          where: { id: conversation.id },
          data: { updatedAt: new Date() }
      });


      const sender = await prisma.user.findUnique({ where: { id: senderId }, select: { name: true } });
      if (sender?.name) {
          await prisma.notification.create({
              data: {
                  userId: receiverId,
                  title: "Yeni Mesaj",
                  message: `${sender.name} size bir ${mediaType ? (mediaType === 'IMAGE' ? 'fotoğraf' : 'video') : 'mesaj'} gönderdi.`,
                  link: `/dashboard/mesajlar?conv=${conversation.id}`,
                  type: "INFO"
              }
          });
      }

      await createActivityLog(currentUser.id, "SEND_MESSAGE", { receiverId, type: mediaType || "TEXT" });

      revalidatePath("/dashboard/mesajlar");
      revalidatePath("/dashboard/bildirimler");
      return { success: true, message: "Mesaj gönderildi." };

  } catch (error) {
      console.error("Mesaj gönderme hatası:", error);
      return { success: false, message: "Hata oluştu." };
  }
}

// 2. Kullanıcının Sohbet Listesini Getir
export async function getConversations() {
  const currentUser = await getCurrentUser()
  if (!currentUser) return []
  const userId = currentUser.id

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { participant1Id: userId },
        { participant2Id: userId },
      ],
    },
    include: {
      participant1: { select: { id: true, name: true, image: true } },
      participant2: { select: { id: true, name: true, image: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1, // Son mesajı al
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  // Formatla: Karşı tarafın bilgisini "partner" olarak ekle
  return conversations.map((conv) => {
    const partner = conv.participant1Id === userId ? conv.participant2 : conv.participant1
    const lastMessage = conv.messages[0]
    return {
      id: conv.id,
      partner,
      lastMessage: lastMessage ? {
        content: lastMessage.content,
        createdAt: lastMessage.createdAt,
        isRead: lastMessage.isRead,
        senderId: lastMessage.senderId
      } : null,
    }
  })
}

// 3. Bir Sohbetin Mesajlarını Getir
export async function getMessages(conversationId: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return []
  const userId = currentUser.id

  if (!conversationId) return []

  // Güvenlik: Kullanıcı bu sohbete dahil mi?
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  })

  if (!conversation || (conversation.participant1Id !== userId && conversation.participant2Id !== userId)) {
    return []
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: conversationId },
    orderBy: { createdAt: "asc" }, // Eskiden yeniye
    include: {
        sender: { select: { id: true, name: true, image: true } }
    }
  })

  // OKUNDU İŞARETLEME MANTIĞI
  // 1. Bu sohbette, karşı tarafın attığı ve henüz okunmamış mesajları bul ve güncelle
  const unreadMessagesCount = messages.filter(m => m.receiverId === userId && !m.isRead).length;

  if (unreadMessagesCount > 0) {
    // Mesajları okundu yap
    await prisma.message.updateMany({
      where: {
        conversationId: conversationId,
        receiverId: userId,
        isRead: false
      },
      data: { isRead: true }
    });

    // 2. Bu sohbetle ilgili bildirimleri de okundu yap (veya silinebilir, şimdilik okundu yapalım)
    // Bildirim linki: /dashboard/mesajlar?conv=...
    const listingLink = `/dashboard/mesajlar?conv=${conversationId}`;
    
    await prisma.notification.updateMany({
        where: {
            userId: userId,
            link: listingLink,
            isRead: false
        },
        data: { isRead: true }
    });
    
    // revalidatePath("/dashboard/bildirimler"); // Render sırasında çağrılamaz, kaldırıldı.
  }

  return messages
}