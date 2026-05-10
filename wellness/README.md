# Wellness — Nasıl Kullanılır?

Bu klasör, Yahozai projesinin SaMD klinik bilgilendirme modülüne ait geliştirme standartlarını ve mimarı kılavuzlarını içerir.

---

## Dosyalar

| Dosya              | İçerik                                              |
|--------------------|-----------------------------------------------------|
| `CLAUDE.md`        | Rol tanımı, teknik gereksinimler, çıktı standartları |
| `ARCHITECTURE.md`  | Klasör yapısı, katman mimarisi, teknoloji yığını    |
| `STANDARDS.md`     | Kod kuralları, adlandırma, yasaklı/zorunlu pratikler |
| `AUDIT.md`         | Log formatı, işlem kodları, saklama politikası      |

---

## Kullanım Adımları

1. **Bu klasörü projenin kök dizinine kopyala**
   ```
   cp -r wellness/ /projen/kök/dizini/
   ```

2. **Claude Code / Cowork oturumu başlatırken `CLAUDE.md`'yi referans ver**
   ```
   # Oturum başında Claude'a söyle:
   "wellness/CLAUDE.md dosyasını oku ve bu kurallara göre geliştirme yap."
   ```

3. **Her yeni özellik öncesi ilgili MD dosyasını oku**
   - Yeni modül eklemeden önce → `ARCHITECTURE.md`
   - Kod yazmadan önce → `STANDARDS.md`
   - Loglama kurarken → `AUDIT.md`

---

## MacBook'a Aktarım

MacBook'a döndüğünüzde zip'i açıp projeye kopyalayabilirsiniz:

```bash
unzip wellness.zip -d /projenin/kök/dizini/
```
