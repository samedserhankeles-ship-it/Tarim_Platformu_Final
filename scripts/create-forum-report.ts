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

  // 2. Şikayet edilecek forum konusunu bul
  const topic = await prisma.forumTopic.findFirst()
  if (!topic) {
    console.log("❌ Forum konusu bulunamadı.");
    return;
  }

  // 3. Şikayet edilecek forum yorumunu bul
  const post = await prisma.forumPost.findFirst()
  if (!post) {
    console.log("❌ Forum yorumu bulunamadı.");
    // Yorum yoksa sadece konuyu şikayet edelim
  }

  console.log(`✅ Şikayet Eden: ${reporter.name} (${reporter.role})`);

  // 4. Konu Şikayeti Oluştur
  const topicReport = await prisma.report.create({
    data: {
      reporterId: reporter.id,
      reportedId: topic.authorId, // Konu sahibini şikayet ediyoruz
      reason: "Bu konu başlığı kurallara aykırı.",
      forumTopicId: topic.id,
      status: "PENDING"
    }
  });
  console.log(`📝 Konu şikayeti oluşturuldu. ID: ${topicReport.id}`);

  // 5. Yorum Şikayeti Oluştur (Varsa)
  if (post) {
    const postReport = await prisma.report.create({
      data: {
        reporterId: reporter.id,
        reportedId: post.authorId, // Yorum sahibini şikayet ediyoruz
        reason: "Bu yorum hakaret içeriyor.",
        forumPostId: post.id,
        status: "PENDING"
      }
    });
    console.log(`💬 Yorum şikayeti oluşturuldu. ID: ${postReport.id}`);
  }

  console.log("✨ Şikayetler başarıyla eklendi.");
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
