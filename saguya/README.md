# Saguya Health

Yurt dışındaki hastaları Türkiye'deki **yetki belgeli** sağlık kuruluşlarıyla
buluşturan iki taraflı sağlık turizmi platformu.

> Proje kuralları ve yol haritası için `CLAUDE.md` dosyasına bakın.
> Şu anki durum: **Faz 0** — temel kurulum.

---

## Teknoloji

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS**
- **Supabase** (veritabanı, giriş, dosya, güvenlik)
- **Vercel** (yayın)

---

## Yerelde çalıştırma (geliştirici)

```bash
npm install
cp .env.local.example .env.local   # sonra değerleri doldurun
npm run dev
```

Tarayıcıda: http://localhost:3000

Diğer komutlar:

```bash
npm run build   # üretim derlemesi (yayından önce hata kontrolü)
npm run lint    # kod kontrolü
```

---

## Yücel için: canlıya alma adımları (Faz 0'ı bitirmek)

Kod hazır. Canlı bir URL için üç ücretsiz hesap ve birkaç tıklama gerekiyor.
Sırasıyla:

### 1) GitHub deposu

- Bu `saguya` klasörü kendi GitHub deposunda yaşamalı (Vercel'in en temiz
  çalışma şekli budur). Depoyu birlikte oluşturabiliriz.

### 2) Supabase projesi (veritabanı + giriş)

1. https://supabase.com → **New project**.
2. Proje oluşunca **Project Settings → API** sayfasına gidin.
3. Şu iki değeri kopyalayın:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** anahtarı → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Bu iki değeri hem yerelde `.env.local` dosyasına, hem de Vercel'e
   (aşağıda) ekleyeceğiz.

> **Güvenlik:** `service_role` (gizli) anahtarını hiçbir yere yapıştırmayın.
> Ona Faz 0'da ihtiyacımız yok.

### 3) Vercel'e yayınlama (canlı URL)

1. https://vercel.com → GitHub ile giriş → **Add New → Project**.
2. `saguya` deposunu seçin. Vercel Next.js'i otomatik tanır.
3. **Environment Variables** bölümüne yukarıdaki iki Supabase değerini girin.
4. **Deploy** → birkaç dakikada canlı URL hazır olur.

Bundan sonra her `git push` otomatik olarak siteyi günceller.

---

## Güvenlik notu

- `.env.local` ve tüm `.env*` dosyaları `.gitignore` ile korunur; API anahtarları
  **asla** git'e gönderilmez.
- Tüm tablolarda RLS (satır seviyesi güvenlik) Faz 1'den itibaren zorunludur.
