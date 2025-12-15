# Paylaşımlı Hosting Deployment Adımları

## ⚠️ ÖNEMLİ UYARI

Next.js uygulamaları **çoğu paylaşımlı hosting'de çalışmaz** çünkü:
- Node.js runtime gerektirir (çoğu paylaşımlı hosting'de yok)
- Server-side rendering (SSR) gerekir
- Build process gerektirir
- Sürekli çalışan bir process gerekir

## ✅ ÖNERİLEN: Vercel (5 Dakikada Deploy)

**En kolay ve ücretsiz çözüm:**

```bash
# 1. GitHub'a push edin
git add .
git commit -m "Production ready"
git push origin main

# 2. Vercel'e deploy
npm install -g vercel
vercel login
vercel --prod
```

**Vercel Dashboard'da:**
1. PostgreSQL database ekleyin (Storage > Create Database)
2. Environment variables ekleyin:
   - `DATABASE_URL` (Vercel Postgres otomatik ekler)
   - `NEXT_PUBLIC_SITE_URL=https://tarimpazar.com`
   - `NODE_ENV=production`

## 🔧 Eğer Paylaşımlı Hosting Kullanacaksanız

### Gereksinimler:
- ✅ Node.js 18+ desteği
- ✅ PM2 veya process manager
- ✅ PostgreSQL database (ayrı sunucuda olabilir)
- ✅ SSH erişimi
- ✅ Git desteği

### Adım 1: PostgreSQL Database Oluştur

**Ücretsiz seçenekler:**

**A) Supabase (ÖNERİLEN)**
1. [supabase.com](https://supabase.com) hesap oluştur
2. Yeni proje oluştur
3. Settings > Database > Connection string kopyala
4. Format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

**B) Railway PostgreSQL**
- Ücretsiz PostgreSQL
- [railway.app](https://railway.app) > New Project > Database

**C) Render PostgreSQL**
- Ücretsiz PostgreSQL
- [render.com](https://render.com) > New PostgreSQL

### Adım 2: Schema'yı PostgreSQL'e Güncelle

`prisma/schema.prisma` dosyasında:
```prisma
datasource db {
  provider = "postgresql"  // "sqlite" yerine
  url      = env("DATABASE_URL")
}
```

### Adım 3: Environment Variables Hazırla

`.env.production` dosyası oluştur:
```env
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
NEXT_PUBLIC_SITE_URL=https://tarimpazar.com
NODE_ENV=production
```

### Adım 4: Build ve Deploy

**SSH ile hosting'e bağlan:**

```bash
# 1. Projeyi yükle
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
pm2 start npm --name "tarimpazar" -- start
pm2 save
pm2 startup
```

**cPanel Node.js App (varsa):**
1. Node.js App oluştur
2. App root: `/home/username/tarim-platform`
3. Startup file: `server.js` (Next.js için `npm start` kullan)
4. Environment variables ekle

### Adım 5: Domain Ayarları

1. Domain'i hosting'e bağla
2. SSL sertifikası aktif et (Let's Encrypt ücretsiz)
3. Domain'i Node.js app'e yönlendir

## 📋 Checklist

- [ ] PostgreSQL database oluşturuldu
- [ ] Schema PostgreSQL'e güncellendi
- [ ] Environment variables ayarlandı
- [ ] Build test edildi (`npm run build`)
- [ ] Production'da migration çalıştırıldı
- [ ] PM2 veya process manager kuruldu
- [ ] Domain bağlandı
- [ ] SSL aktif

## 💡 Alternatif: Static Export (Sınırlı Özellikler)

Eğer hosting Node.js desteklemiyorsa, sadece static HTML export:

**Sorun:** 
- Server actions çalışmaz
- API routes çalışmaz
- Login/Register çalışmaz
- Sadece görüntüleme sayfaları

**Kullanım:** Sadece static sayfalar için uygun.

## 🚀 Hızlı Çözüm: Vercel

**Neden Vercel?**
- ✅ Ücretsiz
- ✅ 5 dakikada deploy
- ✅ Otomatik SSL
- ✅ CDN dahil
- ✅ Next.js için optimize
- ✅ PostgreSQL kolay entegrasyon
- ✅ Her push'ta otomatik deploy

**Kurulum:**
1. GitHub'a push
2. Vercel'e bağla
3. PostgreSQL ekle
4. Domain bağla (opsiyonel)



