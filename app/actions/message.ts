"use server"

import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

// Kullanıcının ID'sini almak için yardımcı
async function getUserId() {
  const cookieStore = await cookies()
  return cookieStore.get("session_user_id")?.value
}

// 1. Yeni Mesaj Gönder (veya Sohbet Başlat)
export async function sendMessageAction(receiverId: string, content: string) {
  const senderId = await getUserId()
  if (!senderId) return { success: false, message: "Oturum açmanız gerekiyor." }
  if (!content.trim()) return { success: false, message: "Mesaj boş olamaz." }

  try {
    // Önce mevcut sohbeti bulmaya çalış (Sender veya Receiver yer değiştirebilir)
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

    // Güncelleme: Sohbetin updatedAt zamanını güncelle (Listede yukarı çıksın)
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

    revalidatePath("/dashboard/mesajlar")
    // Also revalidate the notifications page to update the count
    revalidatePath("/dashboard/bildirimler")
    return { success: true, message: "Mesaj gönderildi." }

  } catch (error) {
    console.error("Mesaj gönderme hatası:", error)
    return { success: false, message: "Mesaj gönderilirken bir hata oluştu." }
  }
}

// 2. Kullanıcının Sohbet Listesini Getir
export async function getConversations() {
  const userId = await getUserId()
  if (!userId) return []

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
  const userId = await getUserId()
  if (!userId) return []

  // Güvenlik: Kullanıcı bu sohbete dahil mi?
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  })

  if (!conversation || (conversation.participant1Id !== userId && conversation.participant2Id !== userId)) {
    return []
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" }, // Eskiden yeniye
    include: {
        sender: { select: { id: true, name: true, image: true } }
    }
  })

  return messages
}
