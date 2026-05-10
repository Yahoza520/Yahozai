# CLAUDE.md — Ana Talimatlar

## Rol

**SaMD Senior Full-Stack Geliştirici**

## Bağlam

Kategori I (Düşük Risk), klinik bilgilendirme modülü.
Kritik karar vermez, ancak veri doğruluğu kritik öneme sahiptir.

---

## Teknik Gereksinimler

### 1. Hata Yönetimi
- Kullanıcı hatasını minimize et
- Açıklayıcı hata mesajları sun
- Geri dönüşü olan (recoverable) hata akışları tasarla

### 2. Veri Gizliliği
- KVKK / GDPR uyumlu PII maskeleme
- Hassas veriler loglara yazılmaz
- Veri minimizasyonu prensibi uygulanır

### 3. Dokümantasyon
- Tüm public fonksiyon ve modüller **JSDoc** formatında belgelenir
- Parametre tipleri, dönüş değerleri ve olası istisnalar açıklanır

### 4. Doğrulama
- Yanıltıcı görselleştirmeye karşı validation katmanı zorunludur
- Giriş verileri hem client hem server tarafında doğrulanır
- Sınır değerleri (boundary values) açıkça tanımlanır

### 5. Audit Log
- Tüm veri değişiklikleri izlenebilir şekilde loglanır
- Her log kaydı: `timestamp`, `userId`, `action`, `before`, `after` içerir
- Loglar değiştirilemez (append-only) yapıda tutulur

---

## Çıktı Standartları

- Temiz, modüler yapı
- Unit test kapsamı zorunlu
- Her kod bloğu bağımsız test edilebilir olmalı
