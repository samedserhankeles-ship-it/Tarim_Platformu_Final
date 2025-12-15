import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function simulateAllUsersMessageAdmin() {
  try {
    console.log("TÜM test kullanıcıları admin ilanlarına mesaj atacak...");

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
      console.log("Mesaj atacak test kullanıcısı bulunamadı.");
      return;
    }

    console.log(`Toplam ${testUsers.length} test kullanıcısı bulundu. İşlem başlıyor...`);

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
      "İlan hala güncel mi?",
      "Merhaba, ciddi alıcıyım.",
      "Son oluru nedir?"
    ];

    let messagesSent = 0;

    // HER KULLANICI İÇİN DÖNGÜ
    for (const user of testUsers) {
      // Bu kullanıcı adminin bir ilanına rastgele mesaj atsın
      const randomListing = adminListings[Math.floor(Math.random() * adminListings.length)];
      const randomComment = comments[Math.floor(Math.random() * comments.length)];

      // Konuşma (Conversation) Bul veya Oluştur
      let conversation = await prisma.conversation.findFirst({
        where: {
          OR: [
            { participant1Id: user.id, participant2Id: adminUser.id },
            { participant1Id: adminUser.id, participant2Id: user.id },
          ],
        },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            participant1Id: user.id,
            participant2Id: adminUser.id,
          },
        });
      }

      // Mesajı Gönder
      await prisma.message.create({
        data: {
          content: `${randomComment} (İlan: ${randomListing.title})`,
          senderId: user.id,
          conversationId: conversation.id,
          receiverId: adminUser.id
        },
      });

      // BİLDİRİM GÖNDER
      await prisma.notification.create({
        data: {
          userId: adminUser.id,
          title: "Yeni İlan Mesajı",
          message: `${user.name || user.email} bir ilanınıza (${randomListing.title}) mesaj gönderdi.`,
          type: "INFO",
          link: `/dashboard/mesajlar?conv=${conversation.id}`,
        },
      });

      messagesSent++;
      // Konsolu çok şişirmemek için her 10 mesajda bir veya sadece işlem sonunda detay verebiliriz ama
      // kullanıcının görmesi için tek satırlık log atalım.
      // console.log(`.> ${user.email} -> ${randomListing.title}`);
    }

    console.log(`\n✅ İşlem Tamamlandı: Toplam ${messagesSent} kullanıcı admine mesaj attı.`);

  } catch (error) {
    console.error("Hata oluştu:", error);
  } finally {
    await prisma.$disconnect();
  }
}

simulateAllUsersMessageAdmin();
