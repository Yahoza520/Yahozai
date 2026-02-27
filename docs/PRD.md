# DENK — PRD (Product Requirements Document) (v0.2)

## 1) Amaç / North Star

**Ürün 1 cümle:**
DENK, İstanbul’da (sonra Türkiye geneli) fiziksel hayatta karşılaşıp tanışamadığın kişileri, **gerçek zamanlı konum paylaşmadan**, son 24/72 saat içindeki kesişimlerden “retrospektif” şekilde buluşturan bir dating uygulamasıdır.

**North Star Metric:**
Haftalık **karşılıklı onay + iki taraflı sohbet** ile sonuçlanan “Verified Match Conversation” sayısı.

## 2) Hedef kullanıcılar (Personas)

- **Persona A (Şehirli 22–32):** toplu taşıma/kafe/iş rotası yoğun, “keşke konuşsaydım” yaşayan.
- **Persona B (Yoğun çalışan 25–40):** vakti az, uygulamalarda kaydırmaya değil “yüksek isabetli” eşleşmeye açık.

## 3) Problem / İçgörü

- Fiziksel hayatta temas var ama tanışma bariyeri yüksek.
- Dating uygulamalarında “kaydır-geç” yorgunluğu + sahte profil/güvenlik sorunu.
- Real-time konum gösteren çözümler güvenlik riski doğuruyor.

## 4) Çözüm Özeti

- **Retrospektif keşif:** kullanıcılar son X saat içinde yakın yer-zaman kesişimlerini görür.
- **Spotted Sign (Partner QR + uygulama içi):** fiziksel dünyada “ben de buradaydım” doğrulamasını güçlendirir.
- **Gizlilik:** real-time konum paylaşımı yok; zaman gecikmeli ve onay temelli.

## 5) MVP Kapsamı

### Must-have

- [ ] **Kayıt / giriş:** e-posta ile kayıt + doğrulama
- [ ] **Yaş uygunluğu:** 18+ (zorunlu)
- [ ] Onboarding + izinler (konum; bildirim opsiyonel)
- [ ] **Time Travel:** Basic 24 saat / Premium 72 saat
- [ ] Aday listesi + karşılıklı onay (match)
- [ ] Mesajlaşma (match sonrası)
- [ ] Safety: report/block
- [ ] **Ghost Mode (DP ile)**

### Nice-to-have

- [ ] Partner mekân “Verified Zone” doğrulaması (opsiyonel)
- [ ] Semt Krallığı / leaderboard
- [ ] Gelişmiş anti-fraud (risk skoru)

## 6) Kullanıcı Akışları

- **Onboarding:** e-posta → e-posta doğrulama → 18+ onayı → konum izni → profil
- **Time Travel:** “son 24/72 saat” → adaylar → beğen/onay
- **Match & Chat:** match → sohbet → report/block
- **Ghost Mode:** DP harca → seçili bölgede görünmezlik (24 saat)

## 7) Kurallar / Limitler

- **Paketler:** Basic=24 saat / Premium=72 saat
- **Sorgu limitleri:** Basic 3/gün (pilot parametresi); Premium yüksek/limitsiz
- **Gizlilik:** real-time konum paylaşımı yok
- **Partner mekân doğrulaması:** opsiyonel (MVP’de seçili akışlarda)
- **Spotted Sign:** yalnızca **partner mekân QR** + uygulama içi onay

## 8) Veri Modeli (yüksek seviye)

- `User`
- `LocationEvent`
- `Zone`
- `Venue`
- `Match`
- `Consent`
- `Report` / `Block`

## 9) Ölçüm Planı

- **Activation:** izin tamamlama, ilk Time Travel, ilk match
- **Retention:** D1/D7/D30
- **Monetization:** paywall view → checkout → conversion → churn
- **Safety:** report rate, block rate

## 10) Riskler ve Açık Sorular

- **Cold-start:** density düşükse aday kalitesi düşer → sniper semt stratejisi şart.
- **Safety:** stalking/abuse → kural seti + moderasyon süreçleri.
- **QR sürtünmesi:** QR doğrulama UX friction yaratabilir → sadece gerekli noktalarda kullan.
- **E-posta ile kayıt:** bot/hızlı hesap açma riskini artırabilir → anti-abuse + doğrulama önlemleri.
