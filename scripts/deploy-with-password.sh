#!/bin/bash

# TarımPazar - Şifre ile Deployment Script
# Kullanım: SSH_PASSWORD='şifreniz' ./scripts/deploy-with-password.sh

set -e

SERVER_IP="173.212.232.190"
SERVER_USER="root"
SERVER_PATH="/var/www/tarimpazar"

# Şifre kontrolü
if [ -z "$SSH_PASSWORD" ]; then
    echo "❌ SSH_PASSWORD environment variable'ı ayarlanmamış!"
    echo "Kullanım: SSH_PASSWORD='şifreniz' ./scripts/deploy-with-password.sh"
    exit 1
fi

echo "🚀 TarımPazar Deployment Başlıyor..."

# expect script'i ile şifreli SSH bağlantısı
expect << EOF
set timeout 30
spawn ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "echo 'SSH bağlantısı başarılı'"
expect {
    "password:" {
        send "${SSH_PASSWORD}\r"
        exp_continue
    }
    "Permission denied" {
        puts "❌ SSH bağlantısı başarısız! Şifre yanlış veya erişim reddedildi."
        exit 1
    }
    "SSH bağlantısı başarılı" {
        puts "✅ SSH bağlantısı başarılı"
    }
}
EOF

# Ana deployment işlemleri
echo "📦 Local build alınıyor..."
npm run build

echo "🔌 Sunucuya deployment yapılıyor..."

# expect ile deployment komutlarını çalıştır
expect << 'DEPLOYSCRIPT'
set timeout 300
set server_ip "173.212.232.190"
set server_user "root"
set password $env(SSH_PASSWORD)

spawn ssh -o StrictHostKeyChecking=no ${server_user}@${server_ip}

expect {
    "password:" {
        send "${password}\r"
        exp_continue
    }
    "# " {
        send "set -e\r"
        expect "# "
        
        send "echo '🔄 Sunucu hazırlığı başlıyor...'\r"
        expect "# "
        
        send "apt-get update -qq\r"
        expect "# "
        
        send "command -v node >/dev/null 2>&1 || { echo 'Node.js kurulu değil!'; exit 1; }\r"
        expect "# "
        
        send "command -v npm >/dev/null 2>&1 || { echo 'npm kurulu değil!'; exit 1; }\r"
        expect "# "
        
        send "command -v pm2 >/dev/null 2>&1 || { echo 'PM2 kurulu değil!'; exit 1; }\r"
        expect "# "
        
        send "echo 'Node.js: ' && node -v\r"
        expect "# "
        
        send "echo 'npm: ' && npm -v\r"
        expect "# "
        
        send "echo 'PM2: ' && pm2 -v\r"
        expect "# "
        
        send "mkdir -p /var/www/tarimpazar\r"
        expect "# "
        
        send "cd /var/www/tarimpazar\r"
        expect "# "
        
        send "if [ -d '.git' ]; then echo '🔄 Git repo güncelleniyor...' && git pull origin main; else echo '📥 Git repo clone ediliyor...' && git clone https://github.com/Emirhand514/tarimpazar.git /tmp/tarimpazar-temp && cp -r /tmp/tarimpazar-temp/* /var/www/tarimpazar/ && cp -r /tmp/tarimpazar-temp/.* /var/www/tarimpazar/ 2>/dev/null || true && rm -rf /tmp/tarimpazar-temp; fi\r"
        expect "# "
        
        send "if [ ! -f '.env' ]; then cat > .env << 'ENVEOF'\r"
        send "NODE_ENV=production\r"
        send "DATABASE_URL=\"file:./prisma/dev.db\"\r"
        send "NEXT_PUBLIC_SITE_URL=http://173.212.232.190\r"
        send "ENVEOF\r"
        send "echo '⚠️  .env dosyası oluşturuldu'; fi\r"
        expect "# "
        
        send "echo '📦 Bağımlılıklar yükleniyor...'\r"
        expect "# "
        send "npm ci --production=false\r"
        expect "# " timeout 600
        
        send "echo '🗄️  Prisma client generate ediliyor...'\r"
        expect "# "
        send "npx prisma generate\r"
        expect "# " timeout 120
        
        send "echo '🔄 Prisma migration çalıştırılıyor...'\r"
        expect "# "
        send "npx prisma migrate deploy || npx prisma db push\r"
        expect "# " timeout 120
        
        send "echo '🏗️  Production build alınıyor...'\r"
        expect "# "
        send "npm run build\r"
        expect "# " timeout 600
        
        send "mkdir -p public/uploads/users && chmod -R 755 public/uploads\r"
        expect "# "
        
        send "pm2 delete tarimpazar 2>/dev/null || true\r"
        expect "# "
        
        send "pm2 start npm --name 'tarimpazar' -- start\r"
        expect "# "
        
        send "pm2 save\r"
        expect "# "
        
        send "pm2 startup systemd -u root --hp /root || true\r"
        expect "# "
        
        send "pm2 status\r"
        expect "# "
        
        send "exit\r"
        expect eof
    }
    timeout {
        puts "❌ Bağlantı zaman aşımına uğradı!"
        exit 1
    }
}
DEPLOYSCRIPT

echo ""
echo "🎉 Deployment tamamlandı!"
echo "🌐 Uygulama: http://173.212.232.190:3000"
echo ""
echo "⚠️  Sonraki adımlar:"
echo "1. Nginx yapılandırması yapılmalı (DEPLOY_SERVER.md'ye bakın)"
echo "2. Domain DNS ayarları yapılmalı"
echo "3. SSL sertifikası (Let's Encrypt) kurulmalı"

