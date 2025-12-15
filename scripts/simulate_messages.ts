import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function simulateMessages() {
  const INTERACTION_COUNT = 1; // Kullanıcının belirlediği sayı

  try {
    console.log(`Rastgele ${INTERACTION_COUNT} ilana mesaj simülasyonu başlatılıyor...`);

    // 1. Aktif ürün ilanlarını bul (Sadece Product, çünkü az önce Product ekledik)
    const activeProducts = await prisma.product.findMany({
      where: { active: true },
      include: { user: true } // İlan sahibini de al
    });

    if (activeProducts.length === 0) {
      console.log("Hiç aktif ürün ilanı bulunamadı.");
      return;
    }

    // 2. Mesaj atacak kullanıcıları bul (Admin olmayanlar)
    const users = await prisma.user.findMany({
      where: { role: { not: "ADMIN" } },
    });

    if (users.length === 0) {
      console.log("Mesaj atacak kullanıcı (alıcı) bulunamadı. Lütfen önce test kullanıcıları oluşturun.");
      return;
    }

    console.log(`${activeProducts.length} aktif ilan ve ${users.length} potansiyel alıcı bulundu.`);

    let messagesSent = 0;
    const usedProductIds = new Set<string>();

    // 3. Rastgele etkileşimler oluştur
    for (let i = 0; i < INTERACTION_COUNT; i++) {
      // Rastgele bir ilan seç (daha önce seçilmemiş olsun)
      let randomProduct;
      let attempts = 0;
      do {
        const randomIndex = Math.floor(Math.random() * activeProducts.length);
        randomProduct = activeProducts[randomIndex];
        attempts++;
      } while (usedProductIds.has(randomProduct.id) && attempts < 10);

      if (!randomProduct) continue;
      usedProductIds.add(randomProduct.id);

      // Rastgele bir kullanıcı seç (ilan sahibi olmamalı)
      let senderUser;
      attempts = 0;
      do {
        const randomIndex = Math.floor(Math.random() * users.length);
        senderUser = users[randomIndex];
        attempts++;
      } while (senderUser.id === randomProduct.userId && attempts < 10);

      if (!senderUser) continue;

      // Mesaj içerikleri
      const messages = [
        "Merhaba, bu ürün hala satılık mı?",
        "Fiyatta pazarlık payı var mı?",
        "Ürünü yerinde görebilir miyim?",
        "Takas düşünüyor musunuz?",
        "Selamlar, son ne olur?",
        "Hangi şehirdesiniz, kargo yapıyor musunuz?"
      ];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      // 4. Sohbet ve Mesaj Oluştur
      // Önce konuşma var mı kontrol et
      let conversation = await prisma.conversation.findFirst({
        where: {
          OR: [
            { participant1Id: senderUser.id, participant2Id: randomProduct.userId },
            { participant1Id: randomProduct.userId, participant2Id: senderUser.id },
          ],
        },
      });

      // Yoksa oluştur
      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            participant1Id: senderUser.id,
            participant2Id: randomProduct.userId,
          },
        });
      }

      // Mesajı gönder
      await prisma.message.create({
        data: {
          content: `${randomMessage} (İlan: ${randomProduct.title})`,
          senderId: senderUser.id,
          conversationId: conversation.id,
          // receiverId opsiyonel ama şemada varsa ekleyebiliriz, conversation yetiyor genelde.
          // Şemaya baktım: receiverId var ve opsiyonel.
          receiverId: randomProduct.userId 
        },
      });

      console.log(`✅ Mesaj Atıldı: "${senderUser.email}" -> "${randomProduct.title}" (Sahibi: ${randomProduct.user.email})`);
      console.log(`   İçerik: "${randomMessage}"`);
      messagesSent++;
    }

    console.log(`
Toplam ${messagesSent} mesaj başarıyla simüle edildi.`);

  } catch (error) {
    console.error("Simülasyon sırasında hata:", error);
  } finally {
    await prisma.$disconnect();
  }
}

simulateMessages();
