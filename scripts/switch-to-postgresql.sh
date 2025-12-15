#!/bin/bash

# PostgreSQL'e geçiş scripti

echo "🔄 PostgreSQL'e geçiş başlatılıyor..."

# 1. Schema'yı güncelle
echo "📝 Schema güncelleniyor..."
sed -i.bak 's/provider = "sqlite"/provider = "postgresql"/g' prisma/schema.prisma
echo "✅ Schema güncellendi"

# 2. Backup oluştur
if [ -f "prisma/dev.db" ]; then
    echo "💾 SQLite veritabanı yedekleniyor..."
    cp prisma/dev.db prisma/dev.db.backup
    echo "✅ Yedek oluşturuldu: prisma/dev.db.backup"
fi

# 3. Prisma client generate
echo "🔧 Prisma client generate ediliyor..."
npx prisma generate

# 4. Migration hazırla
echo "📋 Migration hazırlanıyor..."
echo "⚠️  DATABASE_URL environment variable'ını PostgreSQL connection string olarak ayarlayın!"
echo "⚠️  Sonra: npx prisma migrate deploy"

echo ""
echo "✅ Hazırlık tamamlandı!"
echo "📝 Sonraki adımlar:"
echo "   1. DATABASE_URL'i PostgreSQL connection string olarak ayarla"
echo "   2. npx prisma migrate deploy"
echo "   3. npm run build"



