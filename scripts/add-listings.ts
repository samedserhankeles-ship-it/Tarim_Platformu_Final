
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const email = "samedserhankeles@hotmail.com"
  
  let user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    console.log("Kullanıcı bulunamadı, oluşturuluyor...")
    // Şifre hashlemesi yapılmadan demo amaçlı oluşturuluyor (Login'de sorun olabilir ama veri eklemek için yeterli)
    // Gerçek senaryoda auth flow'dan geçmeli
    user = await prisma.user.create({
      data: {
        email,
        name: "Samed Serhan Keleş",
        role: "FARMER",
        password: "password123", // Demo şifre (bcrypt ile hashlenmemiş)
      },
    })
  }

  console.log(`Kullanıcı ID: ${user.id}`)

  // 1. İlan: Ürün (Satılık Buğday)
  await prisma.product.create({
    data: {
      userId: user.id,
      title: "Sahibinden Satılık 10 Ton Ekmeklik Buğday",
      description: "Bu yılın mahsulü, temiz, elenmiş ekmeklik buğday. Konya Karatay bölgesinden. Nakliye alıcıya aittir.",
      price: 9500,
      currency: "TRY",
      category: "Tahıl",
      city: "Konya",
      district: "Karatay",
      active: true,
      images: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80", // Örnek resim
    },
  })
  console.log("Ürün ilanı eklendi.")

  // 2. İlan: İş (Biçerdöver Operatörü Aranıyor)
  await prisma.jobPosting.create({
    data: {
      userId: user.id,
      title: "Biçerdöver Operatörü Aranıyor",
      description: "Sezonluk çalışacak deneyimli biçerdöver operatörü arıyoruz. Kalacak yer ve yemek verilir.",
      wage: 25000,
      currency: "TRY",
      workType: "Mevsimlik",
      city: "Konya",
      district: "Çumra",
      active: true,
      images: "https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?w=800&q=80", // Örnek resim
    },
  })
  console.log("İş ilanı eklendi.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
