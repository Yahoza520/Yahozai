# Kimi-k2.5 Setup Guide

## macOS Ventura İçin Kurulum

### 1. Ön Gereksinimler
- macOS Ventura 13.7.8+
- OpenClaw kurulu
- Kimi API Key (Moonshot AI'den)

### 2. API Key Alma
1. https://platform.moonshot.cn adresine git
2. Hesap oluştur/giriş yap
3. API key oluştur
4. Güvenli bir yerde sakla

### 3. Kurulum Adımları

```bash
# 1. Repository'yi güncelle
cd /path/to/Yahozai
git pull origin claude/self-introduction-4vRWe

# 2. Environment dosyası oluştur
cp .env.template .env

# 3. API key'ini .env'ye yaz
# Editör aç ve MOONSHOT_API_KEY=your-key-here
nano .env

# 4. Kurulum scriptini çalıştır
chmod +x kimi-k2.5-setup.sh
./kimi-k2.5-setup.sh

# 5. OpenClaw'u başlat
openclaw --config .openclaw/config.json
```

### 4. RAM Optimizasyonu (24GB İçin)

Kimi-k2.5 çok hafif bir modeldir. macOS'ta OpenClaw çalıştırırken:

**macOS Terminal'de:**
```bash
# RAM kullanımını monitor et
top -l1 | head -20

# OpenClaw'u optimize edilmiş modda başlat
OPENCLAW_MEMORY_LIMIT=8GB openclaw --config .openclaw/config.json
```

### 5. Kontrol Et
```bash
# API bağlantısı test et
curl -X POST https://api.moonshot.cn/v1/chat/completions \
  -H "Authorization: Bearer $MOONSHOT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "moonshot-v1-8k", "messages": [{"role": "user", "content": "test"}]}'
```

### 6. Sorun Giderme

**Yanıt alamıyorsam:**
- API key'i kontrol et (boşluk olmasın)
- İnternet bağlantısını test et
- OpenClaw loglarını kontrol et: `./logs/openclaw.log`
- Firewall/proxy ayarlarını kontrol et

**RAM yetersiz ise:**
- Background uygulamaları kapat
- UTM VM'yi suspend et (kullannacağı zaman)
- OpenClaw cache'ini temizle: `rm -rf .openclaw/cache`

**Model yavaşsa:**
- Moonshot API'deki hız limitini kontrol et
- Batch size'ı düşür config.json'da
- Parallel requests'i azalt

## İMac Özellikleri (Optimizasyon)

```
- Processor: 3.8 GHz Quad-Core Intel i5
- RAM: 24 GB DDR4 2400 MHz
- GPU: Radeon Pro 580 8GB
```

**Tavsiye:** GPU'yu kullanmak için OPENCLAW_USE_GPU=true ayarla

## Test
```bash
# Basit test
echo "Merhaba, Kimi-k2.5!" | openclaw chat
```
