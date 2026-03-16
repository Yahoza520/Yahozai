# Ollama + OpenClaw Kurulum Rehberi (llama3.2:1b)

## Sorun
OpenClaw, Ollama'daki local modelleri otomatik olarak görmez.
Aşağıdaki adımlarla `llama3.2:1b` modelini OpenClaw'a bağlayabilirsin.

## Ön Gereksinimler
- Ollama kurulu ve çalışıyor (`ollama serve`)
- llama3.2:1b modeli indirilmiş (`ollama pull llama3.2:1b`)
- OpenClaw kurulu (`openclaw gateway start`)

## Kurulum

### Yöntem 1: Environment Variable (En Kolay)

```bash
# Ollama API key'i ayarla (herhangi bir değer olabilir)
export OLLAMA_API_KEY="ollama-local"

# Kalıcı olması için .zshrc'ye ekle
echo 'export OLLAMA_API_KEY="ollama-local"' >> ~/.zshrc
source ~/.zshrc

# Gateway'i yeniden başlat
openclaw gateway restart
```

Bu yöntemle OpenClaw, localhost:11434'teki tüm Ollama modellerini otomatik keşfeder.

### Yöntem 2: Manuel Konfigürasyon

`~/.openclaw/openclaw.json` dosyasını oluştur veya düzenle:

```json
{
  "models": {
    "providers": {
      "ollama": {
        "baseUrl": "http://127.0.0.1:11434",
        "apiKey": "ollama-local",
        "api": "ollama"
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "ollama/llama3.2:1b"
      }
    }
  }
}
```

Sonra gateway'i yeniden başlat:

```bash
openclaw gateway restart
```

## Kontrol

```bash
# Ollama'da modelleri listele
curl -s http://localhost:11434/api/tags | jq '.models[] | .name'

# OpenClaw'da modelleri listele
openclaw models list

# llama3.2:1b ile test et
echo "Merhaba!" | openclaw chat --model ollama/llama3.2:1b
```

## Onemli Notlar

1. **`/v1` KULLANMA**: `baseUrl`'de `/v1` ekleme. Native Ollama API'si tool calling icin daha guvenilir.
2. **API Key zorunlu**: Ollama key istemese de OpenClaw bir deger bekler. `"ollama-local"` yeterli.
3. **Reasoning kapali olsun**: llama3.2:1b gibi kucuk modellerde `"reasoning": false` ayarla.
4. **Context window**: llama3.2:1b'nin context window'u kucuk (~4k token). Karmasik gorevler icin sinirli kalabilir.

## Sorun Giderme

### Model OpenClaw'da gorunmuyor
- Ollama calistigini kontrol et: `curl http://localhost:11434/api/tags`
- `OLLAMA_API_KEY` ayarli mi: `echo $OLLAMA_API_KEY`
- Gateway'i yeniden baslat: `openclaw gateway restart`

### Tool calling calismiyor
- `api` degerini `"ollama"` yap (`"openai-responses"` degil)
- `"reasoning": false` ayarla
- `/v1` suffix'ini kaldir

### Bos yanit veya timeout
- llama3.2:1b cok kucuk bir model (1.2B parametre)
- Karmasik gorevler yerine basit sorular icin kullan
- Timeout'u artir: config'de `"timeout": 60000`

## iMac Optimizasyonu (24GB RAM)

```bash
# Ollama'nin kullanabilecegi RAM'i sinirla
export OLLAMA_MAX_LOADED_MODELS=1
export OLLAMA_NUM_PARALLEL=1

# OpenClaw + Ollama birlikte calisirken RAM durumu
# Ollama llama3.2:1b: ~1.2GB RAM
# OpenClaw gateway: ~200MB RAM
# Toplam: ~1.5GB - 24GB sisteminiz icin cok rahat
```
