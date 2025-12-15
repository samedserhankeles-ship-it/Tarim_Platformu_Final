# TarımPazar Projesi - Teknik Altyapı

## 🏗️ PROJE ALTYAPISI

### Frontend Framework
- **Next.js 16.0.8** (App Router)
  - Server-Side Rendering (SSR)
  - Server Components
  - Server Actions
  - API Routes

### UI Framework
- **React 19.2.1**
- **TypeScript 5**

### Styling
- **Tailwind CSS 4**
- **CSS Variables** (Custom themes)
- **Responsive Design** (Mobile-first)

### UI Components
- **Radix UI** (Headless components)
  - Dialog, Dropdown, Select, Toast, Avatar, vb.
- **Shadcn UI** (Component library)
- **Lucide React** (Icons)

### Database & ORM
- **Prisma ORM 5.10.0**
- **Development:** SQLite
- **Production:** PostgreSQL (gerekli)

### Authentication
- **Custom Session-based Auth**
- **bcryptjs** (Şifre hashleme)
- **Cookie-based sessions**

### Form Management
- **React Hook Form 7.68.0**
- **Zod 4.1.13** (Validation)
- **@hookform/resolvers**

### Data Visualization
- **Recharts 3.5.1** (Charts & Graphs)

### State Management
- **Zustand 5.0.9** (Client state)

### Utilities
- **date-fns 4.1.0** (Date formatting)
- **query-string 9.3.1** (URL query parsing)
- **clsx** (Class utilities)
- **tailwind-merge** (Tailwind class merging)

### Notifications
- **Sonner 2.0.7** (Toast notifications)

### Development Tools
- **ESLint 9**
- **TypeScript**
- **tsx** (TypeScript execution)

---

## 📦 DEPLOYMENT GEREKSINIMLERI

### Runtime
- **Node.js 18+** (gerekli)
- **npm** veya **yarn** veya **pnpm**

### Database
- **PostgreSQL** (production için zorunlu)
  - Supabase (önerilen - ücretsiz)
  - Railway PostgreSQL
  - Render PostgreSQL
  - Vercel Postgres

### Environment Variables
```
DATABASE_URL=postgresql://user:password@host:5432/database
NEXT_PUBLIC_SITE_URL=https://tarimpazar.com
NODE_ENV=production
```

### File Storage
- **Local:** `public/uploads/` (development)
- **Production:** Cloud storage gerekli
  - Cloudinary (önerilen - ücretsiz tier)
  - AWS S3
  - Vercel Blob Storage
  - Supabase Storage

---

## 🎯 DEPLOYMENT PLATFORM ÖNERİLERİ

### 1. ⭐ Vercel (EN İYİ SEÇENEK)
- ✅ Next.js için optimize edilmiş
- ✅ Ücretsiz tier
- ✅ Otomatik deployment
- ✅ PostgreSQL desteği
- ✅ CDN dahil

### 2. Railway
- ✅ Kolay kurulum
- ✅ PostgreSQL entegrasyonu
- ✅ Ücretsiz $5 kredi/ay

### 3. Render
- ✅ Ücretsiz tier mevcut
- ✅ PostgreSQL desteği

### 4. Paylaşımlı Hosting
- ❌ **ÇALIŞMAZ** (çoğu paylaşımlı hosting'de)
- ⚠️ Node.js destekliyorsa çalışabilir (zor)

---

## 📊 PROJE ÖZELLİKLERİ

### Server-Side Features
- ✅ Server Actions (authentication, data mutations)
- ✅ Server Components (data fetching)
- ✅ API Routes
- ✅ Middleware (authentication)

### Client-Side Features
- ✅ Interactive UI components
- ✅ Form handling
- ✅ Real-time updates
- ✅ Charts & graphs

### Database Models
- User (authentication, profiles)
- Product (ürün ilanları)
- JobPosting (iş ilanları)
- Message (mesajlaşma)
- Conversation (sohbetler)
- Favorite (favoriler)
- Report (şikayetler)
- Notification (bildirimler)
- Announcement (duyurular)

---

## 🚀 BUILD & START SCRIPTS

```bash
# Development
npm run dev

# Production Build
npm run build

# Production Start
npm start

# Database Migration
npm run db:migrate

# Database Push (development)
npm run db:push
```

---

## 📝 ÖZET

**Proje Türü:** Full-stack Next.js web application
**Architecture:** Server-side rendering + Client-side interactivity
**Database:** SQLite (dev) → PostgreSQL (production)
**Styling:** Tailwind CSS 4
**Components:** Radix UI + Shadcn UI
**Auth:** Custom session-based
**Deployment:** Vercel önerilir (ücretsiz, kolay)

**Gereksinimler:**
- Node.js 18+
- PostgreSQL (production)
- Cloud storage (production)



