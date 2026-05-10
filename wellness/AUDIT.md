# AUDIT.md — Log Standartları

## İzlenen İşlem Kodları

| Kod                  | Açıklama                                         |
|----------------------|--------------------------------------------------|
| `KULLANICI_GIRIS`    | Kullanıcı oturum açma girişimi (başarılı/başarısız) |
| `VERI_GORUNTULEME`   | Hasta veya klinik veriye okuma erişimi           |
| `VERI_DEGISTIRME`    | Mevcut kaydın güncellenmesi                      |
| `VERI_SILME`         | Kaydın silinmesi veya arşivlenmesi               |
| `YETKISIZ_ERISIM`    | Yetersiz yetkiyle erişim girişimi                |

---

## Log Formatı

Her log kaydı aşağıdaki alanları içerir:

```json
{
  "logId":        "550e8400-e29b-41d4-a716-446655440000",
  "timestamp":    "2026-05-10T14:32:00.000Z",
  "userId":       "usr_a3f9b2c1",
  "role":         "CLINICIAN",
  "action":       "VERI_GORUNTULEME",
  "module":       "clinical-dashboard",
  "resourceId":   "rec_7d4e1a09",
  "status":       "SUCCESS",
  "errorCode":    null
}
```

### Alan Tanımları

| Alan         | Tip      | Açıklama                                            |
|--------------|----------|-----------------------------------------------------|
| `logId`      | UUID v4  | Her kayıt için benzersiz tanımlayıcı                |
| `timestamp`  | ISO 8601 | UTC cinsinden işlem zamanı                          |
| `userId`     | string   | Anonim kullanıcı kimliği (PII içermez)              |
| `role`       | enum     | `ADMIN`, `CLINICIAN`, `VIEWER`                      |
| `action`     | enum     | Yukarıdaki işlem kodlarından biri                   |
| `module`     | string   | İşlemi tetikleyen kaynak modül                      |
| `resourceId` | string   | Erişilen kaydın anonim tanımlayıcısı                |
| `status`     | enum     | `SUCCESS` veya `FAILURE`                            |
| `errorCode`  | string?  | Hata durumunda hata kodu, başarıda `null`           |

---

## Saklama Politikası

### Dizin Yapısı

```
/logs/
└── audit/
    └── YYYY-MM/
        ├── audit-2026-05-01.log.enc
        ├── audit-2026-05-02.log.enc
        └── ...
```

### Kurallar

| Kural              | Değer / Açıklama                              |
|--------------------|-----------------------------------------------|
| Saklama süresi     | **6 ay** (sonrasında güvenli silme)           |
| Şifreleme          | **AES-256** — her dosya ayrı şifrelenir       |
| Erişim yetkisi     | Yalnızca **ADMIN** rolü okuyabilir            |
| Yazma modu         | **Append-only** — geçmiş kayıtlar değiştirilemez |
| Dosya rotasyonu    | Günlük — her gün yeni `.log.enc` dosyası      |
| Bütünlük kontrolü  | SHA-256 hash, her dosya için ayrı `.sha` özet |

---

## Uygulama Notu

```typescript
/**
 * Audit log kaydı oluşturur.
 * @param {AuditEvent} event - Loglanacak işlem detayları
 * @returns {Promise<void>}
 */
async function writeAuditLog(event: AuditEvent): Promise<void> {
  try {
    const entry = {
      logId:      crypto.randomUUID(),
      timestamp:  new Date().toISOString(),
      userId:     anonymize(event.userId),
      role:       event.role,
      action:     event.action,
      module:     event.module,
      resourceId: anonymize(event.resourceId),
      status:     event.status,
      errorCode:  event.errorCode ?? null,
    };
    await auditLogger.append(entry);
  } catch (error) {
    // Audit log hatası asla sessiz bırakılmaz
    systemLogger.critical('Audit log yazılamadı', { error });
    throw error;
  }
}
```
