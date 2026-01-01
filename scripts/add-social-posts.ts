import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. İki rastgele kullanıcı bul (Admin olmayan)
  const users = await prisma.user.findMany({
    where: {
      role: { not: 'ADMIN' }
    },
    take: 2
  })

  if (users.length < 2) {
    console.log("❌ Yeterli kullanıcı bulunamadı.");
    return;
  }

  const user1 = users[0];
  const user2 = users[1];

  console.log(`✅ Kullanıcı 1: ${user1.name}`);
  console.log(`✅ Kullanıcı 2: ${user2.name}`);

  // 2. Fotoğraflı Gönderi (Kullanıcı 1)
  await prisma.socialPost.create({
    data: {
      userId: user1.id,
      content: "Bugün tarlada hasat zamanı! Bereketli olsun inşallah. 🌾🚜",
      media: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80",
      mediaType: "IMAGE",
      createdAt: new Date()
    }
  });
  console.log(`📸 ${user1.name} fotoğraflı gönderi paylaştı.`);

  // 3. Videolu Gönderi (Kullanıcı 2)
  await prisma.socialPost.create({
    data: {
      userId: user2.id,
      content: "Yeni traktörümüzün performansı harika. Herkese tavsiye ederim. #tarım #teknoloji",
      media: "https://videos.pexels.com/video-files/2883652/2883652-sd_640_360_24fps.mp4", // Örnek video linki
      mediaType: "VIDEO",
      createdAt: new Date(Date.now() - 1000 * 60 * 60) // 1 saat önce
    }
  });
  console.log(`🎥 ${user2.name} videolu gönderi paylaştı.`);

  console.log("✨ Gönderiler başarıyla eklendi.");
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
