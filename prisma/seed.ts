import { PrismaClient } from "@prisma/client";
import { turkeyLocations } from "../lib/locations";

const prisma = new PrismaClient();

// Gerçekçi tarım görselleri (Unsplash)
const productImages = {
  traktor: "https://images.unsplash.com/photo-1605335359521-4f18370161a9?w=800&q=80",
  domates: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80",
  inek: "https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=800&q=80",
  pulluk: "https://images.unsplash.com/photo-1530268578403-fe5e6900a8c2?w=800&q=80", // Tarım aleti genel
  bugday: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&q=80",
  kasa: "https://images.unsplash.com/photo-1615486511484-92e172cc416d?w=800&q=80", // Meyve kasaları
  bal: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80",
  sulama: "https://images.unsplash.com/photo-1625246333195-09d9b43cf02f?w=800&q=80", // Sulama/Tarla
  arpa: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80"
};

const jobImages = {
  isci: "https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?w=800&q=80", // Tarla işçileri
  sera: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80",
  sofor: "https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?w=800&q=80", // Traktör şoförü
  coban: "https://images.unsplash.com/photo-1484557985045-6f5c5058846e?w=800&q=80",
  muhendis: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80", // Tarla kontrol
  bahcivan: "https://images.unsplash.com/photo-1558905540-e960388e1f8d?w=800&q=80",
  meyve: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800&q=80" // Meyve toplama
};

const sampleProducts = [
  { title: "Sahibinden Satılık Traktör", category: "ekipman", price: 650000, desc: "Az kullanılmış, bakımları yeni yapılmış traktör.", image: productImages.traktor },
  { title: "Organik Domates Fidesi", category: "sebze", price: 15, desc: "Yerli tohum organik domates fideleri. Toptan satışımız vardır.", image: productImages.domates },
  { title: "Büyükbaş Hayvan Yemi", category: "hayvan", price: 350, desc: "Yüksek proteinli süt yemi. 50kg çuval fiyatıdır.", image: productImages.inek }, // Yem görseli yerine inek görseli temsili
  { title: "İkinci El Pulluk", category: "ekipman", price: 12000, desc: "3'lü dönerli pulluk. İhtiyaç fazlası satılık.", image: productImages.pulluk },
  { title: "Buğday Tohumu", category: "tahil", price: 450, desc: "Sertifikalı buğday tohumu. Verim garantili.", image: productImages.bugday },
  { title: "Süt İneği", category: "hayvan", price: 75000, desc: "2. laktasyonda, günlük 25 litre süt verimi var.", image: productImages.inek },
  { title: "Elma Kasası", category: "ekipman", price: 50, desc: "Plastik elma toplama kasası. Adetli mevcuttur.", image: productImages.kasa },
  { title: "Doğal Çiçek Balı", category: "sebze", price: 300, desc: "Kendi üretimimiz katkısız çiçek balı. Teneke fiyatıdır.", image: productImages.bal },
  { title: "Damla Sulama Borusu", category: "ekipman", price: 2000, desc: "400 metre top, 16mm deliksiz boru.", image: productImages.sulama },
  { title: "Arpa", category: "tahil", price: 8, desc: "Yemlik arpa. Ton fiyatı üzerinden görüşülür.", image: productImages.arpa }
];

const sampleJobs = [
  { title: "Mevsimlik Fındık İşçisi Aranıyor", wage: 1200, desc: "Fındık toplama işi için yatılı kalacak işçiler aranıyor.", image: jobImages.isci },
  { title: "Sera Elemanı", wage: 18000, desc: "Antalya bölgesindeki seramızda çalışacak deneyimli eleman.", image: jobImages.sera },
  { title: "Traktör Şoförü", wage: 20000, desc: "Büyükbaş çiftliğinde çalışacak, traktör ehliyeti olan şoför.", image: jobImages.sofor },
  { title: "Çoban Aranıyor", wage: 25000, desc: "Küçükbaş hayvan sürüsüne bakacak deneyimli çoban.", image: jobImages.coban },
  { title: "Ziraat Mühendisi", wage: 30000, desc: "Danışmanlık firmamızda görev alacak ziraat mühendisi.", image: jobImages.muhendis },
  { title: "Bahçıvan", wage: 17002, desc: "Özel mülkte bahçe bakımı ve peyzaj işleri için.", image: jobImages.bahcivan },
  { title: "Meyve Toplama İşçisi", wage: 1000, desc: "Günlük yevmiye ile kiraz toplama işi.", image: jobImages.meyve },
];

async function main() {
  console.log("🌱 Veritabanı temizleniyor...");
  await prisma.favorite.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.conversation.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.jobPosting.deleteMany({});
  
  console.log("👤 Demo kullanıcı hazırlanıyor...");
  let user = await prisma.user.findFirst({
    where: { email: "demo@tarim.com" }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "demo@tarim.com",
        name: "Demo Çiftçi",
        role: "FARMER",
        city: "Ankara",
        phone: "0555 555 55 55",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80", // Gerçekçi profil resmi
      }
    });
  }

  console.log("🚜 İlanlar oluşturuluyor (Her ile 1 adet, gerçekçi resimlerle)...");

  // 81 ili döngüye al
  for (let i = 0; i < turkeyLocations.length; i++) {
    const location = turkeyLocations[i];
    const isJob = i % 2 !== 0; 
    const randomDistrict = location.districts[Math.floor(Math.random() * location.districts.length)];
    
    const isBarter = !isJob && i % 10 === 0; 

    if (isJob) {
      const jobTemplate = sampleJobs[i % sampleJobs.length];
      await prisma.jobPosting.create({
        data: {
          title: `${jobTemplate.title} - ${location.city}`,
          description: jobTemplate.desc,
          wage: jobTemplate.wage,
          workType: "Tam Zamanlı",
          city: location.city,
          district: randomDistrict,
          location: `${location.city}, ${randomDistrict}`,
          userId: user.id,
          active: true,
          images: jobTemplate.image, // Gerçekçi resim
        }
      });
    } else {
      const prodTemplate = sampleProducts[i % sampleProducts.length];
      const finalTitle = isBarter ? `[TAKAS] ${prodTemplate.title}` : prodTemplate.title;
      const finalDesc = isBarter ? `[TAKAS: Traktör veya Arazi Aracı] ${prodTemplate.desc}` : prodTemplate.desc;

      await prisma.product.create({
        data: {
          title: `${finalTitle} - ${location.city}`,
          description: finalDesc,
          price: prodTemplate.price,
          category: prodTemplate.category,
          city: location.city,
          district: randomDistrict,
          image: prodTemplate.image, // Gerçekçi resim
          userId: user.id,
          active: true,
        }
      });
    }
  }

  console.log(`✅ İşlem tamamlandı! Toplam ${turkeyLocations.length} adet ilan görseliyle birlikte oluşturuldu.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });