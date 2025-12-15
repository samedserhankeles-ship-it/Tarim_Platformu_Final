import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs'; // Need to hash passwords
import { turkeyLocations } from '../lib/locations'; // For city/district data

const prisma = new PrismaClient();

async function createTestUsers() {
  console.log("50 adet deneme hesabı oluşturma işlemi başlatılıyor...");

  // Check if bcryptjs is installed, if not, recommend installation
  try {
    require.resolve('bcryptjs');
  } catch (e) {
    console.error("Hata: 'bcryptjs' paketi yüklü değil. Lütfen 'npm install bcryptjs' komutunu çalıştırın ve tekrar deneyin.");
    process.exit(1);
  }

  const defaultPassword = 'password123';
  const hashedPassword = await hash(defaultPassword, 10);

  const roles = ["FARMER", "WORKER", "BUSINESS"];

  for (let i = 1; i <= 50; i++) {
    const userEmail = `testuser${i}@example.com`;
    const userName = `Deneme Kullanıcı ${i}`;
    const userRole = roles[Math.floor(Math.random() * roles.length)];

    // Get a random city and district
    const randomLocation = turkeyLocations[Math.floor(Math.random() * turkeyLocations.length)];
    const randomCity = randomLocation.city;
    const randomDistrict = randomLocation.districts[Math.floor(Math.random() * randomLocation.districts.length)];

    try {
      await prisma.user.create({
        data: {
          name: userName,
          email: userEmail,
          password: hashedPassword,
          role: userRole,
          city: randomCity,
          district: randomDistrict,
          phone: `5${Math.floor(100000000 + Math.random() * 900000000)}`, // Random 10-digit phone
          image: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(userName)}&radius=50`, // Avatar from initials
        },
      });
      console.log(`✅ ${userName} (${userEmail}) hesabı oluşturuldu.`);
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        console.warn(`⚠️ ${userEmail} zaten mevcut, atlanıyor.`);
      } else {
        console.error(`❌ ${userName} hesabı oluşturulurken hata oluştu:`, error);
      }
    }
  }

  console.log("50 adet deneme hesabı oluşturma işlemi tamamlandı.");
}

createTestUsers()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
