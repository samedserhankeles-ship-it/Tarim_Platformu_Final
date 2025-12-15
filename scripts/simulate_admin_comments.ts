import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function simulateAdminComments() {
  const INTERACTION_COUNT = 1; // Kaç tane yorum/mesaj atılsın?

  try {
    console.log(`Admin ilanlarına ${INTERACTION_COUNT} adet rastgele mesaj (yorum simülasyonu) gönderiliyor...`);

    // 1. Admin kullanıcısını bul
    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (!adminUser) {
      console.log("Admin kullanıcısı bulunamadı.");
      return;
    }

    // 2. Adminin ilanlarını (JobPosting ve Product) bul
    const adminProducts = await prisma.product.findMany({ where: { userId: adminUser.id, active: true } });
    const adminJobPostings = await prisma.jobPosting.findMany({ where: { userId: adminUser.id, active: true } });

    const adminListings = [
      ...adminProducts.map((p) => ({ ...p, type: "Ürün" })),
      ...adminJobPostings.map((j) => ({ ...j, type: "İş İlanı" })),
    ];

    if (adminListings.length === 0) {
      console.log("Adminin aktif ilanı bulunamadı.");
      return;
    }

    // 3. Test kullanıcılarını bul (Admin olmayanlar)
    const testUsers = await prisma.user.findMany({
      where: { role: { not: "ADMIN" } },
    });

    if (testUsers.length === 0) {
      console.log("Yorum yapacak test kullanıcısı bulunamadı.");
      return;
    }

    // Rastgele yorum içerikleri
    const comments = [
      "Hocam fiyat son ne olur?",
      "Yeriniz tam olarak nerede?",
      "Hayırlı satışlar.",
      "Ürün garantili mi?",
      "Takas düşünüyor musunuz?",
      "Detaylı bilgi alabilir miyim?",
      "Telefon numaranızdan ulaşamadım, dönüş yapar mısınız?",
      "Toplu alımda indirim var mı?",
      "Kargo ücreti kime ait?",
      "İlan hala güncel mi?"
    ];

    let messagesSent = 0;

    for (let i = 0; i < INTERACTION_COUNT; i++) {
      // Rastgele İlan Seç
      const randomListing = adminListings[Math.floor(Math.random() * adminListings.length)];
      
      // Rastgele Kullanıcı Seç
      const randomUser = testUsers[Math.floor(Math.random() * testUsers.length)];

      // Yorum/Mesaj Seç
      const randomComment = comments[Math.floor(Math.random() * comments.length)];

      // Konuşma (Conversation) Bul veya Oluştur
      let conversation = await prisma.conversation.findFirst({
        where: {
          OR: [
            { participant1Id: randomUser.id, participant2Id: adminUser.id },
            { participant1Id: adminUser.id, participant2Id: randomUser.id },
          ],
        },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            participant1Id: randomUser.id,
            participant2Id: adminUser.id,
          },
        });
      }

      // Mesajı Gönder
      await prisma.message.create({
        data: {
          content: `${randomComment} (İlan: ${randomListing.title})`, // Hangi ilana yapıldığı belli olsun
          senderId: randomUser.id,
          conversationId: conversation.id,
          receiverId: adminUser.id
        },
      });

      // BİLDİRİM GÖNDER (YENİ)
      await prisma.notification.create({
        data: {
          userId: adminUser.id,
          title: "Yeni İlan Yorumu/Mesajı",
          message: `${randomUser.name || randomUser.email} sizin ilanınıza (${randomListing.title}) mesaj gönderdi.`,
          type: "INFO",
          link: `/dashboard/mesajlar?conv=${conversation.id}`,
        },
      });

      console.log(`✅ [${randomListing.type}] "${randomListing.title}" ilanına yorum geldi:`); 
      console.log(`   Kimden: ${randomUser.email}`);
      console.log(`   Yorum: "${randomComment}"`);
      messagesSent++;
    }

    console.log(`
Toplam ${messagesSent} adet yorum/mesaj başarıyla simüle edildi.`);

  } catch (error) {
    console.error("Hata oluştu:", error);
  } finally {
    await prisma.$disconnect();
  }
}

simulateAdminComments();
