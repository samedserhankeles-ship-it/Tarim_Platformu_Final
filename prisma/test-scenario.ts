import { PrismaClient } from '@prisma/client';
import { turkeyLocations } from '../lib/locations'; // Assuming lib/locations.ts is in project root or adapted path

const prisma = new PrismaClient();

async function runTestScenario() {
  console.log("Test senaryosu başlatılıyor...");

  // Mevcut test kullanıcılarını ve demo kullanıcıyı al (admin hariç)
  const allUsers = await prisma.user.findMany({
    where: {
      OR: [
        { email: { startsWith: 'testuser' } },
        { email: 'demo@tarim.com' },
      ],
      NOT: { email: 'admin@tarim.com' },
    },
    select: { id: true, name: true, email: true, role: true, city: true, district: true },
  });

  if (allUsers.length === 0) {
    console.error("Hata: Test kullanıcısı bulunamadı. Lütfen önce 'create-test-users.ts' scriptini çalıştırın.");
    return;
  }

  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@tarim.com' } });
  if (!adminUser) {
      console.error("Hata: Admin kullanıcısı bulunamadı.");
      return;
  }


  // --- İlan Oluşturma ---
  console.log("\n--- İlan Oluşturuluyor (Her kullanıcı 3 ilan) ---");
  const productsToCreate = [];
  const jobsToCreate = [];
  const spamListings = []; // Şikayet edilecek ilanları tutar

  const sampleTitles = [
    "Satılık Traktör", "Organik Sebzeler", "Mevsimlik İşçi", "Tarım Aletleri", "Süt İneği",
    "Fidan Satışı", "Çiftlik Elemanı Aranıyor", "Gübre Satışı", "Hasat Makinesi", "Arsa Kiralama"
  ];
  const sampleDescriptions = [
    "Temiz ve bakımlı, az kullanılmış.", "Yerli üretim, doğal ve taze.", "Deneyimli ve güvenilir ekip.",
    "Uygun fiyatlı, kaliteli malzeme.", "Yüksek verimli, sağlıklı hayvanlar.", "Çeşitli türlerde fidanlar."
  ];

  let spamCount = 0;
  for (const user of allUsers) {
    for (let i = 0; i < 3; i++) {
      const isProduct = Math.random() > 0.5;
      const isSpam = spamCount < 10 && Math.random() > 0.8; // İlk 10 spam ilanı rastgele oluştur

      const randomTitle = sampleTitles[Math.floor(Math.random() * sampleTitles.length)];
      const randomDesc = isSpam ? `[SPAM] BU İLAN KURALLARA AYKIRIDIR! ${sampleDescriptions[Math.floor(Math.random() * sampleDescriptions.length)]}` : sampleDescriptions[Math.floor(Math.random() * sampleDescriptions.length)];
      
      const randomLocation = turkeyLocations[Math.floor(Math.random() * turkeyLocations.length)];
      const city = user.city || randomLocation.city;
      const district = user.district || randomLocation.districts[Math.floor(Math.random() * randomLocation.districts.length)];

      if (isProduct) {
        const productData = {
          title: `${isSpam ? '[SPAM] ' : ''}${randomTitle} - ${city}`,
          description: randomDesc,
          price: Math.floor(Math.random() * 100000) + 100, // 100-100100 TL
          currency: "TRY",
          category: ["tahil", "sebze", "hayvan", "ekipman"][Math.floor(Math.random() * 4)],
          city: city,
          district: district,
          image: `https://picsum.photos/seed/${user.id}-${i}/600/400`,
          userId: user.id,
          active: true,
        };
        const product = await prisma.product.create({ data: productData });
        if (isSpam) spamListings.push({ ...product, type: 'product' });
      } else {
        const jobData = {
          title: `${isSpam ? '[SPAM] ' : ''}${randomTitle} İş İlanı - ${city}`,
          description: randomDesc,
          wage: Math.floor(Math.random() * 5000) + 1000, // 1000-6000 TL
          workType: ["Tam Zamanlı", "Yarı Zamanlı", "Mevsimlik"][Math.floor(Math.random() * 3)],
          city: city,
          district: district,
          userId: user.id,
          active: true,
          images: `https://picsum.photos/seed/${user.id}-${i}/600/400`,
        };
        const job = await prisma.jobPosting.create({ data: jobData });
        if (isSpam) spamListings.push({ ...job, type: 'job' });
      }
      if (isSpam) spamCount++;
    }
  }
  console.log(`Toplam ${allUsers.length * 3} ilan oluşturuldu. ${spamListings.length} tanesi spam olarak işaretlendi.`);


  // --- Kullanıcı Etkileşimi (Mesajlaşma) ---
  console.log("\n--- Kullanıcılar Arasında Mesajlaşma Oluşturuluyor ---");
  for (let i = 0; i < allUsers.length; i++) {
    const sender = allUsers[i];
    let receiver;
    do {
      receiver = allUsers[Math.floor(Math.random() * allUsers.length)];
    } while (receiver.id === sender.id); // Kendine mesaj atmasını engelle

    // Sohbeti bul veya oluştur
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { participant1Id: sender.id, participant2Id: receiver.id },
          { participant1Id: receiver.id, participant2Id: sender.id },
        ],
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { participant1Id: sender.id, participant2Id: receiver.id },
      });
    }

    // Mesaj gönder
    const messageContent = `Merhaba ${receiver.name || receiver.email}, nasılsınız?`;
    await prisma.message.create({
      data: {
        content: messageContent,
        senderId: sender.id,
        receiverId: receiver.id,
        conversationId: conversation.id,
      },
    });

    // Alıcıya bildirim gönder (sendBulkMessageAction'daki mantığa benzer)
    await prisma.notification.create({
        data: {
            userId: receiver.id,
            title: "Yeni Mesaj",
            message: `${sender.name || 'Bilinmeyen Kullanıcı'} size bir mesaj gönderdi.`,
            link: `/dashboard/mesajlar?conv=${conversation.id}`,
            type: "INFO",
        },
    });
  }
  console.log(`${allUsers.length} test kullanıcısı arasında mesajlaşmalar oluşturuldu.`);


  // --- Spam İlanların Şikayet Edilmesi ---
  console.log("\n--- Spam İlanlar Şikayet Ediliyor ---");
  for (const spamListing of spamListings) {
    let reporter;
    do {
      reporter = allUsers[Math.floor(Math.random() * allUsers.length)];
    } while (reporter.id === spamListing.userId); // Kendi ilanını şikayet etmesini engelle

    const reportedUser = await prisma.user.findUnique({ where: { id: spamListing.userId } });

    if (reportedUser) {
        await prisma.report.create({
            data: {
                reporterId: reporter.id,
                reportedId: reportedUser.id,
                reason: `Otomatik oluşturulmuş spam ilan: "${spamListing.title}"`, // Corrected escaping for inner quotes
                status: "PENDING",
            },
        });
        console.log(`Kullanıcı ${reporter.name || reporter.email} tarafından "${spamListing.title}" ilanı şikayet edildi.`);
    }
  }
  console.log(`${spamListings.length} spam ilan şikayet edildi.`);

  console.log("\n✅ Test senaryosu başarıyla tamamlandı.");
}

runTestScenario()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
