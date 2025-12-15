# 🚀 Vercel Deployment Rehberi

## ⚠️ ÖNEMLİ: SQLite → PostgreSQL Geçişi

Projeniz artık **PostgreSQL** kullanacak şekilde güncellendi. SQLite production'da çalışmaz!

## 📋 Adım Adım Deployment

### 1. Vercel Postgres Database Oluşturma

1. **Vercel Dashboard'a gidin:**
   - [vercel.com/dashboard](https://vercel.com/dashboard)
   - Projenizi seçin veya yeni proje oluşturun

2. **Storage sekmesine gidin:**
   - Sol menüden **Storage** sekmesine tıklayın
   - **Create Database** butonuna tıklayın
   - **Postgres** seçin
   - Database adını girin (örn: `tarim-platform-db`)
   - Region seçin (Avrupa için `fra1` önerilir)
   - **Create** butonuna tıklayın

3. **Connection String'i kopyalayın:**
   - Database oluşturulduktan sonra **.env.local** sekmesine gidin
   - `POSTGRES_PRISMA_URL` değerini kopyalayın
   - Bu değer otomatik olarak environment variable olarak eklenir

### 2. Environment Variables Ayarlama

Vercel Dashboard'da **Settings > Environment Variables** bölümüne gidin:

#### Gerekli Variables:

```
DATABASE_URL=postgresql://... (Vercel Postgres'ten otomatik eklenir)
POSTGRES_PRISMA_URL=postgresql://... (Vercel Postgres'ten otomatik eklenir)
POSTGRES_URL_NON_POOLING=postgresql://... (Vercel Postgres'ten otomatik eklenir)
NEXT_PUBLIC_GOOGLE_API_KEY=AIzaSyBQeCEU_ClbkvPpz2F46HwaZ79-jBrUtG8
NODE_ENV=production
```

**Not:** Vercel Postgres oluşturduğunuzda `DATABASE_URL` otomatik eklenir. Sadece `NEXT_PUBLIC_GOOGLE_API_KEY`'i manuel eklemeniz gerekiyor.

### 3. Local Development için .env Dosyası

Local'de çalıştırmak için `.env.local` dosyası oluşturun:

```bash
# Vercel Postgres connection string (Vercel dashboard'dan kopyalayın)
DATABASE_URL="postgresql://..."
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."

# Google API Key
NEXT_PUBLIC_GOOGLE_API_KEY=AIzaSyBQeCEU_ClbkvPpz2F46HwaZ79-jBrUtG8

# Node Environment
NODE_ENV=development
```

### 4. Database Migration

**İlk kez migration yapıyorsanız:**

```bash
# Local'de migration oluştur
npx prisma migrate dev --name init

# Production'da migration çalıştır (Vercel otomatik yapar, ama manuel de yapabilirsiniz)
npx prisma migrate deploy
```

**Vercel'de otomatik migration:**
- `package.json`'daki `build` script'i otomatik olarak `prisma migrate deploy` çalıştırır
- Her deployment'da migrations otomatik uygulanır

### 5. Vercel'e Deploy Etme

#### GitHub ile (Önerilen):

1. **GitHub'a push edin:**
   ```bash
   git add .
   git commit -m "PostgreSQL migration for Vercel"
   git push
   ```

2. **Vercel'e bağlayın:**
   - Vercel Dashboard > **Add New Project**
   - GitHub repository'nizi seçin
   - Framework: **Next.js** (otomatik algılanır)
   - Root Directory: `d3/tarim-platform` (eğer proje alt klasördeyse)
   - Environment Variables otomatik eklenir (Vercel Postgres'ten)
   - **Deploy** butonuna tıklayın

#### Vercel CLI ile:

```bash
# Vercel CLI yükleyin
npm i -g vercel

# Projeye gidin
cd d3/tarim-platform

# Deploy edin
vercel

# Production'a deploy
vercel --prod
```

### 6. Build Ayarları

Vercel otomatik olarak şunları yapar:
- ✅ `npm install` çalıştırır
- ✅ `npm run build` çalıştırır (Prisma generate + migrations + Next.js build)
- ✅ Environment variables'ları yükler

### 7. Database Seed (İsteğe Bağlı)

İlk deployment sonrası veri eklemek için:

```bash
# Local'de seed çalıştır
npx prisma db seed

# Veya Vercel'de seed script'i çalıştırmak için:
# Vercel Dashboard > Functions > Create Function
# Veya local'de seed yapıp production database'e bağlanın
```

## 🔧 Sorun Giderme

### Migration Hatası

Eğer migration hatası alırsanız:

```bash
# Local'de migration durumunu kontrol edin
npx prisma migrate status

# Migration'ı sıfırdan oluşturun (DİKKAT: Veri kaybı olabilir)
npx prisma migrate reset
npx prisma migrate dev --name init
```

### Connection String Hatası

- Vercel Dashboard'da **Storage > Postgres > .env.local** sekmesinden connection string'i kontrol edin
- Environment variables'ın doğru eklendiğinden emin olun

### Build Hatası

- Vercel build logs'u kontrol edin
- `package.json`'daki build script'inin doğru olduğundan emin olun
- Prisma client'ın generate edildiğinden emin olun

## 📁 Dosya Yüklemeleri için Vercel Blob Storage

`public/uploads` klasörü production'da çalışmaz. Vercel Blob Storage kullanın:

### 1. Vercel Blob Storage Oluşturma

1. Vercel Dashboard > **Storage** > **Create Database**
2. **Blob** seçin
3. Storage adını girin

### 2. Vercel Blob SDK Yükleme

```bash
npm install @vercel/blob
```

### 3. File Upload Kodunu Güncelleme

`app/actions/listing.ts` dosyasını güncelleyin (örnek kod DEPLOYMENT.md'de)

## ✅ Deployment Checklist

- [ ] Vercel Postgres database oluşturuldu
- [ ] Environment variables eklendi (DATABASE_URL otomatik, NEXT_PUBLIC_GOOGLE_API_KEY manuel)
- [ ] Local `.env.local` dosyası oluşturuldu
- [ ] Migration'lar çalıştırıldı (`npx prisma migrate dev`)
- [ ] GitHub'a push edildi
- [ ] Vercel'de deploy edildi
- [ ] Production'da test edildi
- [ ] File upload için Vercel Blob Storage eklendi (isteğe bağlı)

## 🎉 Başarılı Deployment Sonrası

Deployment başarılı olduktan sonra:
- Production URL'inizi kontrol edin
- Database bağlantısını test edin
- Login/Register işlemlerini test edin
- İlan oluşturma işlemlerini test edin

## 📞 Destek

Sorun yaşarsanız:
- Vercel build logs'unu kontrol edin
- Vercel Dashboard > Storage > Postgres > Logs'u kontrol edin
- Prisma migration status'unu kontrol edin

