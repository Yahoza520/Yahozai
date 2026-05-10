# FLOW.md — Ekran Akış Diyagramı

> React Native mobil uygulama — Hasta kayıt wizard'ı ve frekans programı akışı.

---

## Genel Akış

```
UYGULAMA AÇILIŞI
      │
      ▼
┌─────────────┐
│  Splash     │  Logo + yükleme animasyonu (1.5 sn)
└──────┬──────┘
       │
       ▼
┌─────────────────┐     Kayıtlı kullanıcı?
│  Onboarding     │ ──────── EVET ──────────► ANA EKRAN
│  (ilk açılış)   │
└──────┬──────────┘
       │ HAYIR
       ▼
┌─────────────────┐
│  Gizlilik &     │  KVKK / GDPR bilgilendirme
│  Onay Ekranı    │  ► Kabul et → devam
└──────┬──────────┘  ► Reddet → uygulama kapanır
       │
       ▼
   KAYIT WIZARD
```

---

## KAYIT WIZARD — Adım Adım

```
WIZARD BAŞLANGICI
       │
       ├──────────────────────────────────────────┐
       │                                          │
       ▼                                          │
┌──────────────────────────────────────────┐      │
│  ADIM 1 / 5 — Profil                     │      │
│  ● P01 Yaş aralığı                       │      │
│  ● P02 Biyolojik cinsiyet                │      │
│  ● P03 Boy / kilo (opsiyonel)            │      │
│  ● P04 Kronik hastalık var mı?           │      │
│       └─ EVET → P05 Hastalık listesi     │      │
│       └─ HAYIR → P06'ya atla            │      │
│  ● P06 İlaç/takviye var mı?             │      │
│       └─ EVET → P07 Tür seçimi          │      │
│       └─ HAYIR → Adım 2'ye geç         │      │
└──────────────────┬───────────────────────┘      │
                   │                              │
                   ▼                              │
┌──────────────────────────────────────────┐      │
│  ADIM 2 / 5 — Semptom Tarama            │      │
│  ● S01 Ana semptom seçimi (multi)        │      │
│                                          │      │
│  Seçime göre dinamik sorular eklenir:    │      │
│  ├─ fatigue   seçildi → S02 göster      │      │
│  ├─ headache  seçildi → S03 göster      │      │
│  ├─ sleep     seçildi → S04 göster      │      │
│  ├─ digestion seçildi → S05 göster      │      │
│  ├─ pain      seçildi → S06 göster      │      │
│  └─ none      seçildi → Adım 3'e atla  │      │
└──────────────────┬───────────────────────┘      │
                   │                              │
                   ▼                              │
┌──────────────────────────────────────────┐      │
│  ADIM 3 / 5 — Enerji & Ruh Hali         │      │
│  ● E01 Enerji skalası (1–10)             │      │
│       └─ 1–4 → E02 zorunlu hale gelir   │      │
│  ● E02 Stres seviyesi                    │      │
│  ● E03 Ruh hali tanımlama (multi)        │      │
└──────────────────┬───────────────────────┘      │
                   │                              │
                   ▼                              │
┌──────────────────────────────────────────┐      │
│  ADIM 4 / 5 — Yaşam Tarzı               │      │
│  ● L01 Haftalık aktivite sıklığı         │      │
│  ● L02 Günlük su tüketimi               │      │
│  ● L03 Beslenme düzeni                  │      │
│  ● L04 Ortalama uyku süresi             │      │
└──────────────────┬───────────────────────┘      │
                   │                              │
                   ▼                              │
┌──────────────────────────────────────────┐      │
│  ADIM 5 / 5 — Biyorezonans              │      │
│  ● B01 EMF hassasiyeti                  │      │
│  ● B02 Doğa etkisi                      │      │
│  ● B03 Ses & müzik etkisi               │      │
│  ● B04 Önceki deneyimler (multi)        │      │
│  ● B05 Günlük ayırılabilir süre         │      │
└──────────────────┬───────────────────────┘      │
                   │                              │
                   ▼                              │
        ┌──────────────────┐                      │
        │  Skor Hesaplama  │ ◄────────────────────┘
        │  (arka planda)   │
        └────────┬─────────┘
                 │
                 ▼
        ┌──────────────────────┐
        │  Analiz Ekranı       │
        │  "Profiliniz         │
        │   oluşturuluyor..."  │
        │  (animasyonlu, 2 sn) │
        └────────┬─────────────┘
                 │
                 ▼
        ┌──────────────────────┐     kardiyovasküler ≥ 8?
        │  Sonuç Ekranı        │ ──── EVET ──► Uzman Yönlendirme Ekranı
        │  (Wellness Profili)  │
        └────────┬─────────────┘
                 │
                 ▼
        ┌──────────────────────┐
        │  Frekans Programı    │
        │  Ekranı              │
        └────────┬─────────────┘
                 │
                 ▼
           ANA EKRAN
```

---

## EKRAN KATALOğU

### 1. SplashScreen
```
Bileşenler : Logo, yükleme animasyonu
Süre       : 1.5 sn → otomatik geçiş
Navigasyon : → OnboardingScreen (ilk açılış) | → HomeScreen (kayıtlı)
```

### 2. OnboardingScreen
```
Bileşenler : 3 slayt (wellness konsepti tanıtımı), İleri / Başla butonları
Navigasyon : → PrivacyConsentScreen
```

### 3. PrivacyConsentScreen
```
Bileşenler : KVKK/GDPR metni (kaydırılabilir), Kabul Et / Reddet
Eylem      : Kabul → AsyncStorage'a consent kaydedilir + audit log
           : Reddet → uygulama kapanır
Navigasyon : → WizardScreen (step: 1)
```

### 4. WizardScreen (Ana Wizard Konteyneri)
```
Bileşenler : ProgressBar (1–5), QuestionCard, Geri / İleri butonları
State      : currentStep, answers, dynamicQuestions[], scores{}
Navigasyon : → AnalysisScreen (wizard tamamlandığında)

Alt bileşenler:
  ┌─ QuestionCard
  │    ├─ SingleSelectQuestion
  │    ├─ MultiSelectQuestion
  │    ├─ ScaleQuestion (slider)
  │    ├─ BooleanQuestion (evet/hayır)
  │    └─ TextInputQuestion
  └─ ProgressBar
```

### 5. AnalysisScreen
```
Bileşenler : Animasyonlu yükleme, "Profiliniz oluşturuluyor" metni
Eylem      : Skor motoru çalışır, protokol atama gerçekleşir
Süre       : 2–3 sn
Navigasyon : → ResultScreen | → ExpertReferralScreen (eşik aşıldıysa)
```

### 6. ExpertReferralScreen
```
Bileşenler : Uyarı ikonu, açıklama metni, "Anladım" butonu
Tetikleyici: kardiyovasküler skoru ≥ 8
Eylem      : Audit log → YETKISIZ_ERISIM değil, UZMAN_YONLENDIRME
Navigasyon : → ResultScreen
```

### 7. ResultScreen (Wellness Profili)
```
Bileşenler :
  ├─ RadarChart    → 8 boyutun görsel skoru
  ├─ DimensionList → Dominant boyutlar ve açıklamaları
  ├─ SaMD Uyarısı → "Bu sonuç tıbbi teşhis değildir"
  └─ CTA Butonu   → "Frekans Programımı Gör"
Navigasyon : → FrequencyProgramScreen
```

### 8. FrequencyProgramScreen
```
Bileşenler :
  ├─ WeeklyCalendar   → 7 günlük program takvimi
  ├─ SessionCard[]    → Sabah / Öğle / Akşam / Gece seansları
  │    ├─ Frekans adı, Hz değeri, süre
  │    ├─ Başlat butonu → PlayerScreen
  │    └─ Tamamlandı toggle
  └─ NotificationSetup → Seans hatırlatıcıları
Navigasyon : → PlayerScreen | → HomeScreen
```

### 9. PlayerScreen
```
Bileşenler :
  ├─ FrequencyVisualizer → Dalga animasyonu
  ├─ SessionTimer        → Geri sayım
  ├─ FrequencyInfo       → Hz, tip, notlar
  ├─ Duraklat / Durdur butonları
  └─ Tamamlandı ekranı (seans bitince)
Eylem      : Seans başlangıcı ve bitişi audit log'a yazılır
Navigasyon : ← FrequencyProgramScreen
```

### 10. HomeScreen (Ana Ekran)
```
Bileşenler :
  ├─ DailyGreeting     → Kişiselleştirilmiş selamlama (isim yok, anonim)
  ├─ TodaysSessions    → Bugünkü seanslar (tamamlanan / bekleyen)
  ├─ StreakCounter     → Ardışık gün sayısı
  ├─ QuickStartCard   → En yakın seans başlat
  └─ ProfileButton    → Profil & ayarlar
```

---

## NAVİGASYON ŞEMASI

```
Stack Navigator (Root)
│
├── SplashScreen
├── OnboardingScreen
├── PrivacyConsentScreen
│
├── Tab Navigator (Ana uygulama)
│   ├── HomeScreen
│   ├── FrequencyProgramScreen
│   ├── ProgressScreen          ← ilerleme & istatistikler
│   └── SettingsScreen
│
└── Modal Stack
    ├── WizardScreen
    ├── AnalysisScreen
    ├── ResultScreen
    ├── ExpertReferralScreen
    └── PlayerScreen
```

---

## VERİ AKIŞI

```
WizardScreen
    │  answers{}
    ▼
ScoreEngine (utils/score-engine.ts)
    │  scores{ enerji, norolojik, metabolik, ... }
    ▼
ProtocolMatcher (utils/protocol-matcher.ts)
    │  dominantDimensions[], assignedProtocols[]
    ▼
ProgramBuilder (utils/program-builder.ts)
    │  weeklyPlan{}, sessionList[]
    ▼
AsyncStorage (yerel şifreli depolama)
    │
    ├── AuditLogger (her adımda)
    └── FrequencyProgramScreen ← okuma
```

---

## GEÇİŞ ANİMASYONLARI

| Geçiş | Animasyon | Süre |
|-------|-----------|------|
| Wizard adımları arası | Sağdan sola kayma | 300 ms |
| Wizard → Analysis | Fade + scale | 400 ms |
| Analysis → Result | Fade in | 500 ms |
| Result → Program | Aşağı kayma (bottom sheet) | 350 ms |
| Program → Player | Tam ekran modal, yukarı süpürme | 400 ms |
| Geri butonu | Soldan sağa kayma | 300 ms |

---

## KRİTİK GUARD'LAR

```
1. Wizard tamamlanmadan FrequencyProgramScreen erişilemez
2. PrivacyConsent onaylanmadan wizard açılamaz
3. PlayerScreen açıkken ekran kilitlenme engellenir (keepAwake)
4. Kardiyovasküler eşik → ExpertReferral atlanamaz (zorunlu ekran)
5. Tüm geçişler audit log'a düşer
```
