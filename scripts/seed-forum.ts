
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Forum canlandırma işlemi başlatılıyor...")

  // 1. Kullanıcıları Hazırla
  const userEmails = [
    "admin@tarim.com",
    "samedserhankeles@hotmail.com",
    "ahmet.ciftci@gmail.com",
    "mehmet.isletme@outlook.com",
    "can.operator@gmail.com"
  ]

  const users: any = {}
  for (const email of userEmails) {
    let user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: email.split("@")[0].replace(".", " ").toUpperCase(),
          role: email.includes("ciftci") ? "FARMER" : email.includes("isletme") ? "BUSINESS" : "OPERATOR",
          password: "password123"
        }
      })
    }
    users[email] = user
  }

  // 2. Konular ve Yanıtlar Verisi
  const forumData = [
    {
      title: "Buğday ekimi için en ideal zaman nedir?",
      content: "Selamlar, İç Anadolu bölgesinde bu yıl yağışlar biraz geç kaldı. Sizce ekim için Kasım ortasını beklemeli miyim yoksa şimdi mi başlamalıyım?",
      category: "TARIM",
      author: users["ahmet.ciftci@gmail.com"],
      replies: [
        { author: users["admin@tarim.com"], content: "Ahmet Bey, meteoroloji verilerine göre bu yıl Kasım ayı ilk yarısı kurak geçecek gibi duruyor. Beklemekte fayda var." },
        { author: users["samedserhankeles@hotmail.com"], content: "Ben geçen hafta ektim, hafif bir yağış aldık ama riskli bir durum. Toprak tavını beklemek en doğrusu." },
        { author: users["can.operator@gmail.com"], content: "Ekipman hazırlıklarını tamamladıysanız, ay ortası yağış beklentisiyle girmek mantıklı olabilir." }
      ]
    },
    {
      title: "Yeni nesil traktörlerde yakıt tasarrufu ipuçları",
      content: "Arkadaşlar son model traktörlerde devir ayarını nasıl kullanıyorsunuz? Yakıt maliyetleri çok arttı, tecrübelerinizi paylaşır mısınız?",
      category: "TEKNOLOJİ",
      author: users["can.operator@gmail.com"],
      replies: [
        { author: users["mehmet.isletme@outlook.com"], content: "Eco-PTO modunu mutlaka aktif edin. Devri 1500-1600 civarında tutunca %15'e yakın tasarruf sağlıyoruz." },
        { author: users["ahmet.ciftci@gmail.com"], content: "Lastik basınçları da çok önemli. Toprağın sertliğine göre basıncı ayarlamak çekişi ve yakıtı etkiliyor." }
      ]
    },
    {
      title: "Ürünlerimizi doğrudan tüketiciye satmak için hangi platformları kullanıyorsunuz?",
      content: "Aracıları aradan çıkarıp doğrudan pazara inmek istiyorum. İstanbul ve Ankara pazarlarına sevkiyat yapan var mı?",
      category: "PAZARLAMA",
      author: users["mehmet.isletme@outlook.com"],
      replies: [
        { author: users["admin@tarim.com"], content: "Mehmet Bey, platformumuzun Market bölümünü denediniz mi? Burada doğrudan ilan vererek alıcılara ulaşabilirsiniz." },
        { author: users["samedserhankeles@hotmail.com"], content: "Sosyal medya üzerinden toplu sipariş alıp soğuk zincir araçlarla haftalık dağıtım yapmak en karlı yöntem şu an." }
      ]
    }
  ]

  // 3. Verileri Kaydet
  for (const item of forumData) {
    const topic = await prisma.forumTopic.create({
      data: {
        title: item.title,
        content: item.content,
        category: item.category,
        authorId: item.author.id,
        views: Math.floor(Math.random() * 100) + 20 // Rastgele görüntülenme
      }
    })

    for (const reply of item.replies) {
      await prisma.forumPost.create({
        data: {
          content: reply.content,
          topicId: topic.id,
          authorId: reply.author.id
        }
      })
    }
    console.log(`Konu ve yanıtlar eklendi: ${item.title}`)
  }

  console.log("Forum canlandırma tamamlandı!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
