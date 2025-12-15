#!/bin/bash

# TarımPazar - Sunucuya Deployment Script
# Kullanım: ./scripts/deploy-to-server.sh

set -e

SERVER_IP="173.212.232.190"
SERVER_USER="root"
SERVER_PATH="/var/www/tarimpazar"
DOMAIN="tarimpazar.com"

echo "🚀 TarımPazar Deployment Başlıyor..."

# 1. Local'de build al
echo "📦 Local build alınıyor..."
npm run build

# 2. Sunucuya bağlan ve deployment yap
echo "🔌 Sunucuya bağlanılıyor..."

ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
set -e

# Sunucu güncellemeleri
echo "🔄 Sunucu güncelleniyor..."
apt-get update -qq

# Gerekli paketlerin kurulu olduğunu kontrol et
echo "✅ Gerekli paketler kontrol ediliyor..."
command -v node >/dev/null 2>&1 || { echo "Node.js kurulu değil!"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm kurulu değil!"; exit 1; }
command -v pm2 >/dev/null 2>&1 || { echo "PM2 kurulu değil!"; exit 1; }

# Node.js ve npm versiyonlarını göster
echo "Node.js: $(node -v)"
echo "npm: $(npm -v)"
echo "PM2: $(pm2 -v)"

# Proje klasörünü oluştur
echo "📁 Proje klasörü oluşturuluyor..."
mkdir -p /var/www/tarimpazar
cd /var/www/tarimpazar

# Git repo varsa güncelle, yoksa clone et
if [ -d ".git" ]; then
    echo "🔄 Git repo güncelleniyor..."
    git pull origin main
else
    echo "📥 Git repo clone ediliyor..."
    git clone https://github.com/Emirhand514/tarimpazar.git /tmp/tarimpazar-temp
    cp -r /tmp/tarimpazar-temp/* /var/www/tarimpazar/
    cp -r /tmp/tarimpazar-temp/.* /var/www/tarimpazar/ 2>/dev/null || true
    rm -rf /tmp/tarimpazar-temp
fi

# .env dosyasını kontrol et
if [ ! -f ".env" ]; then
    echo "⚙️  .env dosyası oluşturuluyor..."
    cat > .env << EOF
NODE_ENV=production
DATABASE_URL="file:./prisma/dev.db"
NEXT_PUBLIC_SITE_URL=http://${SERVER_IP}
EOF
    echo "⚠️  .env dosyası oluşturuldu, lütfen gerekli değerleri güncelleyin!"
fi

# Bağımlılıkları yükle
echo "📦 Bağımlılıklar yükleniyor..."
npm ci --production=false

# Prisma client'ı generate et
echo "🗄️  Prisma client generate ediliyor..."
npx prisma generate

# Prisma migration'ları çalıştır (SQLite için)
echo "🔄 Prisma migration'ları çalıştırılıyor..."
npx prisma migrate deploy || npx prisma db push

# Production build al
echo "🏗️  Production build alınıyor..."
npm run build

# Uploads klasörünü oluştur
echo "📁 Uploads klasörü oluşturuluyor..."
mkdir -p public/uploads/users
chmod -R 755 public/uploads

# PM2 ile uygulamayı başlat/durult
echo "🚀 PM2 ile uygulama başlatılıyor..."
pm2 delete tarimpazar 2>/dev/null || true
pm2 start npm --name "tarimpazar" -- start
pm2 save

# PM2 startup script'i ekle
pm2 startup systemd -u ${SERVER_USER} --hp /root || true

echo "✅ Deployment tamamlandı!"
echo "📊 PM2 durumu:"
pm2 status

ENDSSH

echo ""
echo "🎉 Deployment başarıyla tamamlandı!"
echo "🌐 Uygulama: http://${SERVER_IP}:3000"
echo ""
echo "📝 Sonraki adımlar:"
echo "1. Nginx yapılandırması yapılmalı"
echo "2. Domain DNS ayarları yapılmalı"
echo "3. SSL sertifikası (Let's Encrypt) kurulmalı"

