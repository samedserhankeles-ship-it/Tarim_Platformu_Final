import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function sendDemoMessage() {
  console.log("Admin ve Demo Çiftçi arasında mesaj gönderme işlemi başlatılıyor...");

  // 1. Admin kullanıcısını bul
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@tarim.com' },
  });

  if (!adminUser) {
    console.error("Hata: admin@tarim.com kullanıcısı bulunamadı. Lütfen önce admin hesabının oluşturulduğundan emin olun.");
    return;
  }

  // 2. Demo Çiftçi kullanıcısını bul
  const demoUser = await prisma.user.findUnique({
    where: { email: 'demo@tarim.com' },
  });

  if (!demoUser) {
    console.error("Hata: demo@tarim.com kullanıcısı bulunamadı. Lütfen önce demo kullanıcısının oluşturulduğundan emin olun (seed script çalıştırıldı mı?).");
    return;
  }

  // Kendine mesaj göndermeyi engelle
  if (adminUser.id === demoUser.id) {
    console.error("Hata: Admin ve Demo kullanıcısının ID'leri aynı. Mesaj gönderilemez.");
    return;
  }

  // 3. İkisi arasındaki sohbeti bul veya oluştur
  let conversation = await prisma.conversation.findFirst({
    where: {
      OR: [
        { participant1Id: demoUser.id, participant2Id: adminUser.id },
        { participant1Id: adminUser.id, participant2Id: demoUser.id },
      ],
    },
  });

  if (!conversation) {
    console.log("Yeni sohbet oluşturuluyor...");
    conversation = await prisma.conversation.create({
      data: {
        participant1Id: demoUser.id,
        participant2Id: adminUser.id,
      },
    });
  } else {
    console.log("Mevcut sohbet bulundu.");
  }

  // 4. Demo Çiftçiden Admin'e mesaj gönder
  const messageContent = `Merhaba ${adminUser.name || 'Admin'}, ben ${demoUser.name || 'Demo Çiftçi'}. Platformunuz hakkında bir sorum olacaktı.`;
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: demoUser.id,
      receiverId: adminUser.id, // Notification için receiverId
      content: messageContent,
    },
  });
  
  // 5. Admin için bildirim oluştur (eğer bu özellik aktifse)
  // Bu kısım normalde sendMessageAction içinde otomatik yapılır. 
  // Ancak bu script tek seferlik çalıştığı için manuel ekliyoruz.
  await prisma.notification.create({
    data: {
      userId: adminUser.id,
      title: "Yeni Mesaj",
      message: `${demoUser.name || 'Demo Çiftçi'} size bir mesaj gönderdi.`,
      link: `/dashboard/mesajlar?conv=${conversation.id}`,
      type: "INFO",
    },
  });


  console.log(`✅ Mesaj başarıyla gönderildi ve Admin için bildirim oluşturuldu.`);
}

sendDemoMessage()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });