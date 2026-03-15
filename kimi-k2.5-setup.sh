#!/bin/bash

# Kimi-k2.5 OpenClaw Setup Script
# macOS Ventura için

set -e

echo "🚀 Kimi-k2.5 Setup Başlanıyor..."

# Renkli output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check dependencies
echo -e "${BLUE}[1/5]${NC} Bağımlılıklar kontrol ediliyor..."
command -v openclaw >/dev/null 2>&1 || { echo "❌ OpenClaw kurulu değil"; exit 1; }
echo -e "${GREEN}✓ OpenClaw bulundu${NC}"

# 2. Check .env file
echo -e "${BLUE}[2/5]${NC} Environment dosyası kontrol ediliyor..."
if [ ! -f .env ]; then
    cp .env.template .env
    echo -e "${YELLOW}⚠ .env oluşturuldu. Lütfen MOONSHOT_API_KEY'ni ekle:${NC}"
    echo -e "   nano .env"
    exit 1
fi
echo -e "${GREEN}✓ .env dosyası bulundu${NC}"

# 3. Create necessary directories
echo -e "${BLUE}[3/5]${NC} Gerekli dizinler oluşturuluyor..."
mkdir -p .openclaw/cache
mkdir -p logs
mkdir -p memory
echo -e "${GREEN}✓ Dizinler hazırlandı${NC}"

# 4. Test API connection
echo -e "${BLUE}[4/5]${NC} API bağlantısı test ediliyor..."

# .env'den API key'i yükle
source .env

if [ -z "$MOONSHOT_API_KEY" ]; then
    echo -e "${YELLOW}⚠ MOONSHOT_API_KEY boş. .env dosyasını güncelle${NC}"
    exit 1
fi

API_TEST=$(curl -s -X POST https://api.moonshot.cn/v1/chat/completions \
  -H "Authorization: Bearer $MOONSHOT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "moonshot-v1-8k", "messages": [{"role": "user", "content": "Merhaba"}]}' \
  -w "\n%{http_code}" 2>/dev/null | tail -1)

if [ "$API_TEST" = "200" ]; then
    echo -e "${GREEN}✓ API bağlantısı başarılı${NC}"
else
    echo -e "${YELLOW}⚠ API bağlantısı başarısız (HTTP $API_TEST)${NC}"
    echo "   API key'i kontrol et ve tekrar dene"
    exit 1
fi

# 5. Verify config
echo -e "${BLUE}[5/5]${NC} Konfigürasyon doğrulanıyor..."
if [ -f .openclaw/config.json ]; then
    echo -e "${GREEN}✓ Config dosyası bulundu${NC}"
else
    echo -e "${YELLOW}⚠ Config dosyası bulunamadı${NC}"
    exit 1
fi

# Final message
echo ""
echo -e "${GREEN}✅ Kimi-k2.5 setup tamamlandı!${NC}"
echo ""
echo "🎯 Sonraki adımlar:"
echo "   1. OpenClaw'u başlat:"
echo "      openclaw --config .openclaw/config.json"
echo ""
echo "   2. Test et:"
echo "      echo 'Merhaba, Kimi-k2.5!' | openclaw chat"
echo ""
echo "📊 macOS RAM Optimizasyonu:"
echo "   Sistem RAM: 24GB"
echo "   Önerilen OpenClaw RAM: 8GB"
echo "   Komutu çalıştır:"
echo "      OPENCLAW_MEMORY_LIMIT=8GB openclaw --config .openclaw/config.json"
echo ""
echo "📝 Loglar: ./logs/openclaw.log"
echo ""
