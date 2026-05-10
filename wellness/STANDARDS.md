# STANDARDS.md — Kod Kuralları

## Dokümantasyon

- **JSDoc** her public fonksiyona zorunludur
- Parametre tipleri, dönüş değeri ve olası istisnalar belirtilir

```typescript
/**
 * Hastanın BMI değerini hesaplar.
 * @param {number} weight - Ağırlık (kg)
 * @param {number} height - Boy (metre)
 * @returns {number} BMI değeri
 * @throws {RangeError} Negatif veya sıfır değer girildiğinde
 */
function calculateBMI(weight: number, height: number): number { ... }
```

---

## Adlandırma Kuralları

| Kural            | Format            | Örnek                        |
|------------------|-------------------|------------------------------|
| Fonksiyonlar     | `camelCase`       | `getUserHealthData()`        |
| Tipler / Arayüzler | `PascalCase`    | `PatientRecord`, `VitalSign` |
| Sabitler         | `UPPER_SNAKE_CASE`| `MAX_HEART_RATE`, `BMI_LIMIT`|
| Dosya adları     | `kebab-case`      | `audit-logger.ts`            |

---

## Yasaklı Pratikler

| Yasak                        | Neden                                              |
|------------------------------|----------------------------------------------------|
| `any` tipi                   | Tip güvenliğini ortadan kaldırır                   |
| `console.log`                | Winston logger kullanılmalıdır                     |
| Magic number                 | Sabit tanımlanmalı, anlamı açık olmalı             |
| PII verisi log satırında     | KVKK/GDPR ihlali                                   |
| Hardcoded hasta verisi       | Test verisi fixture/mock dosyalarında tutulur      |

```typescript
// YANLIŞ
const limit = 120;
console.log(patient.name);

// DOĞRU
const MAX_HEART_RATE = 120;
logger.info('Veri işlendi', { userId: maskedId });
```

---

## Zorunlu Pratikler

### TypeScript Strict Mode
`tsconfig.json` içinde aşağıdaki ayarlar zorunludur:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### Birim Testi
- Her fonksiyon için en az **1 birim testi** yazılır
- Test dosyası, kaynak dosyayla aynı ismi taşır: `calculate-bmi.test.ts`
- Happy path + en az 1 edge case test edilir

```typescript
describe('calculateBMI', () => {
  it('geçerli değerlerle doğru BMI döner', () => { ... });
  it('sıfır boy girildiğinde RangeError fırlatır', () => { ... });
});
```

### Async Hata Yönetimi
- Tüm `async` fonksiyonlar `try/catch` bloğu içinde çalışır
- Hata sessizce yutulmaz; loglanır ve uygun şekilde iletilir

```typescript
async function fetchPatientData(id: string): Promise<PatientRecord> {
  try {
    const data = await api.get(`/patients/${id}`);
    return validatePatientRecord(data);
  } catch (error) {
    logger.error('Hasta verisi alınamadı', { error });
    throw new DataFetchError('Veri erişim hatası');
  }
}
```
