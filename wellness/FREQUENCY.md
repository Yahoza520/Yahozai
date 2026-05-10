# FREQUENCY.md — Frekans Protokol Sistemi

> Kategori I SaMD — Bu protokoller tıbbi tedavi değildir. Klinik bilgilendirme ve wellness desteği amacıyla sunulur.

---

## Protokol Atama Mantığı

```
QUESTIONS.md → Skor hesaplama → Dominant boyut tespiti → Protokol seçimi → Kişisel program
```

Her kullanıcı için:
1. 8 boyutta skor hesaplanır
2. En yüksek 1–3 boyut "dominant" olarak belirlenir
3. Dominant boyutlara karşılık gelen frekans protokolleri birleştirilir
4. Kullanıcının ayırdığı süreye (B05) göre program kısaltılır veya genişletilir

---

## Frekans Protokol Kataloğu

### 1. ENERJİ PROTOKOLÜ
**Tetikleyici:** `enerji` skoru ≥ 5

| Seans | Frekans | Tip | Süre | Amaç |
|-------|---------|-----|------|------|
| Sabah aktivasyon | 40 Hz | Gama binaural beat | 10 dk | Zihinsel uyanıklık, enerji başlatma |
| Öğle yenileme | 528 Hz | Solfeggio | 7 dk | Hücresel onarım, vitalite |
| Akşam toparlanma | 10 Hz | Alfa isochronic | 10 dk | Yorgunluk atma, sinir sistemi sıfırlama |

```json
{
  "protocolId": "ENERGY_RESTORE",
  "targetDimension": "enerji",
  "minScore": 5,
  "sessions": [
    {
      "time": "morning",
      "label": "Sabah Aktivasyon",
      "frequency": 40,
      "type": "binaural_beat",
      "carrierHz": 200,
      "durationMin": 10,
      "waveform": "sine",
      "notes": "Gözler kapalı, kulaklık zorunlu"
    },
    {
      "time": "midday",
      "label": "Öğle Yenileme",
      "frequency": 528,
      "type": "solfeggio",
      "durationMin": 7,
      "waveform": "sine",
      "notes": "Hoparlör veya kulaklık"
    },
    {
      "time": "evening",
      "label": "Akşam Toparlanma",
      "frequency": 10,
      "type": "isochronic",
      "durationMin": 10,
      "waveform": "square",
      "notes": "Sessiz ortam, oturur pozisyon"
    }
  ]
}
```

---

### 2. NÖROLOJİK DENGE PROTOKOLÜ
**Tetikleyici:** `norolojik` skoru ≥ 5

| Seans | Frekans | Tip | Süre | Amaç |
|-------|---------|-----|------|------|
| Sabah netlik | 14 Hz | Beta isochronic | 8 dk | Konsantrasyon, zihin netliği |
| Stres boşaltma | 396 Hz | Solfeggio | 10 dk | Korku ve anksiyete salınımı |
| Gece sakinleşme | 4 Hz | Teta binaural | 15 dk | Derin dinlenme, sinir sistemi onarımı |

```json
{
  "protocolId": "NEURO_BALANCE",
  "targetDimension": "norolojik",
  "minScore": 5,
  "sessions": [
    {
      "time": "morning",
      "label": "Sabah Netlik",
      "frequency": 14,
      "type": "isochronic",
      "durationMin": 8,
      "waveform": "square",
      "notes": "Gözler açık veya kapalı"
    },
    {
      "time": "afternoon",
      "label": "Stres Boşaltma",
      "frequency": 396,
      "type": "solfeggio",
      "durationMin": 10,
      "waveform": "sine",
      "notes": "Nefes egzersizi ile birlikte önerilir"
    },
    {
      "time": "night",
      "label": "Gece Sakinleşme",
      "frequency": 4,
      "type": "binaural_beat",
      "carrierHz": 180,
      "durationMin": 15,
      "waveform": "sine",
      "notes": "Yatmadan 30 dk önce, kulaklık zorunlu"
    }
  ]
}
```

---

### 3. METABOLİK DESTEK PROTOKOLÜ
**Tetikleyici:** `metabolik` skoru ≥ 5

| Seans | Frekans | Tip | Süre | Amaç |
|-------|---------|-----|------|------|
| Sabah metabolizma | 174 Hz | Solfeggio | 8 dk | Enerji metabolizması aktivasyonu |
| Öğle denge | 7.83 Hz | Schumann rezonansı | 10 dk | Biyolojik ritim senkronizasyonu |
| Akşam detoks | 285 Hz | Solfeggio | 8 dk | Hücre yenileme, detoks desteği |

```json
{
  "protocolId": "METABOLIC_SUPPORT",
  "targetDimension": "metabolik",
  "minScore": 5,
  "sessions": [
    {
      "time": "morning",
      "label": "Sabah Metabolizma",
      "frequency": 174,
      "type": "solfeggio",
      "durationMin": 8,
      "waveform": "sine",
      "notes": "Kahvaltıdan önce, dik oturarak"
    },
    {
      "time": "midday",
      "label": "Öğle Denge",
      "frequency": 7.83,
      "type": "schumann",
      "durationMin": 10,
      "waveform": "sine",
      "notes": "Mümkünse açık havada veya toprak zemin üzerinde"
    },
    {
      "time": "evening",
      "label": "Akşam Detoks",
      "frequency": 285,
      "type": "solfeggio",
      "durationMin": 8,
      "waveform": "sine",
      "notes": "Akşam yemeğinden 1 saat sonra"
    }
  ]
}
```

---

### 4. İNFLAMASYON & AĞRI PROTOKOLÜ
**Tetikleyici:** `inflamasyon` skoru ≥ 5

| Seans | Frekans | Tip | Süre | Amaç |
|-------|---------|-----|------|------|
| Sabah hazırlık | 111 Hz | Monofonik ton | 7 dk | Endorfin salınımı, ağrı eşiği yükseltme |
| Ağrı yönetimi | 432 Hz | Doğal akort | 12 dk | Anti-inflamatuar titreşim desteği |
| Gece onarım | 2 Hz | Delta binaural | 15 dk | Derin hücresel onarım |

```json
{
  "protocolId": "INFLAMMATION_RELIEF",
  "targetDimension": "inflamasyon",
  "minScore": 5,
  "sessions": [
    {
      "time": "morning",
      "label": "Sabah Hazırlık",
      "frequency": 111,
      "type": "monaural",
      "durationMin": 7,
      "waveform": "sine",
      "notes": "Hoparlör de kullanılabilir"
    },
    {
      "time": "afternoon",
      "label": "Ağrı Yönetimi",
      "frequency": 432,
      "type": "natural_tuning",
      "durationMin": 12,
      "waveform": "sine",
      "notes": "Ağrı bölgesine konsantrasyon ile birlikte"
    },
    {
      "time": "night",
      "label": "Gece Onarım",
      "frequency": 2,
      "type": "binaural_beat",
      "carrierHz": 160,
      "durationMin": 15,
      "waveform": "sine",
      "notes": "Uyumadan önce, kulaklık zorunlu"
    }
  ]
}
```

---

### 5. SİNDİRİM DESTEK PROTOKOLÜ
**Tetikleyici:** `sindirim` skoru ≥ 5

| Seans | Frekans | Tip | Süre | Amaç |
|-------|---------|-----|------|------|
| Sabah aktivasyon | 8 Hz | Teta isochronic | 8 dk | Vagus siniri aktivasyonu, gut-beyin bağlantısı |
| Yemek öncesi | 528 Hz | Solfeggio | 5 dk | Sindirim enzimleri için hazırlık |
| Akşam rahatlama | 639 Hz | Solfeggio | 10 dk | Parasempatik sistem, sindirim sakinleşmesi |

```json
{
  "protocolId": "DIGESTIVE_SUPPORT",
  "targetDimension": "sindirim",
  "minScore": 5,
  "sessions": [
    {
      "time": "morning",
      "label": "Sabah Aktivasyon",
      "frequency": 8,
      "type": "isochronic",
      "durationMin": 8,
      "waveform": "square",
      "notes": "Aç karnına, derin nefes ile"
    },
    {
      "time": "pre_meal",
      "label": "Yemek Öncesi",
      "frequency": 528,
      "type": "solfeggio",
      "durationMin": 5,
      "waveform": "sine",
      "notes": "Ana öğünden 10–15 dk önce"
    },
    {
      "time": "evening",
      "label": "Akşam Rahatlama",
      "frequency": 639,
      "type": "solfeggio",
      "durationMin": 10,
      "waveform": "sine",
      "notes": "Yemekten 1 saat sonra, yan yatış pozisyonunda"
    }
  ]
}
```

---

### 6. HORMONAL DENGE PROTOKOLÜ
**Tetikleyici:** `hormonal` skoru ≥ 5

| Seans | Frekans | Tip | Süre | Amaç |
|-------|---------|-----|------|------|
| Sabah ritim | 7.83 Hz | Schumann | 10 dk | Sirkadiyen ritim senkronizasyonu |
| Öğle denge | 741 Hz | Solfeggio | 8 dk | Detoks, endokrin sistem desteği |
| Gece reset | 3 Hz | Delta binaural | 15 dk | Büyüme hormonu salınımı, derin uyku |

```json
{
  "protocolId": "HORMONAL_BALANCE",
  "targetDimension": "hormonal",
  "minScore": 5,
  "sessions": [
    {
      "time": "morning",
      "label": "Sabah Ritim",
      "frequency": 7.83,
      "type": "schumann",
      "durationMin": 10,
      "waveform": "sine",
      "notes": "Güneş ışığında veya sabah yürüyüşü ile kombine"
    },
    {
      "time": "midday",
      "label": "Öğle Denge",
      "frequency": 741,
      "type": "solfeggio",
      "durationMin": 8,
      "waveform": "sine",
      "notes": "Öğle arası sessiz bir ortamda"
    },
    {
      "time": "night",
      "label": "Gece Reset",
      "frequency": 3,
      "type": "binaural_beat",
      "carrierHz": 150,
      "durationMin": 15,
      "waveform": "sine",
      "notes": "Uyku saatinden 20 dk önce, oda loş olmalı"
    }
  ]
}
```

---

### 7. İMMÜN DESTEK PROTOKOLÜ
**Tetikleyici:** `immun` skoru ≥ 5

| Seans | Frekans | Tip | Süre | Amaç |
|-------|---------|-----|------|------|
| Sabah güçlendirme | 852 Hz | Solfeggio | 10 dk | Bağışıklık hücresi aktivasyonu |
| Öğle koruma | 40 Hz | Gama binaural | 8 dk | Nöral immün iletişim |
| Akşam onarım | 432 Hz | Doğal akort | 10 dk | Anti-inflamatuar, hücre yenileme |

```json
{
  "protocolId": "IMMUNE_SUPPORT",
  "targetDimension": "immun",
  "minScore": 5,
  "sessions": [
    {
      "time": "morning",
      "label": "Sabah Güçlendirme",
      "frequency": 852,
      "type": "solfeggio",
      "durationMin": 10,
      "waveform": "sine",
      "notes": "Günün ilk saatinde, aç karnına"
    },
    {
      "time": "midday",
      "label": "Öğle Koruma",
      "frequency": 40,
      "type": "binaural_beat",
      "carrierHz": 200,
      "durationMin": 8,
      "waveform": "sine",
      "notes": "Kulaklık zorunlu"
    },
    {
      "time": "evening",
      "label": "Akşam Onarım",
      "frequency": 432,
      "type": "natural_tuning",
      "durationMin": 10,
      "waveform": "sine",
      "notes": "Rahat pozisyon, derin nefes ile"
    }
  ]
}
```

---

### 8. BİYOREZONANS HASSAS PROTOKOLÜ
**Tetikleyici:** `biyorezonans` skoru ≥ 4

| Seans | Frekans | Tip | Süre | Amaç |
|-------|---------|-----|------|------|
| Sabah zemin | 7.83 Hz | Schumann | 12 dk | Elektromanyetik ortam sıfırlama |
| Gün içi koruma | 963 Hz | Solfeggio | 8 dk | Üst çakra, pineal bez uyarımı |
| Gece arındırma | 0.5 Hz | Delta binaural | 20 dk | Derin EMF detoksu, hücre zarı onarımı |

```json
{
  "protocolId": "BIORESONANCE_SENSITIVE",
  "targetDimension": "biyorezonans",
  "minScore": 4,
  "sessions": [
    {
      "time": "morning",
      "label": "Sabah Zemin",
      "frequency": 7.83,
      "type": "schumann",
      "durationMin": 12,
      "waveform": "sine",
      "notes": "Mümkünse çıplak ayak, doğal zemin üzerinde"
    },
    {
      "time": "afternoon",
      "label": "Gün İçi Koruma",
      "frequency": 963,
      "type": "solfeggio",
      "durationMin": 8,
      "waveform": "sine",
      "notes": "Telefon ve ekrandan uzak bir ortamda"
    },
    {
      "time": "night",
      "label": "Gece Arındırma",
      "frequency": 0.5,
      "type": "binaural_beat",
      "carrierHz": 100,
      "durationMin": 20,
      "waveform": "sine",
      "notes": "Tüm elektronikler kapalı, kulaklık, oda karanlık"
    }
  ]
}
```

---

## Süre Bazlı Program Şablonları

### Kısa Program (5–10 dk/gün) — `programDuration: "short"`
```
Sabah: dominant protokolün ilk seansı (kısaltılmış, 5–7 dk)
Akşam: dominant protokolün son seansı (kısaltılmış, 5–7 dk)
```

### Orta Program (15–20 dk/gün) — `programDuration: "medium"`
```
Sabah: dominant protokol 1. seans (tam süre)
Akşam: dominant protokol 3. seans (tam süre)
```

### Tam Program (30+ dk/gün) — `programDuration: "full"`
```
Sabah:  dominant protokol 1. seans (tam süre)
Öğle:   dominant protokol 2. seans (tam süre)
Akşam:  ikincil protokol 1. seansı (tam süre)
Gece:   dominant protokol 3. seansı (tam süre)
```

---

## Örnek: Kişisel Program Çıktısı

**Kullanıcı profili:**
- Dominant boyut: `norolojik` (skor: 12), `enerji` (skor: 8)
- Biyorezonans: `4` → hassas protokol eklenir
- Süre tercihi: 20 dk/gün

**Atanan program:**

```json
{
  "userId": "usr_a3f9b2c1",
  "generatedAt": "2026-05-10T08:00:00.000Z",
  "programDuration": "medium",
  "dominantDimensions": ["norolojik", "enerji", "biyorezonans"],
  "weeklyPlan": {
    "monday":    ["NEURO_BALANCE.morning",    "NEURO_BALANCE.night"],
    "tuesday":   ["ENERGY_RESTORE.morning",   "NEURO_BALANCE.night"],
    "wednesday": ["BIORESONANCE_SENSITIVE.morning", "NEURO_BALANCE.night"],
    "thursday":  ["NEURO_BALANCE.morning",    "ENERGY_RESTORE.evening"],
    "friday":    ["ENERGY_RESTORE.morning",   "BIORESONANCE_SENSITIVE.night"],
    "saturday":  ["NEURO_BALANCE.morning",    "NEURO_BALANCE.night"],
    "sunday":    ["BIORESONANCE_SENSITIVE.morning", "ENERGY_RESTORE.evening"]
  },
  "notes": [
    "Kulaklık kullanımı binaural seanslar için zorunludur.",
    "Yüksek kardiyovasküler skor tespit edilmedi.",
    "Program 4 hafta sonra yeniden değerlendirilmelidir."
  ]
}
```

---

## Güvenlik Sınırları

| Kural | Detay |
|-------|-------|
| Günlük maksimum | Toplam 90 dk frekans maruziyeti aşılmaz |
| Epilepsi uyarısı | Kayıt sırasında soru P04/P05'te epilepsi seçilirse binaural beat devre dışı kalır |
| Gebelik uyarısı | P02 + P05 kombinasyonuna göre uyarı gösterilir, bazı protokoller kısıtlanır |
| Kardiyovasküler | `kardiyovaskuler` skoru ≥ 8 ise uzman yönlendirmesi bildirimi tetiklenir |
| Yasal uyarı | Her program çıktısında Kategori I SaMD sorumluluk reddi gösterilir |
