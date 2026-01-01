import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. Şikayet edecek kullanıcıyı bul (Admin)
  const reporter = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  if (!reporter) {
    console.log("❌ Admin kullanıcısı bulunamadı.");
    return;
  }

  // 2. Rastgele bir kullanıcı bul (Şikayet edilecek kişi)
  const reportedUser = await prisma.user.findFirst({
    where: { NOT: { id: reporter.id } }
  })

  if (!reportedUser) {
    console.log("❌ Şikayet edilecek kullanıcı bulunamadı.");
    return;
  }

  console.log(`✅ Şikayet Eden: ${reporter.name}`);
  console.log(`✅ Şikayet Edilen: ${reportedUser.name}`);

  // --- 1. İLAN ŞİKAYETİ (Product) ---
  const product = await prisma.product.findFirst();
  if (product) {
    await prisma.report.create({
      data: {
        reporterId: reporter.id,
        reportedId: product.userId,
        productId: product.id,
        reason: "Ürün görseli yanıltıcı ve fiyat bilgisi hatalı.",
        status: "PENDING"
      }
    });
    console.log("📦 İlan (Ürün) şikayeti oluşturuldu.");
  }

  // --- 2. SOSYAL ŞİKAYETİ ---
  const socialPost = await prisma.socialPost.findFirst();
  if (socialPost) {
    await prisma.report.create({
      data: {
        reporterId: reporter.id,
        reportedId: socialPost.userId,
        socialPostId: socialPost.id,
        reason: "Bu gönderi topluluk kurallarını ihlal ediyor.",
        status: "PENDING"
      }
    });
    console.log("📱 Sosyal Medya şikayeti oluşturuldu.");
  }

  // --- 3. FORUM ŞİKAYETİ (Topic) ---
  const forumTopic = await prisma.forumTopic.findFirst();
  if (forumTopic) {
    await prisma.report.create({
      data: {
        reporterId: reporter.id,
        reportedId: forumTopic.authorId,
        forumTopicId: forumTopic.id,
        reason: "Konu başlığı spam içeriyor.",
        status: "PENDING"
      }
    });
    console.log("💬 Forum (Konu) şikayeti oluşturuldu.");
  }

  // --- 4. PROFIL ŞİKAYETİ ---
  await prisma.report.create({
    data: {
      reporterId: reporter.id,
      reportedId: reportedUser.id,
      reason: "Kullanıcı profilinde uygunsuz ifadeler var.",
      status: "PENDING"
    }
  });
  console.log("👤 Profil şikayeti oluşturuldu.");

  console.log("✨ Tüm kategorilerde şikayetler başarıyla eklendi.");
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
