import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addAdminProducts() {
  try {
    console.log("Admin kullanıcısı aranıyor...");
    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@tarim.com" },
    });

    if (!adminUser) {
      console.error("HATA: 'admin@tarim.com' e-posta adresine sahip kullanıcı bulunamadı.");
      return;
    }

    console.log(`Admin kullanıcısı bulundu: ${adminUser.name || adminUser.email} (ID: ${adminUser.id})`);

    const productsToCreate = [
      { title: "Kışlık Buğday Tohumu", category: "Tohum", price: 1500, description: "Yüksek verimli sertifikalı kışlık buğday tohumu. 50kg çuval." },
      { title: "Organik Solucan Gübresi", category: "Gübre", price: 250, description: "Bitkileriniz için %100 doğal solucan gübresi. 20kg." },
      { title: "New Holland TD110", category: "Traktör", price: 2500000, description: "2021 model, temiz kullanılmış, 400 saatte traktör." },
      { title: "Yerli Domates Fidesi", category: "Fide", price: 5, description: "Salkım domates fidesi, hastalıklara dayanıklı." },
      { title: "Damla Sulama Borusu", category: "Sulama", price: 400, description: "16mm çapında, 400 metre top damla sulama borusu." },
      { title: "Satılık Elma Bahçesi Ürünü", category: "Meyve", price: 15, description: "Dalından taze toplanmış Amasya elması. Toptan satış." },
      { title: "İkinci El Pulluk", category: "Ekipman", price: 15000, description: "4'lü dönerli pulluk, bakımları yapılmış." },
      { title: "Fındık Toplama Makinesi", category: "Makine", price: 45000, description: "Sırt tipi fındık toplama makinesi, benzinli." },
      { title: "Saman Balyası", category: "Yem", price: 80, description: "Buğday samanı, 25kg presli balya." },
      { title: "Arı Kovanı", category: "Hayvancılık", price: 1200, description: "Çam keresteden yapılmış, katlı arı kovanı." },
    ];

    // İlk 4 tanesi pasif, geri kalanı aktif olacak şekilde ayarlayalım (Kullanıcı isteği: 4 pasif)
    // Ancak listedeki sıraya göre değil, rastgele veya baştan 4 tanesini pasif yapabiliriz.
    // Kullanıcı "4 unu pasife al" dedi. İlk 4'ü pasif yapalım.

    let createdCount = 0;

    for (let i = 0; i < productsToCreate.length; i++) {
      const productData = productsToCreate[i];
      const isActive = i >= 4; // İlk 4 (indeks 0, 1, 2, 3) pasif (false), diğerleri aktif (true)

      const product = await prisma.product.create({
        data: {
          title: productData.title,
          description: productData.description,
          price: productData.price,
          category: productData.category,
          city: adminUser.city || "Ankara", // Varsayılan veya adminin şehri
          district: adminUser.district || "Merkez",
          active: isActive,
          userId: adminUser.id,
          image: null, // Şimdilik resimsiz
          images: null
        },
      });

      console.log(`Ürün oluşturuldu: ${product.title} (Durum: ${product.active ? "AKTİF" : "PASİF"})`);
      createdCount++;
    }

    console.log(`\nToplam ${createdCount} ürün başarıyla eklendi.`);
    console.log(`- ${createdCount - 4} Aktif`);
    console.log(`- 4 Pasif`);

  } catch (error) {
    console.error("Bir hata oluştu:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addAdminProducts();
