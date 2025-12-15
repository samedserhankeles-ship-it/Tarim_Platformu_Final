import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addAdminListingsToFavorites() {
  try {
    // 1. Admin kullanıcısını bul
    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (!adminUser) {
      console.log("Admin kullanıcısı bulunamadı.");
      return;
    }

    // 2. Adminin tüm ilanlarını (JobPosting ve Product) bul
    const adminJobPostings = await prisma.jobPosting.findMany({
      where: { userId: adminUser.id },
    });
    const adminProducts = await prisma.product.findMany({
      where: { userId: adminUser.id },
    });

    const adminListings: { id: string; type: "job" | "product" }[] = [
      ...adminJobPostings.map((jp) => ({ id: jp.id, type: "job" as const })),
      ...adminProducts.map((p) => ({ id: p.id, type: "product" as const })),
    ];

    if (adminListings.length === 0) {
      console.log("Adminin hiç ilanı bulunamadı.");
      return;
    }

    // 3. Admin olmayan tüm kullanıcıları bul (test hesapları)
    const testUsers = await prisma.user.findMany({
      where: { role: { not: "ADMIN" } },
    });

    if (testUsers.length === 0) {
      console.log("Admin olmayan kullanıcı bulunamadı.");
      return;
    }

    console.log(`Adminin ${adminListings.length} ilanı bulundu.`);
    console.log(`${testUsers.length} test kullanıcısı bulundu.`);

    let favoritesAdded = 0;

    for (const user of testUsers) {
      for (const listing of adminListings) {
        try {
          // İlanı favorilere ekle (eğer zaten eklenmemişse)
          await prisma.favorite.upsert({
            where: {
              userId_productId: listing.type === "product" ? { userId: user.id, productId: listing.id } : undefined,
              userId_jobPostingId: listing.type === "job" ? { userId: user.id, jobPostingId: listing.id } : undefined,
              // userId_groupId:  // Eğer group'a eklemek istersek bu da eklenebilir
            },
            update: {}, // Güncellenecek bir şey yoksa boş bırakılabilir
            create: {
              userId: user.id,
              productId: listing.type === "product" ? listing.id : null,
              jobPostingId: listing.type === "job" ? listing.id : null,
            },
          });
          favoritesAdded++;
        } catch (e: any) {
          // Unique constraint hatası olabilir, bu durumda zaten eklenmiş demektir.
          if (e.code === 'P2002') {
              // console.log(`İlan ${listing.id} zaten ${user.email} tarafından favorilenmiş.`);
          } else {
              console.error(`Favori eklenirken hata oluştu ${user.email} için ilan ${listing.id}:`, e);
          }
        }
      }
    }

    console.log(`${favoritesAdded} favori girişi eklendi/güncellendi.`);
  } catch (error) {
    console.error("Script çalıştırılırken hata oluştu:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addAdminListingsToFavorites();
