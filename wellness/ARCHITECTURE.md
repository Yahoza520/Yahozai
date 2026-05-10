# ARCHITECTURE.md — Mimari

## Klasör Yapısı

```
wellness/
├── modules/
│   ├── clinical-dashboard/     # Klinik gösterge paneli
│   ├── data-validation/        # Veri doğrulama katmanı
│   ├── audit-logger/           # Değişiklik izleme & loglama
│   └── privacy-filter/         # PII maskeleme & KVKK/GDPR filtresi
│
├── shared/
│   ├── components/             # Yeniden kullanılabilir UI bileşenleri
│   ├── utils/                  # Yardımcı fonksiyonlar
│   └── types/                  # Global TypeScript tip tanımları
│
└── tests/
    ├── unit/                   # Birim testleri
    └── integration/            # Entegrasyon testleri
```

---

## Katman Mimarisi

```
┌─────────────────────────────────────────┐
│           Sunum Katmanı                 │
│   React bileşenleri, UI, görselleştirme │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│          İş Mantığı Katmanı             │
│   Domain kuralları, hesaplamalar,       │
│   klinik veri işleme                   │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Veri Erişim Katmanı             │
│   API çağrıları, cache, veri dönüşümü  │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      Güvenlik & Uyumluluk Katmanı       │
│   PII filtresi, audit log, KVKK/GDPR   │
└─────────────────────────────────────────┘
```

---

## Teknoloji Yığını

| Alan              | Teknoloji       | Amaç                                      |
|-------------------|-----------------|-------------------------------------------|
| UI Framework      | React           | Bileşen tabanlı arayüz geliştirme         |
| Tip Güvenliği     | TypeScript      | Derleme zamanı hata tespiti               |
| Şema Doğrulama    | Zod             | Runtime veri validasyonu                  |
| Test              | Jest            | Birim ve entegrasyon testleri             |
| Dokümantasyon     | JSDoc           | Kod içi API belgesi üretimi               |
| Loglama           | Winston         | Yapılandırılmış audit & uygulama logları  |

---

## Modül Sorumlulukları

### `clinical-dashboard`
Klinik verilerin görselleştirilmesi. Yanıltıcı grafik üretimini önlemek için validation katmanıyla doğrudan entegre çalışır.

### `data-validation`
Zod şemaları ile giriş/çıkış verisi doğrulaması. Sınır değerleri ve tip kontrolü bu modülde merkezi olarak yönetilir.

### `audit-logger`
Winston tabanlı append-only log sistemi. Her kayıt `timestamp`, `userId`, `action`, `before`, `after` alanlarını içerir.

### `privacy-filter`
PII tespiti ve maskeleme. Tüm veri akışlarında otomatik olarak devreye girer; loglar bu katmandan geçirilir.
