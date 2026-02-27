# DENK (Spotted) — Ek: Paketler, Monetizasyon Hunisi ve DP Parametreleri (v0.1)

Bu ek, yatırım/strateji dosyasına eklenecek şekilde hazırlanmıştır. Pilot dönemde tüm sayılar A/B testleriyle optimize edilir.

---

## 1) Paketler ve Monetizasyon (Basic / Premium)

### BASIC (Ücretsiz)
- **Time Travel:** son **24 saat**
- **Günlük sorgu limiti:** **3/gün** (pilot parametresi)
- **Match + mesaj:** yalnızca karşılıklı onay sonrası
- **DP kazanımı:** açık
- **Ghost Mode:** **DP ile** açılır, limitli (örn. haftada 1)

### PREMIUM (30 TL/ay)
- **Time Travel:** son **72 saat**
- **Günlük sorgu limiti:** yüksek/limitsiz (pilot kapasiteye göre)
- **DP kazanımı:** açık
- **Ghost Mode:** **DP ile** açılır, daha yüksek limit

Konumlandırma: **BASIC = yoğunluk/density motoru**, **PREMIUM = derinlik (72 saat) + kontrol (gizlilik)**.

---

## 2) Basic → Premium Dönüşüm Hunisi (KPI seti)

Aşağıdaki metrikler, haftalık dashboard’ta izlenecek “çekirdek” huniyi tanımlar.

### A) Aktivasyon (Activation)
- **A1 — İzin tamamlama oranı:** konum izni + temel profil tamamlanma
- **A2 — İlk Time Travel sorgusu:** ilk 24 saat içinde en az 1 sorgu
- **A3 — İlk doğrulama aksiyonu:** Verified Zone ziyareti veya Spotted Sign akışına giriş

### B) Çekirdek değer (Core Value)
- **C1 — Aday görüntüleme:** Time Travel sonucu en az 1 aday kart görüntüleme
- **C2 — Karşılıklı onay (match) oranı:** aday → match
- **C3 — “Kaliteli sohbet” oranı:** match’ten sonra iki taraflı en az 2 mesaj

### C) Retention
- **R1 — D1 Retention**
- **R2 — D7 Retention**
- **R3 — D30 Retention** (pilot sonrası)

### D) Monetizasyon
- **M1 — Paywall view oranı:** Time Travel süresi (24→72) limitine gelen kullanıcıların paywall görmesi
- **M2 — Checkout start:** paywall → ödeme başlatma
- **M3 — Conversion:** ödeme başlatma → başarılı abonelik
- **M4 — İptal / churn:** 1. ay iptal oranı

### E) Güvenlik (Trust & Safety)
- **S1 — Report rate:** 1.000 aktif kullanıcı başına şikayet
- **S2 — Block rate**
- **S3 — Abuse doğrulama hatası / false positive** (iç metrik)

Dashboard notu: KPI’lar semt bazlı kırılımla (Beşiktaş/Kadıköy/Nişantaşı vb.) izlenir; “density” mekaniklerinin etkisi bu şekilde görünür.

---

## 3) DP Ekonomisi Parametreleri ve Anti‑Abuse (v0.1)

DP ekonomisi “para yerine geçme” iddiası olmadan, davranış yönlendirme amaçlı bir uygulama içi puandır.

### 3.1 DP kazanım tablosu
- **Verified Zone ziyareti (20): +10 DP**
  - Limit: **5/gün** (maks 50 DP/gün)
  - Aynı mekânda tekrar sayılma: **en erken 2 saat sonra**
- **Spotted Sign doğrulaması (50): +50 DP**
  - Limit: **2/gün** (maks 100 DP/gün)
- **Kaliteli sohbet (match sonrası iki taraflı etkileşim): +25 DP**
  - Limit: **4/gün** (maks 100 DP/gün)
- **7‑gün streak bonusu: +100 DP**
  - Haftada 1

### 3.2 DP harcama tablosu
- **Time Travel uzatma (72 → 120 saat): 150 DP**
  - Limit: **2/hafta**
- **Ghost Mode (24 saat / seçili bölge): 50 DP**
  - Limit: **3/hafta**

### 3.3 Anti‑abuse kuralları (özet)
- **Rate limit:** cihaz/hesap başına DP kazandıran aksiyonlarda hız limiti
- **Şüpheli sinyal:** GPS/cihaz tutarsızlığı tespitinde DP kazanımı askıya alınır (manuel inceleme kuyruğu)
- **Farm önleme:** aynı iki hesap arasında tekrarlı doğrulamalarda DP düşürme veya kilit
- **Yeni hesap kısıtı:** ilk 7 gün DP limitleri daha düşük olabilir

---

## 4) Varsayım çerçevesi (finansal modele bağlama)

DP ve Ghost Mode doğrudan gelir kalemi değil; **Premium dönüşümünü ve retention’ı artıran** ürün mekanikleridir.

- **Premium dönüşüm sürücüsü:** 24 saat sınırına gelen kullanıcı için 72 saat “aha moment” yaratır.
- **Ghost Mode etkisi:** gizlilik kontrolü → güven artışı → churn düşüşü.

Pilot sonrası finansal modelde şu iki parametre A/B test sonucu güncellenir:
1) **Paywall view → conversion oranı**
2) **Premium churn (1. ay iptal)**
