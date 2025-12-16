"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function updateUserProfileAction(formData: FormData) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return { success: false, message: "Oturum açmanız gerekiyor." };
  }

  const name = formData.get("name") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;
  const phone = formData.get("phone") as string;
  const bio = formData.get("bio") as string;
  const city = formData.get("city") as string;
  const district = formData.get("district") as string;
  const crops = formData.get("crops") as string; // Virgülle ayrılmış ürünler
  const certificates = formData.get("certificates") as string; // Virgülle ayrılmış sertifikalar
  const website = formData.get("website") as string;
  const addressDetail = formData.get("addressDetail") as string;
  const imageFile = formData.get("image") as File | null;
  const coverImageFile = formData.get("coverImage") as File | null; // Yeni: Cover Image

  console.log("Image file received:", imageFile ? {
    name: imageFile.name,
    size: imageFile.size,
    type: imageFile.type
  } : "No file");
  console.log("Cover Image file received:", coverImageFile ? {
    name: coverImageFile.name,
    size: coverImageFile.size,
    type: coverImageFile.type
  } : "No file");

  // İsim birleştirme (eğer firstName ve lastName varsa)
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : name;

  let imageUrl = currentUser.image; // Mevcut resmi koru
  let coverImageUrl = currentUser.coverImage; // Mevcut cover resmini koru

  // Resim yükleme işlemi (Avatar)
  if (imageFile && imageFile.size > 0 && imageFile instanceof File) {
    try {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Dosya uzantısı
      const ext = imageFile.name.split('.').pop() || 'jpg';
      const filename = `${currentUser.id}-${Date.now()}-avatar.${ext}`;
      
      // Upload klasörünü oluştur
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'users'); // Banners için ayrı bir klasör de olabilir
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      // Dosyayı kaydet
      const filepath = join(uploadDir, filename);
      await writeFile(filepath, buffer);

      // URL'i oluştur
      imageUrl = `/uploads/users/${filename}`;
      console.log("Image saved to:", imageUrl);
    } catch (error) {
      console.error("Resim yükleme hatası (Avatar):", error);
      return { success: false, message: `Avatar yüklenirken bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}` };
    }
  } else {
    console.log("No avatar file to upload or file is empty");
  }

  // Resim yükleme işlemi (Cover Image / Banner)
  if (coverImageFile && coverImageFile.size > 0 && coverImageFile instanceof File) {
    try {
      const bytes = await coverImageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Dosya uzantısı
      const ext = coverImageFile.name.split('.').pop() || 'jpg';
      const filename = `${currentUser.id}-${Date.now()}-cover.${ext}`;
      
      // Upload klasörünü oluştur
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'users'); // Banners için ayrı bir klasör de olabilir
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      // Dosyayı kaydet
      const filepath = join(uploadDir, filename);
      await writeFile(filepath, buffer);

      // URL'i oluştur
      coverImageUrl = `/uploads/users/${filename}`; // `/uploads/banners/${filename}` de olabilir
      console.log("Cover Image saved to:", coverImageUrl);
    } catch (error) {
      console.error("Resim yükleme hatası (Cover Image):", error);
      return { success: false, message: `Banner yüklenirken bir hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}` };
    }
  } else {
    console.log("No cover image file to upload or file is empty");
  }


  try {
    // Email değiştiriliyorsa ve farklı bir email ise, başka kullanıcıda kullanılıyor mu kontrol et
    if (email && email !== currentUser.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      
      if (existingUser && existingUser.id !== currentUser.id) {
        return { success: false, message: "Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor." };
      }
    }

    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name: fullName || name,
        email: email ? email.toLowerCase() : currentUser.email,
        role: role || currentUser.role,
        phone,
        bio,
        city,
        district,
        crops,
        certificates,
        website,
        addressDetail,
        image: imageUrl,
        coverImage: coverImageUrl, // Yeni: coverImage
      },
    });

    revalidatePath("/dashboard/settings"); // Ayarlar sayfasını güncelle
    revalidatePath("/dashboard/profil"); // Profil sayfasını güncelle
    revalidatePath("/dashboard/magaza"); // Mağaza ayarları sayfasını güncelle (yeni eklendi)
    revalidatePath(`/profil/${currentUser.id}`); // Herkese açık profil sayfasını güncelle

    return { success: true, message: "Profiliniz başarıyla güncellendi." };
  } catch (error: any) {
    console.error("Profil güncelleme hatası:", error);
    
    // Prisma unique constraint hatası
    if (error.code === 'P2002') {
      return { success: false, message: "Bu e-posta adresi zaten kullanılıyor." };
    }
    
    return { success: false, message: `Profil güncellenirken bir hata oluştu: ${error.message || 'Bilinmeyen hata'}` };
  }
}

export async function getUserProfile() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  // Return a subset of user data relevant for profile display
  const { id, name, email, image, phone, bio, city, district, crops, certificates, website, addressDetail, role, createdAt, updatedAt, coverImage } = currentUser;

  return { id, name, email, image, phone, bio, city, district, crops, certificates, website, addressDetail, role, createdAt, updatedAt, coverImage };
}