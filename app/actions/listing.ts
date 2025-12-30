"use server";

import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

interface ListingData {
  id: string;
  type: "product" | "job";
  title: string;
  description: string;
  user: {
    name: string | null;
    email: string;
  };
  createdAt: Date;
  active: boolean;
}

// Dosya yükleme yardımcısı
async function saveFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, ""); 
  const filename = `${uniqueSuffix}-${sanitizedName}`;
  
  const uploadDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  
  const path = join(uploadDir, filename);
  await writeFile(path, buffer);
  
  return `/uploads/${filename}`;
}

export async function fetchAllListingsAction(query: string): Promise<ListingData[]> {
  const currentUser = await getCurrentUser();

  // Admin kontrolü kaldırıldı veya isteğe bağlı hale getirilebilir. 
  // Şimdilik sadece adminlerin tüm ilanları çekmesi için kullanılıyorsa kalsın.
  if (!currentUser || currentUser.role !== "ADMIN") {
    // redirect("/"); // Redirect non-admins - KULLANICI ISTEGI: Banlı kullanıcılar da bakabilsin.
    // İlanları listelemek herkese açık olmalı veya banlılar da görebilmeli.
    // Ancak bu fonksiyon 'fetchAllListingsAction' muhtemelen admin panelinde kullanılıyor.
    // Normal kullanıcılar için 'fetchListings' gibi başka bir fonksiyon olmalı.
    // Eğer bu admin fonksiyonu ise, banlı kullanıcı zaten admin paneline girememeli (yetkisi yoksa).
    // Admin rolündeki bir kullanıcı banlanırsa ne olur? Adminlik yetkisi devam eder mi?
    // Mantıken banlanan admin işlem yapamaz.
    // Burada admin kontrolü kalsın.
    if (!currentUser || currentUser.role !== "ADMIN") {
       redirect("/");
    }
  }

  const whereClause: any = {};
  if (query) {
    whereClause.OR = [
      { title: { contains: query } },
      { description: { contains: query } },
      { user: { name: { contains: query } } },
      { user: { email: { contains: query } } },
    ];
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
      active: true,
      user: {
        select: { name: true, email: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const jobs = await prisma.jobPosting.findMany({
    where: whereClause,
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
      active: true,
      user: {
        select: { name: true, email: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const allListings: ListingData[] = [
    ...products.map(p => ({ ...p, type: "product" as const })),
    ...jobs.map(j => ({ ...j, type: "job" as const })),
  ];

  return allListings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function createListingAction(formData: FormData) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/sign-in"); 
  }

  // BAN KONTROLÜ
  if (currentUser.isBanned && currentUser.bannedUntil && new Date(currentUser.bannedUntil) > new Date()) {
    // throw new Error("Hesabınız yasaklandığı için ilan oluşturamazsınız.");
    // Server action'da error fırlatmak yerine {success: false} dönmek daha iyi olabilir ama
    // mevcut yapı try-catch ile error bekliyor olabilir.
    // Edit form error'u toast ile gösteriyordu.
    throw new Error("Hesabınız yasaklandığı için ilan oluşturamazsınız.");
  }

  const type = formData.get("type") as string; 
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const city = formData.get("city") as string;
  const district = formData.get("district") as string;
  const village = formData.get("village") as string;
  const contactPhone = formData.get("contactPhone") as string;
  const images = formData.getAll("images"); 

  const imageUrls: string[] = [];
  for (const file of images) {
    if (file instanceof File && file.size > 0) {
      try {
        const url = await saveFile(file);
        imageUrls.push(url);
      } catch (error) {
        console.error("Resim yükleme hatası:", error);
      }
    }
  }
  
  const imagesString = imageUrls.join(",");

  try {
    if (type === "job") {
      const wage = parseFloat(formData.get("wage") as string);
      const currency = formData.get("currency") as string || "TRY";
      const workType = formData.get("workType") as string;

      await prisma.jobPosting.create({
                data: {
                  title,
                  description,
                  city,
                  district,
                  village,
                  contactPhone,
                  wage,
                  currency,
                  workType,
                  images: imagesString,
                  userId: currentUser.id,
                  active: true,
                },      });
    } else if (type === "product") {
      const price = parseFloat(formData.get("price") as string);
      const currency = formData.get("currency") as string || "TRY";
      const category = (formData.get("category") as string) || ""; 

      await prisma.product.create({
        data: {
          title,
          description,
          city,
          district,
          village,
          contactPhone,
          price,
          currency,
          category,
          image: imageUrls.length > 0 ? imageUrls[0] : "", 
          images: imagesString,
          userId: currentUser.id,
          active: true, 
        },
      });
    } else {
      throw new Error("Geçersiz ilan türü belirtildi.");
    }

    revalidatePath("/dashboard"); 
    revalidatePath("/explore"); 

    redirect("/dashboard/ilanlarim"); 

  } catch (error) {
    console.error("İlan oluşturulurken hata oluştu:", error);
    throw error; 
  }
}

export async function updateListingAction(formData: FormData) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/sign-in");
  }

  // BAN KONTROLÜ
  if (currentUser.isBanned && currentUser.bannedUntil && new Date(currentUser.bannedUntil) > new Date()) {
    throw new Error("Hesabınız yasaklandığı için ilanı güncelleyemezsiniz.");
  }

  const id = formData.get("id") as string;
  const type = formData.get("type") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const city = formData.get("city") as string;
  const district = formData.get("district") as string;
  const village = formData.get("village") as string;
  const contactPhone = formData.get("contactPhone") as string;
  
  const newImageFiles = formData.getAll("images"); 
  const newImageUrls: string[] = [];
  for (const file of newImageFiles) {
    if (file instanceof File && file.size > 0) {
      try {
        const url = await saveFile(file);
        newImageUrls.push(url);
      } catch (error) {
        console.error("Resim yükleme hatası:", error);
      }
    }
  }

  const existingImages = formData.getAll("existingImages") as string[];
  const allImages = [...existingImages, ...newImageUrls];
  const imagesString = allImages.join(",");

  try {
    if (type === "job") {
      const wage = parseFloat(formData.get("wage") as string);
      const currency = formData.get("currency") as string || "TRY";
      const workType = formData.get("workType") as string;

      await prisma.jobPosting.update({
        where: { id: id, userId: currentUser.id }, 
        data: {
          title,
          description,
          city,
          district,
          village,
          contactPhone,
          wage,
          currency,
          workType,
          images: imagesString,
        },
      });
    } else if (type === "product") {
      const price = parseFloat(formData.get("price") as string);
      const currency = formData.get("currency") as string || "TRY";
      const category = (formData.get("category") as string) || ""; 

      await prisma.product.update({
        where: { id: id, userId: currentUser.id }, 
        data: {
          title,
          description,
          city,
          district,
          village,
          contactPhone,
          price,
          currency,
          category,
          image: allImages.length > 0 ? allImages[0] : "", 
          images: imagesString,
        },
      });
    } else {
      throw new Error("Geçersiz ilan türü belirtildi.");
    }

    revalidatePath("/dashboard");
    revalidatePath("/explore");
    revalidatePath(`/dashboard/ilanlarim`); 
    revalidatePath(`/ilan/${type}-${id}`); 

    redirect("/dashboard/ilanlarim"); 

  } catch (error) {
    console.error("İlan güncellenirken hata oluştu:", error);
    throw error;
  }
}
