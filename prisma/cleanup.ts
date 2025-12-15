import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupTestData() {
  console.log("Test verilerini temizleme işlemi başlatılıyor...");

  try {
    // Önce ilişkili verileri sil
    await prisma.message.deleteMany({});
    console.log("Mesajlar silindi.");

    await prisma.conversation.deleteMany({});
    console.log("Sohbetler silindi.");
    
    await prisma.notification.deleteMany({});
    console.log("Bildirimler silindi.");

    await prisma.report.deleteMany({});
    console.log("Şikayetler silindi.");

    await prisma.announcement.deleteMany({});
    console.log("Duyurular silindi.");

    await prisma.favorite.deleteMany({});
    console.log("Favoriler silindi.");

    // İlanları sil
    await prisma.product.deleteMany({});
    console.log("Ürün ilanları silindi.");

    await prisma.jobPosting.deleteMany({});
    console.log("İş ilanları silindi.");

    // Test kullanıcılarını ve demo kullanıcıyı sil
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: { startsWith: 'testuser' } }, // testuser@example.com
          { email: 'demo@tarim.com' },          // demo@tarim.com
        ],
        NOT: { email: 'admin@tarim.com' }, // Admin hesabını silme
      },
    });
    console.log("Test kullanıcıları ve demo kullanıcı silindi.");

    console.log("✅ Tüm test verileri başarıyla temizlendi.");
  } catch (error) {
    console.error("Test verileri temizlenirken bir hata oluştu:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupTestData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
