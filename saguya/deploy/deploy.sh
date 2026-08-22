#!/usr/bin/env bash
# Saguya Health — Hostinger VPS güncelleme/dağıtım scripti
#
# Ne yapar: son kodu çeker, bağımlılıkları kurar, üretim derlemesi yapar,
# standalone sunucunun ihtiyaç duyduğu statik dosyaları yerine kopyalar ve
# servisi yeniden başlatır.
#
# İlk kurulumdan sonra her güncellemede tek komut:
#   cd /var/www/saguya && ./deploy/deploy.sh
#
# (İlk kurulum adımları için deploy/DEPLOY.md dosyasına bakın.)

set -euo pipefail

APP_DIR="/var/www/saguya"
cd "$APP_DIR"

echo "==> Son kod çekiliyor (git pull)"
git pull --ff-only

echo "==> Bağımlılıklar kuruluyor (npm ci)"
npm ci

echo "==> Üretim derlemesi (npm run build)"
npm run build

echo "==> Statik dosyalar standalone sunucunun yanına kopyalanıyor"
# standalone sunucu, statik dosyaları kendi dizinine göre arar:
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static

echo "==> Servis yeniden başlatılıyor"
sudo systemctl restart saguya

echo "==> Bitti. Durum:"
sudo systemctl --no-pager status saguya | head -n 5
