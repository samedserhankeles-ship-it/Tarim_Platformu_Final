
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const POST_CONTENTS = [
  "Bu yılki hasat beklediğimden çok daha verimli geçiyor! 🌾 #hasat2025",
  "Yeni aldığım traktörün yakıt performansı gerçekten inanılmaz. Tavsiye ederim.",
  "İyi tarım uygulamaları sayesinde ürün kalitemizi %30 artırdık. Sormak istediklerinizi yanıtlayabilirim.",
  "Sabahın ilk ışıklarıyla tarladayız. Çiftçinin mesaisi bitmez! 🚜",
  "Organik gübreleme sonuçlarını bugün aldık, toprak resmen canlandı.",
  "Sulama sistemindeki arızayı kendi imkanlarımızla çözdük, tecrübe her şeydir.",
  "Pazar fiyatları bu hafta biraz dengesiz, ürün bekleten var mı?",
  "Yerli tohumun gücü bir başka! Gelecek nesillere miras bırakıyoruz."
]

const COMMENTS = [
  "Harika görünüyor, ellerine sağlık!",
  "Bereketli olsun hemşehrim.",
  "Hangi marka traktör bu? Ben de değiştirmeyi düşünüyorum.",
  "Tebrikler, örnek bir çalışma olmuş.",
  "Bizim bölgede yağışlar kesti, sizde durumlar nasıl?",
  "Maşallah, Allah nazardan saklasın.",
  "Fiyatlar konusunda haklısın, biz de beklemeye karar verdik.",
  "Bu yöntemle verim almak gerçekten zor, ben başka bir yol denedim."
]

async function main() {
  console.log("Sosyal etkileşim simülasyonu başlatılıyor...")

  const users = await prisma.user.findMany()
  if (users.length < 2) {
    console.log("Yeterli kullanıcı bulunamadı. Lütfen önce birkaç hesap oluşturun.")
    return
  }

  // 1. Gönderileri Oluştur
  console.log("Gönderiler oluşturuluyor...")
  const posts = []
  for (const user of users) {
    const postCount = Math.floor(Math.random() * 3) + 1
    for (let i = 0; i < postCount; i++) {
      const post = await prisma.socialPost.create({
        data: {
          content: POST_CONTENTS[Math.floor(Math.random() * POST_CONTENTS.length)],
          userId: user.id,
          mediaType: "NONE"
        }
      })
      posts.push(post)
    }
  }

  // 2. Takipleşme
  console.log("Takipleşmeler oluşturuluyor...")
  for (const follower of users) {
    const targets = users.filter(u => u.id !== follower.id)
    const followCount = Math.floor(Math.random() * targets.length * 0.5) + 1
    
    const randomTargets = targets.sort(() => 0.5 - Math.random()).slice(0, followCount)
    
    for (const target of randomTargets) {
      await prisma.follow.upsert({
        where: {
          followerId_followingId: {
            followerId: follower.id,
            followingId: target.id
          }
        },
        create: {
          followerId: follower.id,
          followingId: target.id
        },
        update: {}
      })
    }
  }

  // 3. Beğeni ve Yorumlar
  console.log("Etkileşimler (Beğeni/Yorum) ekleniyor...")
  for (const post of posts) {
    const interactors = users.sort(() => 0.5 - Math.random()).slice(0, Math.floor(users.length * 0.7))
    
    for (const interactor of interactors) {
      // Beğeni (%60 şans)
      if (Math.random() > 0.4) {
        await prisma.like.upsert({
          where: {
            userId_postId: {
              userId: interactor.id,
              postId: post.id
            }
          },
          create: {
            userId: interactor.id,
            postId: post.id
          },
          update: {}
        })
      }

      // Yorum (%30 şans)
      if (Math.random() > 0.7) {
        await prisma.comment.create({
          data: {
            content: COMMENTS[Math.floor(Math.random() * COMMENTS.length)],
            userId: interactor.id,
            postId: post.id
          }
        })
      }
    }
  }

  console.log("Simülasyon başarıyla tamamlandı! Sosyal akış artık çok canlı.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
