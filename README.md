# NEXUS30 — Event Platform

Ro'yxatdan o'tish, saralash va check-in platformasi: **Ideaton → Hakaton → AI Startup
Kuni**. Olmazor tumani 14–30 yoshli yoshlari uchun 3 bosqichli tech-tadbir.

"Silk Road meets Circuit Board" — O'zbek geometrik naqshlari (girih) va tarmoq/tugun
(network/node) estetikasi birlashtirilgan, futuristik va sokin UI.

## Texnologik stack

| Qatlam | Texnologiya |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS 3 + custom design tokens |
| UI komponentlar | Qo'lda yozilgan shadcn/ui uslubidagi komponentlar (Radix UI primitivlari asosida) |
| Animatsiya | Framer Motion (signature "network-progress" elementi) |
| Formalar | react-hook-form + zod |
| Jadvallar | TanStack Table |
| ORM | Prisma 6 |
| Ma'lumotlar bazasi | PostgreSQL (Render.com Managed Postgres) |
| Autentifikatsiya | NextAuth.js (Credentials provider) |
| Excel eksport | exceljs |
| Hosting | Render.com (Web Service + PostgreSQL) |

> **Eslatma:** loyiha yaratilgan paytda Next.js'ning eng so'nggi versiyasi 16 va
> Tailwind'niki 4 edi, lekin ular hozircha ko'plab ekotizim vositalari
> (shadcn/ui'ning Radix-ga asoslangan klassik uslubi va boshqalar) bilan to'liq mos
> kelmagani uchun ataylab **Next.js 14 + Tailwind CSS 3**ga mahkamlandi — bu aynan
> texnik topshiriqda ko'rsatilgan stack.

## Loyiha tuzilishi

```
src/
  app/
    (dashboard)/          # login talab qiladigan sahifalar (nav bilan)
      volunteer/checkin/
      organizer/{dashboard,ideaton,hakaton,startup}/
      admin/{users,settings,export-all}/
    ideaton/ariza/        # ochiq forma
    hakaton/ariza/[token]/  # token orqali ochiladigan jamoa formasi
    startup/ariza/        # ochiq forma
    tasdiqlash/           # tasdiqlash sahifasi
    login/
    api/                  # barcha backend endpointlar
  components/
    ui/                   # UI primitivlar (Button, Input, Select, Dialog...)
    forms/                # 3 ta forma + FieldShell
    tables/                # TanStack Table asosidagi jadvallar
    network-progress.tsx  # signature animatsion element
  lib/                    # prisma client, validatsiya, auth, excel, rate-limit
prisma/
  schema.prisma
  seed.ts
```

## Ishga tushirish (lokal)

1. **Bog'liqliklarni o'rnatish**

   ```bash
   npm install
   ```

2. **Muhit o'zgaruvchilari** — `.env.example` faylidan nusxa oling:

   ```bash
   cp .env.example .env
   ```

   `DATABASE_URL`ni haqiqiy PostgreSQL ulanish satri bilan almashtiring (lokal
   Postgres yoki Render.com'dagi bazangiz). `NEXTAUTH_SECRET` uchun:

   ```bash
   openssl rand -base64 32
   ```

3. **Ma'lumotlar bazasini sozlash**

   ```bash
   npm run db:migrate   # migratsiyalarni yaratadi va qo'llaydi
   npm run db:seed       # treklar, sozlamalar va birinchi admin foydalanuvchini yaratadi
   ```

   Standart admin login: `.env`dagi `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`
   (standart: `admin@nexus30.uz` / `ChangeMe123!`). **Productionda darhol
   almashtiring.**

4. **Ishga tushirish**

   ```bash
   npm run dev
   ```

   http://localhost:3000 manzilida ochiladi.

## Render.com'ga deploy qilish

### Variant A — Blueprint (tavsiya etiladi)

1. GitHub'ga push qiling.
2. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint** → repongizni tanlang.
3. `render.yaml` avtomatik o'qiladi — **Apply** bosing.
4. `SEED_ADMIN_PASSWORD` uchun Render panelda kuchli parol kiriting.
5. Deploy tugagach, **Shell** ochib bir marta seed ishga tushiring:

   ```bash
   npm run db:seed
   ```

6. **Settings → Custom Domains** → `olmazor.nexus30.uz` qo'shing.
7. Eskiz.uz DNS: `CNAME olmazor → [Render bergan hostname]`.

### Variant B — Qo'lda Web Service

1. Render'da yangi **PostgreSQL** (Frankfurt) yoki mavjud bazadan `DATABASE_URL` oling.
2. **New Web Service** (Node):
    buildCommand: npm ci --include=dev && npm run build
   - Start: `npm run start:render`
   - Node: **20**
3. Environment variables:

   | O'zgaruvchi | Qiymat |
   |---|---|
   | `DATABASE_URL` | Postgres connection string |
   | `NEXTAUTH_SECRET` | `openssl rand -base64 32` natijasi |
   | `NEXTAUTH_URL` | `https://olmazor.nexus30.uz` |
   | `SEED_ADMIN_EMAIL` | admin email |
   | `SEED_ADMIN_PASSWORD` | kuchli parol (seed uchun) |
   | `SEED_ADMIN_NAME` | NEXUS30 Admin |

4. Deploy → Shell → `npm run db:seed` (bir marta).
5. Custom domain va DNS sozlang.

GitHub'ga push qilganda Render avtomatik qayta deploy qiladi.

## Rollar va kirish

| Rol | Kirish | Asosiy sahifa |
|---|---|---|
| Ishtirokchi | Login shart emas | `/ideaton/ariza`, `/startup/ariza` |
| Volontyor | `/login` | `/volunteer/checkin` |
| Tashkilotchi | `/login` | `/organizer/dashboard` |
| Admin | `/login` | `/organizer/dashboard` + `/admin/*` |

Rol asosidagi ruxsatlar `src/middleware.ts`da amalga oshirilgan — har bir yo'l
prefiksi (`/volunteer`, `/organizer`, `/admin`) faqat tegishli rollar uchun ochiq.

## Muhim texnik eslatmalar

- **Yosh validatsiyasi** — qattiq bloklanmaydi: `age_valid=false` bo'lsa ham ariza
  qabul qilinadi, lekin tashkilotchi jadvalida qizil belgi bilan ko'rsatiladi
  (`src/lib/validations.ts` — `isAgeValid`).
- **Rate limiting** — ochiq form endpointlari (`/api/ideaton`, `/api/startup`,
  `/api/hakaton/[token]`) IP bo'yicha daqiqasiga 5 ta so'rov bilan cheklangan
  (`src/lib/rate-limit.ts`). Bu xotirada saqlanadigan oddiy yechim — bitta Render
  instance uchun yetarli; ko'p instance holatida umumiy do'kon (Redis) kerak
  bo'ladi.
- **Hakaton taklif linklari** — `/organizer/hakaton` sahifasida "Yangi jamoa
  yaratish" tugmasi orqali yaratiladi, unikal token bilan (`/hakaton/ariza/[token]`).
- **Excel eksport** — har bir jadval sahifasidagi "Excel yuklab olish" tugmasi va
  `/admin/export-all` (3 varaqli to'liq eksport), status ranglari bilan
  formatlangan (`src/lib/excel.ts`).
- **Signature animatsiya** — `src/components/network-progress.tsx` — Framer
  Motion asosida, `prefers-reduced-motion`ni hurmat qiladi.

## Skriptlar

| Buyruq | Vazifa |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build (Prisma generate + Next.js) |
| `npm run start` | Production server |
| `npm run start:render` | Migratsiya + production server (Render start) |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Prisma migratsiyalarini yaratish/qo'llash (dev) |
| `npm run db:deploy` | Migratsiyalarni productionda qo'llash |
| `npm run db:seed` | Boshlang'ich ma'lumotlarni yuklash |
| `npm run db:studio` | Prisma Studio (ma'lumotlar bazasini vizual ko'rish) |

## Keyingi qadamlar (loyihadan tashqarida qolganlar)

- Telegram bot integratsiyasi (natijalar haqida avtomatik xabar yuborish) —
  hozircha tashkilotchilar qo'lda Telegram orqali xabar beradi.
- `audit_log` jadvali yozilmoqda, lekin uni ko'rish uchun alohida admin UI hali
  qo'shilmagan (kerak bo'lsa `npm run db:studio` orqali ko'rish mumkin).
