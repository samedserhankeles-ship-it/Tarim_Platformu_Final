"use server"

import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

// Favori Ekle/Çıkar (Mevcut)
export async function toggleFavoriteAction(listingId: string, type: "product" | "job") {
  const cookieStore = await cookies()
  const userId = cookieStore.get("session_user_id")?.value

  if (!userId) {
    return { success: false, message: "Lütfen giriş yapın." }
  }

  try {
    const existingFavorite = await prisma.favorite.findFirst({
        where: {
            userId,
            ...(type === "product" ? { productId: listingId } : { jobPostingId: listingId })
        }
    })

    if (existingFavorite) {
        await prisma.favorite.delete({
            where: { id: existingFavorite.id }
        })
        revalidatePath("/dashboard/favoriler")
        return { success: true, message: "Favorilerden çıkarıldı.", isFavorited: false }
    } else {
        await prisma.favorite.create({
            data: {
                userId,
                ...(type === "product" ? { productId: listingId } : { jobPostingId: listingId })
            }
        })
        revalidatePath("/dashboard/favoriler")
        return { success: true, message: "Favorilere eklendi.", isFavorited: true }
    }

  } catch (error) {
    console.error("Favorite toggle error:", error)
    return { success: false, message: "İşlem başarısız." }
  }
}

// Grup Oluştur
export async function createFavoriteGroupAction(name: string) {
    const cookieStore = await cookies()
    const userId = cookieStore.get("session_user_id")?.value
  
    if (!userId) return { success: false, message: "Yetkisiz işlem." }
    if (!name.trim()) return { success: false, message: "Grup adı boş olamaz." }

    try {
        await prisma.favoriteGroup.create({
            data: {
                name: name.trim(),
                userId
            }
        })
        revalidatePath("/dashboard/favoriler")
        return { success: true, message: "Grup oluşturuldu." }
    } catch (error) {
        return { success: false, message: "Grup oluşturulamadı (İsim tekrarı olabilir)." }
    }
}

// Grubu Sil
export async function deleteFavoriteGroupAction(groupId: string) {
    const cookieStore = await cookies()
    const userId = cookieStore.get("session_user_id")?.value
  
    if (!userId) return { success: false, message: "Yetkisiz işlem." }

    try {
        // Önce bu gruptaki favorilerin grup bağını kopar (Silme! Sadece "Genel"e düşsünler)
        await prisma.favorite.updateMany({
            where: { groupId, userId },
            data: { groupId: null }
        })

        await prisma.favoriteGroup.delete({
            where: { id: groupId, userId }
        })
        
        revalidatePath("/dashboard/favoriler")
        return { success: true, message: "Grup silindi." }
    } catch (error) {
        return { success: false, message: "Grup silinemedi." }
    }
}

// Favoriyi Gruba Taşı
export async function moveFavoriteToGroupAction(favoriteId: string, groupId: string | "null") {
    const cookieStore = await cookies()
    const userId = cookieStore.get("session_user_id")?.value
  
    if (!userId) return { success: false, message: "Yetkisiz işlem." }

    try {
        await prisma.favorite.update({
            where: { id: favoriteId, userId },
            data: { 
                groupId: groupId === "null" ? null : groupId 
            }
        })
        
        revalidatePath("/dashboard/favoriler")
        return { success: true, message: "Favori taşındı." }
    } catch (error) {
        return { success: false, message: "Taşıma başarısız." }
    }
}