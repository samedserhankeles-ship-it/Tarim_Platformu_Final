import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. Kullanıcıyı Bul
  const user = await prisma.user.findFirst({
    where: {
      name: {
        contains: 'Ikmal', 
      }
    }
  })

  if (!user) {
    console.log("❌ 'ikmal' isminde bir kullanıcı bulunamadı.");
    // Opsiyonel: Kullanıcı yoksa oluşturulabilir ama şimdilik sadece bildiriyoruz.
    return;
  }

  console.log(`✅ Kullanıcı bulundu: ${user.name} (Rol: ${user.role})`);

  // 2. İlan Verileri (Çeşitli kategoriler ve içerikler)
  const products = [
    { title: "John Deere 5050E Traktör", price: 850000, category: "Traktör", description: "2020 model, 4x4, kabinli ve klimalı. Tüm bakımları yetkili serviste yapılmıştır. Çalışma saati: 1500.", image: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=800&q=80" },
    { title: "Dap Gübre 50kg (Toros)", price: 1350, category: "Gübre", description: "Orijinal torbasında, yeni sezon ürünü. 1 ton ve üzeri alımlarda nakliye bizden.", image: "https://images.unsplash.com/photo-1627920769842-6a75ca6c855a?w=800&q=80" },
    { title: "Sertifikalı Espada Buğday Tohumu", price: 18, category: "Tohum", description: "Kuraklığa ve soğuğa dayanıklı, yüksek verimli ekmeklik buğday tohumu. Sertifikalıdır.", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80" },
    { title: "New Holland BC5040 Balya Makinesi", price: 420000, category: "Makine", description: "3 ipli, haşbaylı, sorunsuz çalışır durumda. Sezona hazır.", image: "https://images.unsplash.com/photo-1533241242337-77292271297e?w=800&q=80" },
    { title: "Yassı Damlama Sulama Borusu (400mt)", price: 2800, category: "Sulama", description: "20cm aralıklı, 2.5L debili, tıkanma yapmaz. 1. kalite hammadde.", image: "https://images.unsplash.com/photo-1633636183377-226e676f57df?w=800&q=80" },
    { title: "Organik Solucan Gübresi (Sıvı)", price: 450, category: "Gübre", description: "20 Litre bidon. Toprak düzenleyici ve verim artırıcı. Yapraktan ve damlamadan uygulanabilir.", image: "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=800&q=80" },
    { title: "Silajlık Mısır Tohumu (Pioneer)", price: 2400, category: "Tohum", description: "Yüksek boy yapan, bol yapraklı ve koçanlı silajlık mısır çeşidi.", image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&q=80" },
    { title: "4'lü Dönerli Pulluk (Ünlü)", price: 65000, category: "Ekipman", description: "14 numara, az kullanılmış, bıçakları yeni değişti.", image: "https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?w=800&q=80" },
    { title: "DJI Agras T30 Zirai İlaçlama Dronu", price: 450000, category: "Teknoloji", description: "30 Litre tank kapasitesi, yedek batarya ve şarj istasyonu dahil. Eğitimi verilecektir.", image: "https://images.unsplash.com/photo-1506947411487-a56738267384?w=800&q=80" },
    { title: "Seyyar Süt Sağım Makinesi", price: 18500, category: "Hayvancılık", description: "Çift gügümlü, yağlı tip vakum pompalı. 2 yıl garantili.", image: "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=800&q=80" }
  ];

  // 3. İlanları Ekle (Geçmiş tarihlere yayarak)
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const daysAgo = Math.floor(Math.random() * 30); // Son 30 gün içine rastgele dağıt
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    await prisma.product.create({
      data: {
        title: product.title,
        description: product.description,
        price: product.price,
        currency: "TRY",
        category: product.category,
        city: user.city || "Konya",
        district: user.district || "Meram",
        village: "Merkez",
        userId: user.id,
        createdAt: date,
        active: true,
        image: product.image, // Ana resim
        images: product.image, // Galeri için de aynı resmi koyalım
        contactPhone: user.phone
      }
    });
    console.log(`➕ İlan eklendi: ${product.title} (${date.toLocaleDateString("tr-TR")})`);
  }

  console.log("✨ Tüm ilanlar başarıyla eklendi.");
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
