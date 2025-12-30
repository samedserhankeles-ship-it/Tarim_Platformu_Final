"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function createPostAction(formData: FormData) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, message: "Oturum açmanız gerekiyor." }
    }

    const content = formData.get("content") as string
    const file = formData.get("media") as File | null
    
    let mediaUrl = null
    let mediaType = "NONE"

    if (file && file.size > 50 * 1024 * 1024) { // 50MB
        return { success: false, message: "Dosya boyutu çok büyük. Lütfen 50MB'dan küçük bir dosya seçin." }
    }

    if (file && file.size > 0) {
      try {
          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)
          const base64 = buffer.toString('base64')
          const mimeType = file.type
          
          mediaUrl = `data:${mimeType};base64,${base64}`
          
          if (mimeType.startsWith("video/")) {
            mediaType = "VIDEO"
          } else {
            mediaType = "IMAGE"
          }
      } catch (fileError) {
          console.error("File processing error:", fileError)
          return { success: false, message: "Dosya işlenirken bir hata oluştu." }
      }
    }

    if (!content && !mediaUrl) {
        return { success: false, message: "Boş gönderi paylaşılamaz." }
    }

    try {
        // @ts-ignore
        await prisma.socialPost.create({
          data: {
            content,
            media: mediaUrl,
            mediaType,
            userId: user.id
          }
        })
    } catch (dbError) {
        console.error("Database error:", dbError)
        return { success: false, message: "Veritabanına kayıt sırasında hata oluştu." }
    }

    revalidatePath(`/profil/${user.id}`)
    revalidatePath("/social")
    return { success: true, message: "Gönderi paylaşıldı." }

  } catch (error) {
    console.error("Create Post General Error:", error)
    return { success: false, message: "Sunucu tarafında beklenmedik bir hata oluştu." }
  }
}

export async function deletePostAction(postId: string) {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, message: "Yetkisiz işlem." }

        // @ts-ignore
        const post = await prisma.socialPost.findUnique({ where: { id: postId } })
        if (!post) return { success: false, message: "Gönderi bulunamadı." }

        if (post.userId !== user.id && user.role !== "ADMIN") {
            return { success: false, message: "Bu gönderiyi silme yetkiniz yok." }
        }

        // @ts-ignore
        await prisma.socialPost.delete({ where: { id: postId } })
        revalidatePath(`/profil/${post.userId}`)
        revalidatePath("/social")
        return { success: true, message: "Gönderi silindi." }
    } catch (error) {
        console.error("Delete Post Error:", error)
        return { success: false, message: "Silme işlemi başarısız." }
    }
}

export async function toggleLikeAction(postId: string) {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, message: "Oturum açmanız gerekiyor." }

        // @ts-ignore
        if (!prisma.like) return { success: false, message: "Sistem güncelleniyor..." }

        // @ts-ignore
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId: user.id,
                    postId: postId
                }
            }
        })

        if (existingLike) {
            // @ts-ignore
            await prisma.like.delete({
                where: { id: existingLike.id }
            })
            revalidatePath("/social")
            return { success: true, message: "Beğeni kaldırıldı.", liked: false }
        } else {
            // @ts-ignore
            await prisma.like.create({
                data: {
                    userId: user.id,
                    postId: postId
                }
            })
            revalidatePath("/social")
            return { success: true, message: "Gönderi beğenildi.", liked: true }
        }
    } catch (error) {
        console.error("Toggle Like Error:", error)
        return { success: false, message: "İşlem başarısız." }
    }
}

export async function createCommentAction(postId: string, content: string) {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, message: "Oturum açmanız gerekiyor." }

        // @ts-ignore
        if (!prisma.comment) return { success: false, message: "Sistem güncelleniyor..." }

        // @ts-ignore
        await prisma.comment.create({
            data: {
                content,
                postId,
                userId: user.id
            }
        })

        revalidatePath("/social")
        return { success: true, message: "Yorum yapıldı." }
    } catch (error) {
        console.error("Create Comment Error:", error)
        return { success: false, message: "Yorum yapılamadı." }
    }
}

export async function deleteCommentAction(commentId: string) {
    try {
        const user = await getCurrentUser()
        if (!user) return { success: false, message: "Yetkisiz işlem." }

        // @ts-ignore
        if (!prisma.comment) return { success: false, message: "Sistem güncelleniyor..." }

        // @ts-ignore
        const comment = await prisma.comment.findUnique({ where: { id: commentId } })
        if (!comment) return { success: false, message: "Yorum bulunamadı." }

        if (comment.userId !== user.id && user.role !== "ADMIN") {
            return { success: false, message: "Bu yorumu silme yetkiniz yok." }
        }

        // @ts-ignore
        await prisma.comment.delete({ where: { id: commentId } })
        revalidatePath("/social")
        return { success: true, message: "Yorum silindi." }
    } catch (error) {
        console.error("Delete Comment Error:", error)
        return { success: false, message: "Silme başarısız." }
    }
}

export async function toggleFollowAction(followingId: string) {
    try {
        const currentUser = await getCurrentUser()
        if (!currentUser) return { success: false, message: "Oturum açmanız gerekiyor." }

        if (currentUser.id === followingId) return { success: false, message: "Kendinizi takip edemezsiniz." }

        // @ts-ignore
        if (!prisma.follow) return { success: false, message: "Sistem güncelleniyor..." }

        // @ts-ignore
        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: currentUser.id,
                    followingId: followingId
                }
            }
        })

        if (existingFollow) {
            // @ts-ignore
            await prisma.follow.delete({
                where: {
                    followerId_followingId: {
                        followerId: currentUser.id,
                        followingId: followingId
                    }
                }
            })
            revalidatePath(`/profil/${followingId}`)
            revalidatePath(`/social`)
            return { success: true, message: "Takipten çıkıldı.", isFollowing: false }
        } else {
            // @ts-ignore
            await prisma.follow.create({
                data: {
                    followerId: currentUser.id,
                    followingId: followingId
                }
            })
            revalidatePath(`/profil/${followingId}`)
            revalidatePath(`/social`)
            return { success: true, message: "Takip ediliyor.", isFollowing: true }
        }
    } catch (error) {
        console.error("Toggle Follow Error:", error)
        return { success: false, message: "İşlem başarısız oldu." }
    }
}

export async function getFollowersAction(userId: string) {
    try {
        // @ts-ignore
        if (!prisma.follow) return { success: true, data: [] }

        // @ts-ignore
        const followers = await prisma.follow.findMany({
            where: { followingId: userId },
            include: {
                follower: {
                    select: { id: true, name: true, image: true, role: true }
                }
            }
        });
        return { success: true, data: followers.map((f: any) => f.follower) };
    } catch (error) {
        return { success: false, message: "Takipçiler yüklenemedi." };
    }
}

export async function getFollowingAction(userId: string) {
    try {
        // @ts-ignore
        if (!prisma.follow) return { success: true, data: [] }

        // @ts-ignore
        const following = await prisma.follow.findMany({
            where: { followerId: userId },
            include: {
                following: {
                    select: { id: true, name: true, image: true, role: true }
                }
            }
        });
        return { success: true, data: following.map((f: any) => f.following) };
    } catch (error) {
        return { success: false, message: "Takip edilenler yüklenemedi." };
    }
}