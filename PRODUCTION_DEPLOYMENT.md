# Production Deployment Rehberi

## ⚠️ Paylaşımlı Hosting Uyarısı

**ÖNEMLİ:** Next.js uygulamaları paylaşımlı hosting'de genellikle **çalışmaz** çünkü:
- Node.js desteği gerekir (çoğu paylaşımlı hosting'de yok)
- Server-side rendering (SSR) gerekir
- Build process gerektirir
- Sürekli çalışan bir server gerekir

## ✅ Önerilen Platformlar (Ücretsiz/Ücretli)

### 1. **Vercel** (EN KOLAY - ÖNERİLEN) ⭐
- ✅ Next.js'in yaratıcıları tarafından yapılmış
- ✅ Ücretsiz tier mevcut
- ✅ Otomatik deployment
- ✅ PostgreSQL desteği (Vercel Postgres)
- ✅ CDN ve optimizasyonlar dahil

**Kurulum:**
```bash
npm install -g vercel
vercel login
vercel
```

**Adımlar:**
1. GitHub'a kodunuzu push edin
2. Vercel'e bağlayın (GitHub ile otomatik)
3. Environment variables ekleyin
4. PostgreSQL database ekleyin (Vercel Postgres)

### 2. **Railway** (Kolay)
- ✅ Ücretsiz $5 kredi (aylık)
- ✅ PostgreSQL + App birlikte
- ✅ Otomatik deployment
- ✅ Kolay kurulum

**Kurulum:**
1. [railway.app](https://railway.app) hesabı oluştur
2. "New Project" > "Deploy from GitHub repo"
3. PostgreSQL ekle
4. Environment variables ayarla

### 3. **Render** (Ücretsiz)
- ✅ Ücretsiz tier (yavaş olabilir)
- ✅ PostgreSQL desteği
- ✅ Otomatik deployment

**Kurulum:**
1. [render.com](https://render.com) hesabı oluştur
2. "New Web Service" > GitHub repo seç
3. PostgreSQL database ekle
4. Environment variables ayarla

### 4. **DigitalOcean App Platform**
- ✅ $5/ay (daha stabil)
- ✅ Kolay kurulum
- ✅ PostgreSQL desteği

## 🔧 Production'a Hazırlık

### Adım 1: PostgreSQL'e Geçiş

**Şu anki durum:** SQLite kullanıyor (production için uygun değil)

**Çözüm:**
1. PostgreSQL database oluştur (Supabase, Railway, Render vb.)
2. Connection string al
3. Schema'yı PostgreSQL'e göre güncelle

### Adım 2: Environment Variables

`.env.production` dosyası oluştur:
```env
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NODE_ENV=production
```

### Adım 3: Schema Güncelleme

`prisma/schema.prisma` dosyasında:
```prisma
datasource db {
  provider = "postgresql"  // "sqlite" yerine
  url      = env("DATABASE_URL")
}
```

### Adım 4: File Uploads

`public/uploads` klasörü production'da kaybolur. Çözüm:
- **Cloudinary** (ücretsiz tier)
- **AWS S3**
- **Supabase Storage**
- **Vercel Blob Storage**

## 📦 Paylaşımlı Hosting İçin Alternatif

Eğer **mutlaka** paylaşımlı hosting kullanacaksanız:

### Seçenek 1: Static Export (ÖNERİLMİZ)
Next.js'i static HTML'e export edin (SSR özellikleri çalışmaz):
```bash
npm run build
```

**Sorun:** Server actions, API routes çalışmaz. Sadece static sayfalar.

### Seçenek 2: Node.js Destekli Hosting
- **cPanel Node.js** (varsa)
- **Hostinger Node.js Hosting**
- **A2 Hosting Node.js**

**Gereksinimler:**
- Node.js 18+ desteği
- PM2 veya benzeri process manager
- PostgreSQL database (ayrı olarak)

## 🚀 Hızlı Deployment (Vercel Önerilir)

```bash
# 1. GitHub'a push
git add .
git commit -m "Production ready"
git push

# 2. Vercel'e deploy
npm install -g vercel
vercel

# 3. Environment variables ekle (Vercel dashboard'dan)
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app

# 4. PostgreSQL database ekle (Vercel Postgres)
# Vercel dashboard > Storage > Create Database
```

## 📋 Checklist

- [ ] PostgreSQL database oluşturuldu
- [ ] Schema PostgreSQL'e güncellendi
- [ ] Environment variables ayarlandı
- [ ] File uploads için cloud storage ayarlandı
- [ ] Build test edildi (`npm run build`)
- [ ] Production'da migration çalıştırıldı
- [ ] SSL sertifikası aktif (otomatik Vercel/Railway'de)
- [ ] Domain bağlandı (opsiyonel)

## 💡 Tavsiye

**En kolay ve hızlı çözüm:** **Vercel** kullanın
- 5 dakikada deploy
- Ücretsiz
- Next.js için optimize edilmiş
- PostgreSQL desteği kolay

**Alternatif:** Railway veya Render (benzer kolaylıkta)

**Paylaşımlı hosting:** Sadece Node.js desteği olan ve PostgreSQL sunabilen yerlerde mümkün.



