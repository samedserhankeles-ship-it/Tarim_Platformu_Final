/**
 * PostgreSQL'e geçiş hazırlık scripti
 * Bu script schema'yı PostgreSQL için hazırlar
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function preparePostgreSQL() {
  console.log('🔄 PostgreSQL hazırlık başlatılıyor...\n');

  // 1. Schema dosyasını oku
  const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
  let schemaContent = fs.readFileSync(schemaPath, 'utf-8');

  // 2. SQLite kontrolü
  if (schemaContent.includes('provider = "sqlite"')) {
    console.log('⚠️  SQLite kullanılıyor!\n');
    console.log('📝 Schema PostgreSQL için güncelleniyor...\n');
    
    // SQLite'ı PostgreSQL'e çevir
    schemaContent = schemaContent.replace(
      'provider = "sqlite"',
      'provider = "postgresql"'
    );
    
    // Decimal'leri kontrol et (zaten Float'a çevrildi)
    if (schemaContent.includes('Decimal')) {
      console.log('⚠️  Decimal tipi bulundu. Float\'a çevrilmeli.\n');
    }
    
    // Schema'yı kaydet
    fs.writeFileSync(schemaPath, schemaContent);
    console.log('✅ Schema PostgreSQL için güncellendi!\n');
  } else {
    console.log('✅ Schema zaten PostgreSQL kullanıyor.\n');
  }

  // 3. DATABASE_URL kontrolü
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.log('❌ DATABASE_URL environment variable bulunamadı!\n');
    console.log('📝 PostgreSQL database için bir bağlantı string\'i gerekli:\n');
    console.log('   Format: postgresql://user:password@host:5432/database\n');
    console.log('💡 Ücretsiz PostgreSQL seçenekleri:');
    console.log('   - Supabase: https://supabase.com');
    console.log('   - Railway: https://railway.app');
    console.log('   - Render: https://render.com\n');
    return;
  }

  // PostgreSQL kontrolü
  if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
    console.log('✅ PostgreSQL connection string bulundu!\n');
    
    try {
      // Connection test
      await prisma.$connect();
      console.log('✅ Veritabanı bağlantısı başarılı!\n');
      
      // Migration kontrolü
      console.log('📋 Sonraki adımlar:');
      console.log('   1. npx prisma generate');
      console.log('   2. npx prisma migrate deploy');
      console.log('   3. npm run build');
      console.log('   4. Deploy et\n');
      
    } catch (error: any) {
      console.log('❌ Veritabanı bağlantı hatası:', error.message);
      console.log('\n💡 Connection string\'inizi kontrol edin.\n');
    }
  } else {
    console.log('⚠️  DATABASE_URL PostgreSQL formatında değil!\n');
    console.log('📝 PostgreSQL connection string gerekli.\n');
  }

  await prisma.$disconnect();
}

preparePostgreSQL()
  .catch((e) => {
    console.error('❌ Hata:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



