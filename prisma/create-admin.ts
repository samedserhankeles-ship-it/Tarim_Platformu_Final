import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAdmin() {
  const adminEmail = 'admin@tarim.com';
  const adminPassword = 'admin123'; // Şifreyi değiştirmeyi unutmayın!
  const adminName = 'Admin User';

  try {
    // Önce admin kullanıcısının var olup olmadığını kontrol et
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log(`⚠️  Admin kullanıcısı zaten mevcut: ${adminEmail}`);
      
      // Role'ü ADMIN olarak güncelle (eğer değilse)
      if (existingAdmin.role !== 'ADMIN') {
        await prisma.user.update({
          where: { id: existingAdmin.id },
          data: { role: 'ADMIN' },
        });
        console.log(`✅ Kullanıcı rolü ADMIN olarak güncellendi.`);
      }
      
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Şifre: ${adminPassword}`);
      return;
    }

    // Admin kullanıcısını oluştur
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        password: adminPassword, // Not: Production'da bcrypt ile hash'lenmeli
        role: 'ADMIN',
        city: 'Ankara',
        phone: '0555 000 00 00',
      },
    });

    console.log('✅ Admin kullanıcısı başarıyla oluşturuldu!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Şifre: ${adminPassword}`);
    console.log('\n⚠️  ÖNEMLİ: Production ortamında şifreyi değiştirmeyi unutmayın!');
  } catch (error) {
    console.error('❌ Admin kullanıcısı oluşturulurken hata:', error);
    throw error;
  }
}

createAdmin()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



