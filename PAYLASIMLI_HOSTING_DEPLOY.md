# Paylaşımlı Hosting Deployment Rehberi - TarımPazar

## ⚠️ ÖNEMLİ NOT

Next.js uygulamaları **çoğu paylaşımlı hosting'de çalışmaz**. Önce hosting sağlayıcınızla şunları kontrol edin:

### ✅ Gereksinimler:
1. **Node.js 18+** desteği olmalı
2. **PM2** veya process manager
3. **PostgreSQL** database (ayrı sunucuda olabilir)
4. **SSH erişimi** (build için)
5. **Git** desteği

### ❌ Desteklemiyorsa:
**Vercel kullanın** (ücretsiz, 5 dakikada deploy):
- [vercel.com](https://vercel.com)
- GitHub'a bağlayın, otomatik deploy

---

## 📋 ADIM ADIM DEPLOYMENT

### ADIM 1: PostgreSQL Database Oluştur

**Ücretsiz PostgreSQL seçenekleri:**

#### A) Supabase (ÖNERİLEN - En Kolay)
1. [supabase.com](https://supabase.com) hesap oluştur
2. "New Project" tıkla
3. Proje adı: `tarimpazar`
4. Şifre belirle (kaydet!)
5. Region: `West Europe` (Türkiye'ye yakın)
6. "Create new project" tıkla
7. Settings > Database > Connection string kopyala
8. Format: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

#### B) Railway PostgreSQL
1. [railway.app](https://railway.app) hesap oluştur
2. "New Project" > "Database" > "PostgreSQL"
3. Connection string otomatik verilir

#### C) Render PostgreSQL
1. [render.com](https://render.com) hesap oluştur
2. "New" > "PostgreSQL"
3. Connection string al

---

### ADIM 2: Schema'yı PostgreSQL'e Güncelle

`prisma/schema.prisma` dosyasında değişiklik yapılacak (şimdi yapacağız).

---

### ADIM 3: Environment Variables Hazırla

Hosting panelinde veya `.env.production` dosyası oluştur:

```env
DATABASE_URL=postgresql://postgres:ŞİFRENİZ@db.xxxxx.supabase.co:5432/postgres
NEXT_PUBLIC_SITE_URL=https://tarimpazar.com
NODE_ENV=production
```

---

### ADIM 4: Hosting'e Deploy

#### Seçenek A: SSH ile (Önerilen)

```bash
# 1. Hosting'e SSH ile bağlan
ssh username@yourhosting.com

# 2. Projeyi yükle
cd ~/public_html  # veya hosting'inizin belirttiği klasör
git clone https://github.com/yourusername/tarim-platform.git
cd tarim-platform

# 3. Dependencies yükle
npm install

# 4. Environment variables ayarla
nano .env
# DATABASE_URL ve diğer değişkenleri ekle
# Ctrl+X, Y, Enter ile kaydet

# 5. Prisma client generate
npx prisma generate

# 6. Database migration
npx prisma migrate deploy

# 7. Build
npm run build

# 8. PM2 ile başlat
npm install -g pm2
pm2 start npm --name "tarimpazar" -- start
pm2 save
pm2 startup
```

#### Seçenek B: cPanel Node.js App (varsa)

1. cPanel > "Node.js App"
2. "Create Application"
3. Node.js version: 18 veya üzeri
4. Application root: `/home/username/tarim-platform`
5. Application URL: `tarimpazar.com`
6. Application startup file: `server.js` (Next.js için `npm start` kullan)
7. Environment variables ekle:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_SITE_URL`
   - `NODE_ENV=production`
8. "Create" tıkla
9. Terminal'den:
   ```bash
   cd tarim-platform
   npm install
   npx prisma generate
   npx prisma migrate deploy
   npm run build
   ```

---

### ADIM 5: Domain ve SSL

1. Domain'i hosting'e bağla
2. SSL sertifikası aktif et (Let's Encrypt ücretsiz)
3. Domain'i Node.js app'e yönlendir

---

## 🔄 Güncelleme Yapmak İçin

```bash
ssh username@yourhosting.com
cd ~/public_html/tarim-platform
git pull
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart tarimpazar
```

---

## ⚡ ÖNERİ: Vercel Kullanın

Paylaşımlı hosting yerine **Vercel** kullanmanızı öneririm:

### Neden Vercel?
- ✅ Ücretsiz
- ✅ 5 dakikada deploy
- ✅ Otomatik SSL
- ✅ CDN dahil
- ✅ Next.js için optimize
- ✅ PostgreSQL kolay entegrasyon
- ✅ Her push'ta otomatik deploy

### Vercel Kurulumu:
```bash
# 1. GitHub'a push
git add .
git commit -m "Production ready"
git push

# 2. Vercel'e deploy
npm install -g vercel
vercel login
vercel --prod
```

Vercel dashboard'da:
1. PostgreSQL database ekle (Storage > Create Database)
2. Environment variables ekle
3. Domain bağla (opsiyonel)

---

## 📞 Destek

Sorun yaşarsanız:
1. Hosting sağlayıcınızla Node.js desteği olup olmadığını kontrol edin
2. PostgreSQL database için Supabase kullanın
3. Alternatif olarak Vercel/Railway kullanmayı düşünün



