#!/bin/bash
# DENK Sunucu Kurulum Scripti
# Kullanım: sudo bash setup.sh
# Ubuntu 22.04 LTS üzerinde test edilmiştir.

set -e
echo "=============================="
echo "  DENK Sunucu Kurulumu"
echo "=============================="

# ─── Sistem Güncellemesi ───
apt-get update -qq
apt-get install -y -qq python3.11 python3.11-venv python3-pip nginx postgresql postgresql-contrib curl git

# ─── Kullanıcı ───
id -u denk &>/dev/null || useradd -r -m -s /bin/bash denk

# ─── PostgreSQL ───
echo "PostgreSQL ayarlanıyor..."
PG_HBA=$(find /etc/postgresql -name pg_hba.conf | head -1)
sudo -u postgres psql -c "CREATE USER denk WITH PASSWORD 'GUCLU_SIFRE_BURAYA';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE denk OWNER denk;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE denk TO denk;"

# ─── Uygulama Dosyaları ───
mkdir -p /opt/denk /var/www/denk
chown denk:denk /opt/denk
cp -r ./backend /opt/denk/backend
chown -R denk:denk /opt/denk

# ─── Python Virtual Env ───
sudo -u denk python3.11 -m venv /opt/denk/backend/venv
sudo -u denk /opt/denk/backend/venv/bin/pip install -q --upgrade pip
sudo -u denk /opt/denk/backend/venv/bin/pip install -q -r /opt/denk/backend/requirements.txt

# ─── .env ─── (eğer yoksa örnek oluştur)
if [ ! -f /opt/denk/backend/.env ]; then
  cp /opt/denk/backend/.env.production /opt/denk/backend/.env
  echo ""
  echo "⚠️  /opt/denk/backend/.env dosyasını düzenle!"
  echo "   - SECRET_KEY, DATABASE_URL, SMTP, IYZICO değerlerini gir"
fi
chmod 640 /opt/denk/backend/.env
chown denk:denk /opt/denk/backend/.env

# ─── Frontend ───
cp ./frontend/index.html /var/www/denk/index.html
chown www-data:www-data /var/www/denk/index.html

# ─── Nginx ───
cp ./deploy/nginx.conf /etc/nginx/sites-available/denk
ln -sf /etc/nginx/sites-available/denk /etc/nginx/sites-enabled/denk
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# ─── Systemd ───
cp ./deploy/denk.service /etc/systemd/system/denk.service
systemctl daemon-reload
systemctl enable denk
systemctl start denk

# ─── Firewall ───
if command -v ufw &>/dev/null; then
  ufw allow 80/tcp
  ufw allow 443/tcp
  ufw allow 22/tcp
  echo "Firewall: 80, 443, 22 açıldı"
fi

echo ""
echo "=============================="
echo "  Kurulum Tamamlandı!"
echo "=============================="
echo "API: http://187.77.95.109/health"
echo "Servis: systemctl status denk"
echo "Log: journalctl -u denk -f"
echo ""
echo "SSL için (domain alındıktan sonra):"
echo "  apt install certbot python3-certbot-nginx"
echo "  certbot --nginx -d denk.app"
