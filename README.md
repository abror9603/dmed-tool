# DMED Tool (SDG)

DMED Tool — klinikalar, laboratoriyalar va tibbiy hodisalarni boshqarish uchun mo‘ljallangan veb-platforma. Tizim DMED milliy sog‘liqni saqlash ekotizimi bilan integratsiya qilinadi: bemor chiqishi aniqlanganda oilaviy shifokorga SMS orqali xabar yuboriladi.

## Loyiha tuzilmasi

```
sdg/
├── README.md          # Ushbu hujjat
└── frontend/          # Vue 3 + Vite frontend ilovasi
    ├── src/           # Manba kodlar
    ├── public/        # Statik fayllar
    ├── server/        # Auth cookie yordamchi modullari
    ├── vite-plugins/  # Dev server API proxy
    └── .env.development
```

## Texnologiyalar

| Qatlam | Texnologiya |
|--------|-------------|
| UI | Vue 3, TypeScript, Tailwind CSS |
| Holat boshqaruvi | Pinia |
| Marshrutlash | Vue Router |
| HTTP | Axios |
| Til | vue-i18n (o‘zbek, rus, ingliz) |
| Build | Vite 8 |

## Ishga tushirish

```bash
cd frontend
npm install
npm run dev
```

Brauzerda ochiladi: `http://localhost:5173`

Boshqa buyruqlar:

```bash
npm run build        # Production build
npm run preview      # Build natijasini ko‘rish
npm run type-check   # TypeScript tekshiruvi
```

## Kirish ma’lumotlari (admin)

| Maydon | Qiymat |
|--------|--------|
| Login | `+998994059000` |
| Parol | `1+1=11` |

Kirish sahifasi: `/login`  
Muvaffaqiyatli kirgandan so‘ng: `/admin/dashboard`

## Ilova qanday ishlaydi

### 1. Umumiy oqim

```
Foydalanuvchi → Vue ilova (brauzer)
                    ↓
              Vite dev proxy (localhost)
                    ↓
              Backend API (ngrok / server)
                    ↓
              DMED ekotizimi
```

### 2. Autentifikatsiya

Login jarayoni HttpOnly cookie asosida ishlaydi — JWT token brauzer JavaScript orqali o‘qilmaydi.

1. Foydalanuvchi `/login` sahifasida login va parol kiritadi.
2. So‘rov `POST /sdg/uz/login` ga yuboriladi.
3. Vite proxy tokenni HttpOnly cookie ga yozadi.
4. Keyingi barcha API so‘rovlarida proxy avtomatik `Authorization: Bearer ...` header qo‘shadi.
5. Admin sahifalariga kirish uchun `meta.requiresAuth` guard sessiyani tekshiradi.

Chiqish: sidebar pastidagi tugma → cookie tozalanadi → `/login` ga qaytadi.

### 3. API so‘rovlari (development)

Development rejimida barcha `/api/*` va `/sdg/*` so‘rovlari avval `localhost` ga, keyin Vite proxy orqali backendga yo‘naltiriladi.

Backend manzili `frontend/.env.development` faylida:

```env
VITE_API_URL=https://....ngrok-free.app
VITE_AUTH_COOKIE_PROXY=true
```

**Muhim:** Sozlamalar → API URL maydoni faqat ko‘rsatish uchun. Developmentda haqiqiy so‘rovlar `.env` dagi `VITE_API_URL` orqali ketadi.

### 4. Sahifalar

#### Ommaviy qism

| URL | Vazifa |
|-----|--------|
| `/` | Landing — mahsulot haqida ma’lumot |
| `/docs/:section` | API hujjatlari |
| `/login` | Admin kirish |

#### Admin panel (`/admin/*`)

| Bo‘lim | URL | Vazifa |
|--------|-----|--------|
| Bosh sahifa | `/admin/dashboard` | Statistika va grafikalar |
| Arizalar | `/admin/applications` | Klinika/lab arizalarini tasdiqlash |
| Klinikalar | `/admin/clinics` | Klinikalar CRUD, secret key |
| Laboratoriya | `/admin/labs` | Laboratoriyalar boshqaruvi |
| Foydalanuvchilar | `/admin/users` | Tizim foydalanuvchilari |
| Sozlamalar | `/admin/settings` | API URL, SMS testlash |

### 5. Klinika integratsiyasi

Har bir faol klinikada **secret key** (`X-Secret-Key`) mavjud. Bu kalit orqali klinika tizimga tibbiy hodisa yuboradi.

Asosiy endpoint:

```
POST /api/v1/medical-events/intake
Headers: Authorization (JWT), X-Secret-Key
Body: { jshshir, diagnosis, conclusion }
```

Backend DMEDda bemorni qidiradi va uning oilaviy shifokoriga SMS yuboradi.

### 6. Testlash bo‘limi (Sozlamalar)

Admin panel → **Sozlamalar** → **Testlash** bo‘limi SMS yuborishni sinash uchun.

**Kerakli maydonlar:**

- **X-Secret-Key** — klinika secret key (qo‘lda kiritiladi)
- **Tashxis** — diagnosis
- **Xulosa** — conclusion
- **JSHSHIR** — har bir test shaxs uchun alohida (DMEDda ro‘yxatdan o‘tgan bemor)

**Test qabul qiluvchilar:**

| Ism | JSHSHIR (default) |
|-----|-------------------|
| Jo'rabek Toshbekov | `12345678901234` |
| Avazov Abror | `98765432109876` |
| Javohir Boyaliyev | `11223344556677` |
| Javlon Abduvahobov | `22334455667788` |

**Mumkin bo‘lgan xatolar:**

| Kod | Sabab |
|-----|-------|
| `KEY_NOT_FOUND` | Secret key serverda topilmadi (login sessiyasi emas) |
| `PATIENT_NOT_IN_DMED` | JSHSHIR DMED bazasida yo‘q |

### 7. Kod tuzilmasi (`frontend/src/`)

```
src/
├── components/     # UI komponentlar (admin, layout, forms)
├── composables/    # Qayta ishlatiladigan Vue composable'lar
├── config/         # Ilova konstantalari
├── i18n/           # Tarjimalar (uz, ru, en)
├── layouts/        # Admin layout
├── router/         # Marshrutlar va auth guard
├── services/       # API qatlami (auth, clinics, labs, sms, ...)
├── stores/         # Pinia store'lar
├── types/          # TypeScript tiplar
├── utils/          # Yordamchi funksiyalar
└── views/          # Sahifa komponentlari
```

### 8. Muhit o‘zgaruvchilari

| O‘zgaruvchi | Vazifa |
|-------------|--------|
| `VITE_API_URL` | Backend server manzili (proxy uchun) |
| `VITE_AUTH_COOKIE_PROXY` | `true` — same-origin cookie proxy rejimi |

Ngrok tunneli qayta ishga tushganda manzil o‘zgarishi mumkin — `frontend/.env.development` dagi `VITE_API_URL` ni yangilang va dev serverni qayta ishga tushiring.

## Til

Ilova uch tilda: **o‘zbek** (default), rus, ingliz. Til tanlovi headerda saqlanadi (`localStorage`).

## Node.js versiyasi

```
^22.18.0 yoki >=24.12.0
```
