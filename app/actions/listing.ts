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

  // Benzersiz dosya adı oluştur
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  // Dosya adındaki Türkçe karakterleri ve boşlukları temizle
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, ""); 
  const filename = `${uniqueSuffix}-${sanitizedName}`;
  
  // public/uploads klasörüne kaydet
  const uploadDir = join(process.cwd(), "public", "uploads");
  
  // Klasör yoksa oluştur
  await mkdir(uploadDir, { recursive: true });
  
  const path = join(uploadDir, filename);
  await writeFile(path, buffer);
  
  return `/uploads/${filename}`;
}

export async function fetchAllListingsAction(query: string): Promise<ListingData[]> {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    redirect("/"); // Redirect non-admins
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

  const type = formData.get("type") as string; 
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const city = formData.get("city") as string;
  const district = formData.get("district") as string;
  const contactPhone = formData.get("contactPhone") as string;
  const images = formData.getAll("images"); 

  // Gerçek resim yükleme işlemi
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
          contactPhone,
          wage,
          currency,
          workType,
          images: imagesString,
          userId: currentUser.id,
          active: true, 
        },
      });
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
          contactPhone,
          price,
          currency,
          category,
          image: imageUrls.length > 0 ? imageUrls[0] : "", // İlk resmi ana görsel yap
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

    redirect("/dashboard/ilanlarim"); // İlanlarım sayfasına yönlendir

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

  const id = formData.get("id") as string;
  const type = formData.get("type") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const city = formData.get("city") as string;
  const district = formData.get("district") as string;
  const contactPhone = formData.get("contactPhone") as string;
  
  // 1. Yeni yüklenen resimleri al ve kaydet
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

  // 2. Mevcut resimleri al (hidden inputlardan)
  const existingImages = formData.getAll("existingImages") as string[];

  // 3. Tüm resimleri birleştir
  const allImages = [...existingImages, ...newImageUrls];
  const imagesString = allImages.join(",");

  try {
    if (type === "job") {
      const wage = parseFloat(formData.get("wage") as string);
      const currency = formData.get("currency") as string || "TRY";
      const workType = formData.get("workType") as string;
      // const active = formData.get("active") === "on"; // Aktif durumu buradan güncellenmeyebilir, şimdilik dokunmayalım veya hidden input varsa alalım

      await prisma.jobPosting.update({
        where: { id: id, userId: currentUser.id }, 
        data: {
          title,
          description,
          city,
          district,
          contactPhone,
          wage,
          currency,
          workType,
          images: imagesString,
          // active, 
        },
      });
    } else if (type === "product") {
      const price = parseFloat(formData.get("price") as string);
      const currency = formData.get("currency") as string || "TRY";
      const category = (formData.get("category") as string) || ""; 
      // const active = formData.get("active") === "on";

      await prisma.product.update({
        where: { id: id, userId: currentUser.id }, 
        data: {
          title,
          description,
          city,
          district,
          contactPhone,
          price,
          currency,
          category,
          image: allImages.length > 0 ? allImages[0] : "", // İlk resmi ana görsel yap
          images: imagesString,
          // active,
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