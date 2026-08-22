# Saguya Health — Hostinger VPS Kurulum Kılavuzu

Bu kılavuz, siteyi Hostinger VPS'inizde **canlıya almak** içindir.
İlk kurulum bir kez yapılır; sonrasında her güncelleme tek komuttur.

> Gerekenler: Hostinger **VPS** planı (paylaşımlı hosting değil) ve SSH erişimi.
> Komutları sunucuya SSH ile bağlanıp çalıştırırsınız. Takıldığınız her adımda
> bana çıktıyı yapıştırın, birlikte ilerleriz.

---

## 0) Sunucuya bağlanma

Hostinger panelinden VPS'inizin **IP adresi** ve **root şifresi** vardır.
Bilgisayarınızdan:

```bash
ssh root@SUNUCU_IP_ADRESI
```

---

## 1) Gerekli yazılımlar (bir kez)

```bash
# Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx

# Sürüm kontrolü
node -v    # v20.x görmelisiniz
```

---

## 2) Kodu sunucuya indirme (bir kez)

```bash
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/Yahoza520/saguya.git
sudo chown -R $USER:$USER /var/www/saguya
cd /var/www/saguya
```

> Depo **gizli (private)** olduğu için git kullanıcı adı/şifre (veya kişisel
> erişim jetonu) isteyebilir. Takılırsanız bana söyleyin.

---

## 3) Ortam değişkenleri (Supabase anahtarları)

```bash
cp .env.local.example .env.local
nano .env.local
```

Açılan dosyaya Supabase'ten aldığınız iki değeri yazın, kaydedin
(`Ctrl+O`, `Enter`, `Ctrl+X`):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## 4) İlk derleme ve servis (bir kez)

```bash
cd /var/www/saguya
npm ci
npm run build
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static

# Uygulamayı sürekli çalışır servis yap:
sudo cp deploy/saguya.service /etc/systemd/system/saguya.service
sudo systemctl daemon-reload
sudo systemctl enable --now saguya
sudo systemctl status saguya      # "active (running)" görmelisiniz
```

Bu noktada uygulama sunucunun içinde `127.0.0.1:3000` portunda çalışıyor.

---

## 5) nginx ile dışarı açma (bir kez)

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/saguya
# Dosyadaki server_name satırını kendi alan adınızla değiştirin:
sudo nano /etc/nginx/sites-available/saguya

sudo ln -s /etc/nginx/sites-available/saguya /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Alan adınızı (veya sunucu IP'sini) tarayıcıda açınca "Yakında" sayfasını
görmelisiniz. 🎉

---

## 6) HTTPS / SSL sertifikası (alan adı bağlıysa)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d saguya.com -d www.saguya.com
```

---

## Bundan sonra: güncelleme (her seferinde tek komut)

Kodda bir değişiklik yapıp GitHub'a gönderdiğimde, siz sunucuda şunu çalıştırın:

```bash
cd /var/www/saguya && ./deploy/deploy.sh
```

---

## Güvenlik hatırlatmaları

- `.env.local` dosyası sunucuda kalır, **asla** git'e gönderilmez.
- `service_role` gizli Supabase anahtarını buraya koymayın (Faz 0'da gerekmez).
- Sunucu güvenlik duvarında yalnızca 80, 443 ve SSH (22) portları açık olsun.
