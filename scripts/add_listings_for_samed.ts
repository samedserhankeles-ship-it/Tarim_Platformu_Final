import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addListingsForUser() {
  try {
    const searchName = "Samed Serhan Keleş"; // İsme göre arama
    const searchEmail = "samedserhankeles@hotmail.com"; // E-postaya göre arama (yedek)

    console.log(`Kullanıcı aranıyor: ${searchName} veya ${searchEmail}...`);

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { name: { contains: searchName } }, // Tam eşleşme olmasa bile bulsun
          { email: searchEmail }
        ]
      }
    });

    if (!user) {
      console.log("Kullanıcı bulunamadı! Lütfen ismi veya e-postayı kontrol edin.");
      // Alternatif olarak tüm kullanıcıları listeleyip manuel seçim yapabiliriz ama şimdilik return.
      const allUsers = await prisma.user.findMany({ select: { name: true, email: true } });
      console.log("Mevcut Kullanıcılar:", allUsers.slice(0, 5));
      return;
    }

    console.log(`Kullanıcı bulundu: ${user.name} (${user.email}) - ID: ${user.id}`);

    const productsToCreate = [
      { title: "John Deere 5050E Traktör", category: "Traktör", price: 950000, description: "2023 model, kabinli, klimalı sıfır ayarında traktör." },
      { title: "Satılık Ceviz Fidanı", category: "Fidan", price: 150, description: "Chandler cinsi, sertifikalı mavi etiketli ceviz fidanı." },
      { title: "Organik Yumurta", category: "Hayvansal Ürün", price: 5, description: "Gezen tavuk yumurtası, günlük taze." },
      { title: "2. El Su Pompası", category: "Sulama", price: 7500, description: "3 inç giriş çıkışlı, dizel su motoru." },
      { title: "Yonca Balyası", category: "Yem", price: 120, description: "Kuru, yağmur yememiş 1. kalite yonca balyası." },
      { title: "Zeytin Hasat Makinesi", category: "Makine", price: 25000, description: "Şarjlı, teleskopik saplı zeytin silkeleme makinesi." },
      { title: "Köy Domatesi", category: "Sebze", price: 25, description: "İlaçsız, doğal köy domatesi. Kasayla verilir." },
      { title: "Arpa Tohumu", category: "Tohum", price: 12, description: "2 sıralı, verimli arpa tohumu. Elenmiş ve ilaçlanmış." },
      { title: "Satılık İnek", category: "Büyükbaş", price: 85000, description: "2. buzağısına gebe, süt verimi yüksek Simental inek." },
      { title: "Meyve Kasası", category: "Ekipman", price: 35, description: "Plastik, dayanıklı 2. el temiz meyve kasaları." }
    ];

    console.log("10 adet ilan oluşturuluyor...");

    for (let i = 0; i < productsToCreate.length; i++) {
      const productData = productsToCreate[i];
      // İlk 5 tanesi PASİF (false), diğer 5 tanesi AKTİF (true) olsun.
      // Kullanıcı "5 tanesini pasife at" dedi.
      const isActive = i >= 5; // 0,1,2,3,4 -> Pasif, 5,6,7,8,9 -> Aktif
      
      const product = await prisma.product.create({
        data: {
          title: productData.title,
          description: productData.description,
          price: productData.price,
          category: productData.category,
          city: user.city || "Bilinmiyor",
          district: user.district || "Merkez",
          active: isActive, // Pasif veya Aktif
          userId: user.id,
          image: null,
          images: null
        },
      });

      console.log(`[${i+1}/10] İlan oluşturuldu: ${product.title} (Durum: ${isActive ? "AKTİF" : "PASİF"})`);

      // Eğer ilan pasif ise, bildirim gönder
      if (!isActive) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            title: "İlanınız Yayından Kaldırıldı",
            message: `"${product.title}" başlıklı ilanınız, topluluk kurallarına uymadığı gerekçesiyle yönetici tarafından pasife alınmıştır. Lütfen ilan içeriğini kontrol edip düzenleyiniz.`, 
            type: "WARNING",
            link: "/dashboard/ilanlarim"
          }
        });
        console.log(`   -> Bildirim gönderildi: "${product.title}" pasife alındı.`);
      }
    }

    console.log("\nİşlem başarıyla tamamlandı.");

  } catch (error) {
    console.error("Hata oluştu:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addListingsForUser();
