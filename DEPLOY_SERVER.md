# 🚀 Sunucuya Deployment Rehberi

## 📋 Gereksinimler

- Sunucu IP: `173.212.232.190`
- Kullanıcı: `root`
- Proje Klasörü: `/var/www/tarimpazar`

## 🔐 SSH Bağlantısı

### 1. Public Key'i Sunucuya Ekleme

Sunucuya başka bir yolla bağlandıktan sonra:

```bash
# Public key'i authorized_keys'e ekle
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKQMOQd/jKA4mqPvqXRdyyW9jJ2OzbSMdVKmdHoTb5Xf emirhan" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### 2. SSH ile Bağlanma

```bash
ssh root@173.212.232.190
```

## 🛠️ Manuel Deployment Adımları

### 1. Sunucu Hazırlığı

```bash
# Sunucuya bağlan
ssh root@173.212.232.190

# Sistem güncellemesi
apt-get update
apt-get upgrade -y

# Gerekli paketler (zaten kurulu olabilir)
apt-get install -y git curl

# Node.js kontrolü (18.x veya 20.x olmalı)
node -v
npm -v

# PM2 kontrolü
pm2 -v
```

### 2. Proje Klasörünü Hazırlama

```bash
# Proje klasörünü oluştur
mkdir -p /var/www/tarimpazar
cd /var/www/tarimpazar

# Git repo'yu clone et
git clone https://github.com/Emirhand514/tarimpazar.git .

# Veya repo varsa güncelle
git pull origin main
```

### 3. Environment Variables

```bash
cd /var/www/tarimpazar

# .env dosyası oluştur
cat > .env << EOF
NODE_ENV=production
DATABASE_URL="file:./prisma/dev.db"
NEXT_PUBLIC_SITE_URL=http://173.212.232.190
EOF

# Domain kullanılacaksa:
# NEXT_PUBLIC_SITE_URL=https://tarimpazar.com
```

### 4. Bağımlılıkları Yükleme

```bash
cd /var/www/tarimpazar

# Bağımlılıkları yükle
npm ci

# Prisma client generate
npx prisma generate

# Prisma migration (SQLite için)
npx prisma migrate deploy || npx prisma db push

# Production build
npm run build
```

### 5. Uploads Klasörü

```bash
# Uploads klasörünü oluştur ve izinleri ayarla
mkdir -p public/uploads/users
chmod -R 755 public/uploads
```

### 6. PM2 ile Uygulamayı Başlatma

```bash
cd /var/www/tarimpazar

# Eski process'i durdur (varsa)
pm2 delete tarimpazar 2>/dev/null || true

# Uygulamayı başlat
pm2 start npm --name "tarimpazar" -- start

# PM2'yi kaydet
pm2 save

# PM2 startup script'i ekle (sistem yeniden başlatıldığında otomatik başlasın)
pm2 startup systemd -u root --hp /root

# Durumu kontrol et
pm2 status
pm2 logs tarimpazar
```

### 7. Nginx Yapılandırması

```bash
# Nginx kurulu değilse kur
apt-get install -y nginx

# Config dosyasını oluştur
cat > /etc/nginx/sites-available/tarimpazar << 'EOF'
upstream tarimpazar {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name tarimpazar.com www.tarimpazar.com 173.212.232.190;

    access_log /var/log/nginx/tarimpazar-access.log;
    error_log /var/log/nginx/tarimpazar-error.log;

    client_max_body_size 10M;

    location / {
        proxy_pass http://tarimpazar;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /_next/static {
        proxy_pass http://tarimpazar;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }

    location /uploads {
        alias /var/www/tarimpazar/public/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Config'i aktif et
ln -sf /etc/nginx/sites-available/tarimpazar /etc/nginx/sites-enabled/

# Default config'i devre dışı bırak (isteğe bağlı)
rm -f /etc/nginx/sites-enabled/default

# Nginx config'i test et
nginx -t

# Nginx'i yeniden başlat
systemctl restart nginx
systemctl enable nginx
```

### 8. Güvenlik Duvarı (Firewall)

```bash
# UFW kontrolü
ufw status

# Gerekli portları aç (eğer UFW aktifse)
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw enable
```

## 🔄 Güncelleme

Projeyi güncellemek için:

```bash
ssh root@173.212.232.190
cd /var/www/tarimpazar
git pull origin main
npm ci
npx prisma generate
npm run build
pm2 restart tarimpazar
```

## 🌐 SSL Sertifikası (Let's Encrypt)

Domain DNS ayarları yapıldıktan sonra:

```bash
# Certbot kur
apt-get install -y certbot python3-certbot-nginx

# SSL sertifikası al
certbot --nginx -d tarimpazar.com -d www.tarimpazar.com

# Otomatik yenileme test et
certbot renew --dry-run
```

## 📊 PM2 Komutları

```bash
# Durumu göster
pm2 status

# Logları göster
pm2 logs tarimpazar

# Yeniden başlat
pm2 restart tarimpazar

# Durdur
pm2 stop tarimpazar

# Başlat
pm2 start tarimpazar

# Sil
pm2 delete tarimpazar
```

## 🔍 Sorun Giderme

### Uygulama çalışmıyor
```bash
pm2 logs tarimpazar
cd /var/www/tarimpazar
npm run build  # Build hatası var mı kontrol et
```

### Nginx çalışmıyor
```bash
systemctl status nginx
nginx -t  # Config hatası var mı kontrol et
tail -f /var/log/nginx/error.log
```

### Port 3000 zaten kullanılıyor
```bash
lsof -i :3000
pm2 delete tarimpazar
pm2 start npm --name "tarimpazar" -- start
```

## ✅ Kontrol Listesi

- [x] SSH bağlantısı çalışıyor
- [ ] Node.js ve npm kurulu
- [ ] PM2 kurulu
- [ ] Git repo clone edildi
- [ ] .env dosyası oluşturuldu
- [ ] Bağımlılıklar yüklendi
- [ ] Prisma migration çalıştırıldı
- [ ] Production build alındı
- [ ] PM2 ile uygulama başlatıldı
- [ ] Nginx yapılandırıldı
- [ ] Firewall ayarları yapıldı
- [ ] SSL sertifikası kuruldu (domain hazırsa)

