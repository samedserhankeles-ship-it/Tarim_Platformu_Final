"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function createTopicAction(formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, message: "Oturum açmanız gerekiyor." }

    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const category = formData.get("category") as string

    if (!title || !content) return { success: false, message: "Başlık ve içerik gereklidir." }

    const topic = await prisma.forumTopic.create({
      data: {
        title,
        content,
        category: category || "GENEL",
        authorId: user.id
      }
    })

    revalidatePath("/community")
    return { success: true, message: "Konu açıldı.", topicId: topic.id }
  } catch (error) {
    console.error("Create Topic Error:", error)
    return { success: false, message: "Bir hata oluştu." }
  }
}

export async function createForumReplyAction(topicId: string, content: string) {
  try {
    const user = await getCurrentUser()
    if (!user) return { success: false, message: "Oturum açmanız gerekiyor." }

    if (!content.trim()) return { success: false, message: "Yanıt boş olamaz." }

    await prisma.forumPost.create({
      data: {
        content,
        topicId,
        authorId: user.id
      }
    })

    revalidatePath(`/community/topic/${topicId}`)
    return { success: true, message: "Yanıt gönderildi." }
  } catch (error) {
    console.error("Reply Error:", error)
    return { success: false, message: "Yanıt gönderilemedi." }
  }
}

export async function getTopicsAction(category?: string) {
    try {
        const topics = await prisma.forumTopic.findMany({
            where: category && category !== "HEPSİ" ? { category } : {},
            orderBy: { createdAt: "desc" },
            include: {
                author: { select: { name: true, image: true } },
                _count: { select: { posts: true } }
            }
        })
        return { success: true, data: topics }
    } catch (error) {
        return { success: false, message: "Konular yüklenemedi." }
    }
}

export async function incrementTopicViewsAction(topicId: string) {
    try {
        await prisma.forumTopic.update({
            where: { id: topicId },
            data: { views: { increment: 1 } }
        });
        return { success: true };
    } catch (error) {
        console.error("Increment Views Error:", error);
        return { success: false };
    }
}

export async function getPopularTopicsAction() {
    try {
        // En çok yanıt alan ve görüntülenen konuları getir
        const popularTopics = await prisma.forumTopic.findMany({
            take: 5,
            orderBy: [
                { posts: { _count: 'desc' } }, // Önce yanıt sayısı
                { views: 'desc' } // Sonra görüntülenme
            ],
            include: {
                _count: { select: { posts: true } }
            }
        });
        return { success: true, data: popularTopics };
    } catch (error) {
        return { success: false, message: "Popüler konular yüklenemedi." };
    }
}

