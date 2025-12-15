# Production Deployment Rehberi

## 🚨 ÖNEMLİ SORUNLAR VE ÇÖZÜMLERİ

### 1. SQLite Database Sorunu

**Sorun:** Projeniz SQLite kullanıyor. SQLite, production ortamlarında (özellikle Vercel, Netlify gibi serverless platformlarda) **ÇALIŞMAZ**.

**Neden:**
- Dosya sistemi read-only olabilir
- Her deployment'da veritabanı dosyası kaybolur
- Concurrent write sorunları olur

**Çözüm:** PostgreSQL'e geçmelisiniz.

#### Seçenekler:

**A) Vercel Postgres (Vercel kullanıyorsanız)**
1. Vercel dashboard'dan Postgres database oluşturun
2. `DATABASE_URL` otomatik olarak environment variable olarak eklenir

**B) Supabase (Ücretsiz tier mevcut)**
1. [supabase.com](https://supabase.com) hesabı oluşturun
2. Yeni proje oluşturun
3. Settings > Database > Connection string'i kopyalayın
4. `DATABASE_URL` olarak ekleyin

**C) Railway / Render / PlanetScale**
- Benzer şekilde PostgreSQL database oluşturup `DATABASE_URL` ekleyin

#### PostgreSQL'e Geçiş Adımları:

1. **Prisma Schema'yı güncelleyin:**
```prisma
datasource db {
  provider = "postgresql"  // "sqlite" yerine
  url      = env("DATABASE_URL")
}
```

2. **Migration oluşturun:**
```bash
npx prisma migrate dev --name init
```

3. **Production'da migration çalıştırın:**
```bash
npx prisma migrate deploy
```

### 2. Environment Variables

Production'da şu environment variables'ları eklemelisiniz:

```
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
NEXT_PUBLIC_GOOGLE_API_KEY=AIzaSyBQeCEU_ClbkvPpz2F46HwaZ79-jBrUtG8
NODE_ENV=production
```

**Vercel'de ekleme:**
- Settings > Environment Variables

**Netlify'da ekleme:**
- Site settings > Environment variables

### 3. File Uploads Sorunu

`public/uploads` klasöründeki dosyalar production'da kaybolur. Cloud storage kullanmalısınız:

**Seçenekler:**
- **Vercel Blob Storage** (Vercel kullanıyorsanız)
- **Cloudinary** (ücretsiz tier mevcut)
- **AWS S3**
- **Supabase Storage**

### 4. Build Scripts

`package.json`'a production build script'leri eklendi:
- `build`: Prisma generate + migrations + Next.js build
- `db:migrate`: Production migrations

## 📋 Deployment Checklist

- [ ] PostgreSQL database oluşturuldu
- [ ] `DATABASE_URL` environment variable eklendi
- [ ] `NEXT_PUBLIC_GOOGLE_API_KEY` environment variable eklendi
- [ ] Prisma schema `postgresql` olarak güncellendi
- [ ] Migrations production'da çalıştırıldı
- [ ] File upload için cloud storage entegre edildi
- [ ] Build başarılı oldu
- [ ] Production'da test edildi

## 🔧 Hızlı Düzeltme (Geçici Çözüm)

Eğer şimdilik hızlı bir çözüm istiyorsanız:

1. **Railway.app** kullanın (PostgreSQL + deployment birlikte)
2. Veya **Render.com** kullanın (PostgreSQL + Node.js deployment)

Her ikisi de SQLite yerine PostgreSQL kullanmanıza izin verir.

