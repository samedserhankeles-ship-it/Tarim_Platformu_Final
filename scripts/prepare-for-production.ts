/**
 * Production'a geçiş hazırlık scripti
 * Bu script PostgreSQL connection string'i kontrol eder ve gerekli bilgileri verir
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProductionReadiness() {
  console.log('🔍 Production hazırlık kontrolü başlatılıyor...\n');

  // 1. Database connection kontrolü
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.log('❌ DATABASE_URL environment variable bulunamadı!\n');
    console.log('📝 PostgreSQL database için bir bağlantı stringi gerekli:');
    console.log('   Format: postgresql://user:password@host:5432/database\n');
    console.log('💡 Ücretsiz PostgreSQL seçenekleri:');
    console.log('   - Supabase: https://supabase.com');
    console.log('   - Railway: https://railway.app');
    console.log('   - Render: https://render.com\n');
    return;
  }

  // SQLite kontrolü
  if (dbUrl.startsWith('file:') || dbUrl.includes('sqlite')) {
    console.log('⚠️  UYARI: SQLite kullanıyorsunuz!\n');
    console.log('❌ SQLite production ortamında ÇALIŞMAZ!\n');
    console.log('✅ Çözüm: PostgreSQL kullanın\n');
    console.log('📝 Adımlar:');
    console.log('   1. PostgreSQL database oluştur (Supabase, Railway, vb.)');
    console.log('   2. Connection string al');
    console.log('   3. prisma/schema.prisma dosyasında provider = "postgresql" yap');
    console.log('   4. DATABASE_URL environment variable\'ı güncelle\n');
    return;
  }

  // PostgreSQL kontrolü
  if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
    console.log('✅ PostgreSQL connection string bulundu!\n');
    
    try {
      // Connection test
      await prisma.$connect();
      console.log('✅ Veritabanı bağlantısı başarılı!\n');
      
      // Schema kontrolü
      const userCount = await prisma.user.count();
      console.log(`📊 Veritabanında ${userCount} kullanıcı bulundu\n`);
      
      console.log('✅ Production için hazırsınız!\n');
      console.log('📋 Sonraki adımlar:');
      console.log('   1. npm run build (build test)');
      console.log('   2. npx prisma migrate deploy (production migrations)');
      console.log('   3. Deploy et (Vercel, Railway, vb.)\n');
      
    } catch (error: any) {
      console.log('❌ Veritabanı bağlantı hatası:', error.message);
      console.log('\n💡 Connection string\'inizi kontrol edin.\n');
    }
  }

  await prisma.$disconnect();
}

checkProductionReadiness()
  .catch((e) => {
    console.error('❌ Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



