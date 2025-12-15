"use server"

import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { success: false, message: "Lütfen tüm alanları doldurun." }
  }

  try {
    // Email'i lowercase'e çevir (case-insensitive arama için)
    const normalizedEmail = email.toLowerCase().trim()
    
    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      return { success: false, message: "Kullanıcı bulunamadı." }
    }

    // Şifre kontrolü (Demo için düz metin karşılaştırma)
    // Gerçek projede: await bcrypt.compare(password, user.password)
    if (!user.password) {
      return { success: false, message: "Bu kullanıcının şifresi ayarlanmamış. Lütfen yönetici ile iletişime geçin." }
    }
    
    if (user.password !== password) {
      return { success: false, message: "Hatalı şifre." }
    }

    // Başarılı giriş: Cookie ayarla (Basit simülasyon)
    // Next.js 15/16'da cookies() await gerektirebilir, sürümünüze göre değişir ama genelde senkron veya await ile çalışır.
    const cookieStore = await cookies()
    cookieStore.set("session_user_id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 hafta
      path: "/",
    })

  } catch (error) {
    console.error("Login error:", error)
    return { success: false, message: "Bir hata oluştu." }
  }

      // Redirect try-catch bloğu dışında olmalı
      redirect("/dashboard")
  }
  
  export async function signUpAction(formData: FormData) {
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const role = formData.get("role") as string // "farmer", "operator", "merchant"
  
    if (!firstName || !lastName || !email || !password || !role) {
      return { success: false, message: "Lütfen tüm alanları doldurun." }
    }
  
    try {
      // E-posta kontrolü
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })
  
      if (existingUser) {
        return { success: false, message: "Bu e-posta adresi zaten kayıtlı." }
      }
  
      // Yeni kullanıcı oluştur
      const user = await prisma.user.create({
        data: {
          name: `${firstName} ${lastName}`,
          email,
          password, // Demo: Hashlemeden kaydediyoruz. Gerçekte bcrypt kullanılmalı.
          role: role.toUpperCase(), // FARMER, OPERATOR vb.
        },
      })
  
      // Oturum aç (Cookie set et)
      const cookieStore = await cookies()
      cookieStore.set("session_user_id", user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      })
  
    } catch (error) {
      console.error("SignUp error:", error)
      return { success: false, message: "Kayıt olurken bir hata oluştu." }
    }
  
    redirect("/dashboard")
  }
  
  export async function logoutAction() {  const cookieStore = await cookies()
  cookieStore.delete("session_user_id")
  redirect("/")
}
