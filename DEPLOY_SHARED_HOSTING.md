# Paylaşımlı Hosting Deployment Rehberi

## ⚠️ ÖNEMLİ NOT

Next.js uygulamaları **genellikle paylaşımlı hosting'de çalışmaz** çünkü:
- Node.js runtime gerektirir
- Server-side rendering (SSR) gerekir
- Build process gerektirir
- Sürekli çalışan process gerekir

## 🔍 Hosting Kontrolü

Paylaşımlı hosting'inizde şunları kontrol edin:

### ✅ Gereksinimler
1. **Node.js desteği** (18+ sürüm)
2. **PM2** veya process manager
3. **PostgreSQL** database (ayrı sunucuda olabilir)
4. **SSH erişimi** (build için)
5. **Git** desteği

### ❌ Desteklemiyorsa
Alternatif platformlar kullanın:
- Vercel (ücretsiz, en kolay)
- Railway (ücretsiz kredi)
- Render (ücretsiz tier)

## 📋 Eğer Node.js Destekliyorsa

### Adım 1: PostgreSQL Database Oluştur

Paylaşımlı hosting'de genellikle PostgreSQL yok. Ücretsiz alternatifler:

**A) Supabase (ÖNERİLEN)**
1. [supabase.com](https://supabase.com) hesap oluştur
2. Yeni proje oluştur
3. Settings > Database > Connection string kopyala
4. Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

**B) Railway PostgreSQL**
- Ücretsiz PostgreSQL database
- Connection string otomatik verilir

**C) Render PostgreSQL**
- Ücretsiz PostgreSQL
- Kolay kurulum

### Adım 2: Schema'yı PostgreSQL'e Güncelle

`prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Adım 3: Environment Variables

Hosting panelinde veya `.env.production`:
```env
DATABASE_URL=postgresql://user:password@host:5432/database
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NODE_ENV=production
```

### Adım 4: Build ve Deploy

**SSH ile:**
```bash
# 1. Projeyi yükle (Git veya FTP)
git clone your-repo-url
cd tarim-platform

# 2. Dependencies yükle
npm install

# 3. Prisma client generate
npx prisma generate

# 4. Database migration
npx prisma migrate deploy

# 5. Build
npm run build

# 6. PM2 ile başlat
npm install -g pm2
pm2 start npm --name "tarim-platform" -- start
pm2 save
pm2 startup
```

**cPanel Node.js App (varsa):**
1. Node.js App oluştur
2. App root: `/home/username/tarim-platform`
3. Startup file: `server.js` (Next.js için gerekli değil, `npm start` kullan)
4. Environment variables ekle

### Adım 5: File Uploads

`public/uploads` klasörü paylaşımlı hosting'de sorun çıkarabilir.

**Çözüm: Cloudinary (Ücretsiz)**
1. [cloudinary.com](https://cloudinary.com) hesap oluştur
2. API keys al
3. Image upload kodunu güncelle

## 🔄 Alternatif: Static Export (Sınırlı)

Eğer hosting Node.js desteklemiyorsa, sadece static HTML export:

**Sorun:** 
- Server actions çalışmaz
- API routes çalışmaz
- Dynamic routes sınırlı
- Login/Register çalışmaz

**Kullanım:** Sadece static sayfalar için uygun.

## 💰 Hosting Fiyatları (Node.js Destekli)

- **Hostinger Node.js:** ~$4-6/ay
- **A2 Hosting:** ~$6-9/ay
- **DigitalOcean Droplet:** ~$6/ay
- **VPS (Hetzner, Contabo):** ~$4-6/ay

## ⚡ ÖNERİ: Vercel Kullanın

Paylaşımlı hosting yerine **Vercel** kullanmanızı öneririm:

### Neden Vercel?
- ✅ Ücretsiz
- ✅ 5 dakikada deploy
- ✅ Otomatik SSL
- ✅ CDN dahil
- ✅ Next.js için optimize
- ✅ PostgreSQL kolay entegrasyon

### Vercel Kurulumu
```bash
npm install -g vercel
vercel login
vercel --prod
```

GitHub'a bağlarsanız her push'ta otomatik deploy olur.

## 📞 Destek

Sorun yaşarsanız:
1. Hosting sağlayıcınızla Node.js desteği olup olmadığını kontrol edin
2. PostgreSQL database için Supabase kullanın
3. Alternatif olarak Vercel/Railway kullanmayı düşünün



