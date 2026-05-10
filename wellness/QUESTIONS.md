# QUESTIONS.md — Hasta Kayıt Soru Bankası & Dallanma Mantığı

> Kategori I SaMD — Bu sorular klinik teşhis koymaz; kişiye özel frekans ve wellness protokolü oluşturmak için kullanılır.

---

## Yapı

Her soru şu alanlara sahiptir:

```
id        → benzersiz soru kodu
category  → hangi kategoriye ait
type      → text | single | multi | scale | boolean
required  → zorunlu mu?
next      → varsayılan sonraki soru
branches  → cevaba göre atlama kuralları (conditional logic)
score     → cevabın semptom skoruna katkısı
```

---

## BÖLÜM 1 — Kişisel Profil

> PII içermez. Tüm kimlik bilgileri anonim ID ile saklanır.

```json
[
  {
    "id": "P01",
    "category": "profil",
    "question": "Yaşınız hangi aralıkta?",
    "type": "single",
    "required": true,
    "options": [
      { "label": "18–29", "value": "18-29" },
      { "label": "30–44", "value": "30-44" },
      { "label": "45–59", "value": "45-59" },
      { "label": "60+",   "value": "60+" }
    ],
    "next": "P02",
    "branches": []
  },
  {
    "id": "P02",
    "category": "profil",
    "question": "Biyolojik cinsiyetiniz?",
    "type": "single",
    "required": true,
    "options": [
      { "label": "Kadın", "value": "F" },
      { "label": "Erkek", "value": "M" },
      { "label": "Belirtmek istemiyorum", "value": "X" }
    ],
    "next": "P03",
    "branches": []
  },
  {
    "id": "P03",
    "category": "profil",
    "question": "Boy ve kilonuz? (opsiyonel — BMI hesabı için)",
    "type": "text",
    "required": false,
    "placeholder": "Örn: 170 cm / 70 kg",
    "next": "P04",
    "branches": []
  },
  {
    "id": "P04",
    "category": "profil",
    "question": "Herhangi bir kronik rahatsızlığınız var mı?",
    "type": "boolean",
    "required": true,
    "next": "P05",
    "branches": [
      { "value": true,  "next": "P05" },
      { "value": false, "next": "S01" }
    ]
  },
  {
    "id": "P05",
    "category": "profil",
    "question": "Hangi kronik rahatsızlıklara sahipsiniz? (Birden fazla seçebilirsiniz)",
    "type": "multi",
    "required": false,
    "options": [
      { "label": "Diyabet",              "value": "diabetes",       "score": { "metabolik": 3 } },
      { "label": "Hipertansiyon",        "value": "hypertension",   "score": { "kardiyovaskuler": 3 } },
      { "label": "Tiroid bozukluğu",     "value": "thyroid",        "score": { "hormonal": 3 } },
      { "label": "Kronik yorgunluk",     "value": "cfs",            "score": { "enerji": 4 } },
      { "label": "Otoimmün hastalık",    "value": "autoimmune",     "score": { "immun": 4 } },
      { "label": "Anksiyete/Depresyon",  "value": "mental_health",  "score": { "norolojik": 3 } },
      { "label": "Sindirim sorunları",   "value": "digestive",      "score": { "sindirim": 3 } },
      { "label": "Diğer",               "value": "other",          "score": {} }
    ],
    "next": "P06",
    "branches": []
  },
  {
    "id": "P06",
    "category": "profil",
    "question": "Düzenli kullandığınız ilaç veya takviye var mı?",
    "type": "boolean",
    "required": true,
    "next": "S01",
    "branches": [
      { "value": true,  "next": "P07" },
      { "value": false, "next": "S01" }
    ]
  },
  {
    "id": "P07",
    "category": "profil",
    "question": "Hangi tür ilaç veya takviye kullanıyorsunuz?",
    "type": "multi",
    "required": false,
    "options": [
      { "label": "Reçeteli ilaç",         "value": "prescription" },
      { "label": "Vitamin / mineral",      "value": "vitamin" },
      { "label": "Bitkisel takviye",       "value": "herbal" },
      { "label": "Hormon tedavisi",        "value": "hormone" },
      { "label": "Psikiyatrik ilaç",       "value": "psychiatric" }
    ],
    "note": "Marka/doz bilgisi istenmez — sadece kategori.",
    "next": "S01",
    "branches": []
  }
]
```

---

## BÖLÜM 2 — Semptom Tarama (Dallanmalı)

```json
[
  {
    "id": "S01",
    "category": "semptom",
    "question": "Son 4 haftada en çok hangi semptomları yaşadınız?",
    "type": "multi",
    "required": true,
    "options": [
      { "label": "Kronik yorgunluk",       "value": "fatigue",     "score": { "enerji": 4 } },
      { "label": "Baş ağrısı / migren",    "value": "headache",    "score": { "norolojik": 3 } },
      { "label": "Uyku bozukluğu",         "value": "sleep",       "score": { "norolojik": 3, "enerji": 2 } },
      { "label": "Sindirim sorunları",     "value": "digestion",   "score": { "sindirim": 4 } },
      { "label": "Kas / eklem ağrısı",     "value": "pain",        "score": { "inflamasyon": 3 } },
      { "label": "Ruh hali dalgalanması",  "value": "mood",        "score": { "norolojik": 3 } },
      { "label": "Konsantrasyon güçlüğü",  "value": "focus",       "score": { "norolojik": 2, "enerji": 2 } },
      { "label": "Cilt sorunları",         "value": "skin",        "score": { "immun": 2, "hormonal": 2 } },
      { "label": "Nefes darlığı",          "value": "breath",      "score": { "kardiyovaskuler": 3 } },
      { "label": "Hiçbiri",               "value": "none",        "score": {} }
    ],
    "branches": [
      { "contains": "fatigue",   "addQuestion": "S02" },
      { "contains": "headache",  "addQuestion": "S03" },
      { "contains": "sleep",     "addQuestion": "S04" },
      { "contains": "digestion", "addQuestion": "S05" },
      { "contains": "pain",      "addQuestion": "S06" },
      { "contains": "none",      "next": "E01" }
    ],
    "next": "S02"
  },
  {
    "id": "S02",
    "category": "semptom",
    "question": "Yorgunluğunuz ne zaman daha şiddetli?",
    "type": "single",
    "trigger": "fatigue",
    "options": [
      { "label": "Sabah — yataktan kalkmak zor",    "value": "morning", "score": { "hormonal": 2, "enerji": 2 } },
      { "label": "Öğleden sonra çöküş yaşıyorum",  "value": "afternoon","score": { "metabolik": 2 } },
      { "label": "Akşam — gün bittikçe bitiyorum",  "value": "evening", "score": { "enerji": 3 } },
      { "label": "Sürekli, zamanla fark yok",       "value": "constant","score": { "enerji": 4, "immun": 2 } }
    ],
    "next": "S03"
  },
  {
    "id": "S03",
    "category": "semptom",
    "question": "Baş ağrısı / migreninizin karakteri nedir?",
    "type": "single",
    "trigger": "headache",
    "options": [
      { "label": "Zonklayan, nabız gibi",           "value": "throbbing","score": { "kardiyovaskuler": 2, "norolojik": 2 } },
      { "label": "Baskı hissi, kafayı sıkan",       "value": "pressure", "score": { "norolojik": 3 } },
      { "label": "Boyun / omuzdan yayılan",         "value": "tension",  "score": { "inflamasyon": 2 } },
      { "label": "Bulantı / ışık hassasiyeti eşlik ediyor", "value": "migraine","score": { "norolojik": 4 } }
    ],
    "next": "S04"
  },
  {
    "id": "S04",
    "category": "semptom",
    "question": "Uyku probleminiz nasıl tarif edersiniz?",
    "type": "multi",
    "trigger": "sleep",
    "options": [
      { "label": "Uykuya dalamıyorum (30 dk+ uyanık)",  "value": "onset",      "score": { "norolojik": 3 } },
      { "label": "Sık sık uyanıyorum",                  "value": "maintenance","score": { "norolojik": 2, "hormonal": 2 } },
      { "label": "Çok erken uyanıyorum",                "value": "early_wake", "score": { "norolojik": 2 } },
      { "label": "Uyusam da dinlenemedim hissediyorum", "value": "unrefreshed","score": { "enerji": 4 } }
    ],
    "next": "S05"
  },
  {
    "id": "S05",
    "category": "semptom",
    "question": "Sindirim şikayetiniz hangisi?",
    "type": "multi",
    "trigger": "digestion",
    "options": [
      { "label": "Şişkinlik / gaz",        "value": "bloating",     "score": { "sindirim": 3 } },
      { "label": "Kabızlık",               "value": "constipation", "score": { "sindirim": 3 } },
      { "label": "İshal / sık tuvalete gitme","value": "diarrhea",  "score": { "sindirim": 3, "immun": 2 } },
      { "label": "Mide yanması / reflü",   "value": "reflux",       "score": { "sindirim": 2 } },
      { "label": "İştah değişimi",         "value": "appetite",     "score": { "metabolik": 2 } }
    ],
    "next": "S06"
  },
  {
    "id": "S06",
    "category": "semptom",
    "question": "Ağrı bölgeniz neresi?",
    "type": "multi",
    "trigger": "pain",
    "options": [
      { "label": "Boyun / omuz",   "value": "neck",     "score": { "inflamasyon": 2 } },
      { "label": "Bel / sırt",     "value": "back",     "score": { "inflamasyon": 3 } },
      { "label": "Eklemler",       "value": "joints",   "score": { "inflamasyon": 4, "immun": 2 } },
      { "label": "Kaslar (yaygın)","value": "muscles",  "score": { "inflamasyon": 3, "enerji": 2 } },
      { "label": "Baş / yüz",     "value": "head",     "score": { "norolojik": 2 } }
    ],
    "next": "E01"
  }
]
```

---

## BÖLÜM 3 — Enerji & Ruh Hali

```json
[
  {
    "id": "E01",
    "category": "enerji",
    "question": "Genel enerji seviyenizi 1–10 arasında nasıl değerlendirirsiniz?",
    "type": "scale",
    "min": 1, "max": 10,
    "required": true,
    "branches": [
      { "range": [1, 4], "addQuestion": "E02", "score": { "enerji": 5 } },
      { "range": [5, 7], "score": { "enerji": 2 } },
      { "range": [8, 10],"score": { "enerji": 0 } }
    ],
    "next": "E02"
  },
  {
    "id": "E02",
    "category": "enerji",
    "question": "Stres seviyeniz son 1 ayda nasıldı?",
    "type": "single",
    "options": [
      { "label": "Düşük — sakin hissettim",          "value": "low",    "score": { "norolojik": 0 } },
      { "label": "Orta — bazen bunaldım",             "value": "medium", "score": { "norolojik": 2 } },
      { "label": "Yüksek — sürekli gergin hissettim","value": "high",   "score": { "norolojik": 4 } },
      { "label": "Aşırı — başa çıkamıyorum",         "value": "extreme","score": { "norolojik": 6 } }
    ],
    "next": "E03"
  },
  {
    "id": "E03",
    "category": "enerji",
    "question": "Ruh halinizi en iyi hangisi tanımlıyor?",
    "type": "multi",
    "options": [
      { "label": "İsteksizlik / motivasyon eksikliği","value": "amotivation","score": { "norolojik": 3 } },
      { "label": "Kaygı / endişe",                   "value": "anxiety",    "score": { "norolojik": 4 } },
      { "label": "Üzüntü / çökkünlük",               "value": "depression", "score": { "norolojik": 4 } },
      { "label": "Öfke / sinirlilik",                "value": "irritability","score": { "norolojik": 3 } },
      { "label": "Genel olarak dengeli hissediyorum", "value": "balanced",   "score": { "norolojik": 0 } }
    ],
    "next": "L01"
  }
]
```

---

## BÖLÜM 4 — Yaşam Tarzı

```json
[
  {
    "id": "L01",
    "category": "yasam_tarzi",
    "question": "Haftada kaç gün düzenli fiziksel aktivite yapıyorsunuz?",
    "type": "single",
    "options": [
      { "label": "Hiç",     "value": "0",  "score": { "metabolik": 3, "enerji": 2 } },
      { "label": "1–2 gün", "value": "1-2","score": { "metabolik": 1 } },
      { "label": "3–4 gün", "value": "3-4","score": { "metabolik": 0 } },
      { "label": "5+ gün",  "value": "5+", "score": { "metabolik": 0 } }
    ],
    "next": "L02"
  },
  {
    "id": "L02",
    "category": "yasam_tarzi",
    "question": "Günlük su tüketiminiz ne kadar?",
    "type": "single",
    "options": [
      { "label": "1 litreden az",    "value": "<1L", "score": { "metabolik": 3 } },
      { "label": "1–2 litre",        "value": "1-2L","score": { "metabolik": 1 } },
      { "label": "2 litreden fazla", "value": ">2L", "score": { "metabolik": 0 } }
    ],
    "next": "L03"
  },
  {
    "id": "L03",
    "category": "yasam_tarzi",
    "question": "Beslenme düzeniniz nasıl?",
    "type": "single",
    "options": [
      { "label": "Çoğunlukla işlenmiş / fast food",    "value": "processed",  "score": { "metabolik": 4, "sindirim": 3 } },
      { "label": "Karışık, düzensiz",                  "value": "mixed",      "score": { "metabolik": 2 } },
      { "label": "Çoğunlukla ev yemeği, dengeli",      "value": "balanced",   "score": { "metabolik": 0 } },
      { "label": "Bitki bazlı / özel diyet uyguluyorum","value": "special",   "score": { "metabolik": 0 } }
    ],
    "next": "L04"
  },
  {
    "id": "L04",
    "category": "yasam_tarzi",
    "question": "Günde kaç saat uyuyorsunuz (ortalama)?",
    "type": "single",
    "options": [
      { "label": "5 saatten az",  "value": "<5h", "score": { "enerji": 4, "norolojik": 3 } },
      { "label": "5–6 saat",      "value": "5-6h","score": { "enerji": 2 } },
      { "label": "7–8 saat",      "value": "7-8h","score": { "enerji": 0 } },
      { "label": "9 saatten fazla","value": ">9h", "score": { "enerji": 1, "metabolik": 1 } }
    ],
    "next": "B01"
  }
]
```

---

## BÖLÜM 5 — Biyorezonans & Enerji Algısı

```json
[
  {
    "id": "B01",
    "category": "biyorezonans",
    "question": "Elektromanyetik alanlara (telefon, Wi-Fi, ekran) karşı hassasiyet hissediyor musunuz?",
    "type": "single",
    "options": [
      { "label": "Hayır, fark etmiyorum",                       "value": "none",   "score": { "biyorezonans": 0 } },
      { "label": "Bazen — uzun süre ekran başında rahatsız olurum","value": "mild","score": { "biyorezonans": 2 } },
      { "label": "Evet — belirgin baş ağrısı, yorgunluk",       "value": "moderate","score": { "biyorezonans": 4 } },
      { "label": "Çok fazla — günlük yaşamı etkiliyor",         "value": "high",   "score": { "biyorezonans": 6 } }
    ],
    "next": "B02"
  },
  {
    "id": "B02",
    "category": "biyorezonans",
    "question": "Doğada (orman, deniz, dağ) geçirdiğiniz zaman enerji seviyenizi nasıl etkiliyor?",
    "type": "single",
    "options": [
      { "label": "Belirgin şekilde iyileşiyor",  "value": "strong_positive","score": { "biyorezonans": 4 } },
      { "label": "Biraz iyi hissediyorum",        "value": "mild_positive",  "score": { "biyorezonans": 2 } },
      { "label": "Fark etmiyor",                 "value": "neutral",        "score": { "biyorezonans": 0 } }
    ],
    "next": "B03"
  },
  {
    "id": "B03",
    "category": "biyorezonans",
    "question": "Ses veya müziğin ruh halinize etkisi nasıl?",
    "type": "single",
    "options": [
      { "label": "Çok güçlü — müzik ruh halimi hemen değiştiriyor", "value": "high",    "score": { "biyorezonans": 4, "norolojik": 2 } },
      { "label": "Orta düzey etki",                                 "value": "medium",  "score": { "biyorezonans": 2 } },
      { "label": "Çok az etki",                                     "value": "low",     "score": { "biyorezonans": 0 } }
    ],
    "next": "B04"
  },
  {
    "id": "B04",
    "category": "biyorezonans",
    "question": "Daha önce ses terapisi, meditasyon veya frekans uygulaması denediniz mi?",
    "type": "multi",
    "options": [
      { "label": "Evet, ses terapisi / tibetan kase",     "value": "sound_therapy","score": { "biyorezonans": 2 } },
      { "label": "Evet, binaural beats / isochronic ton", "value": "binaural",     "score": { "biyorezonans": 2 } },
      { "label": "Evet, meditasyon",                      "value": "meditation",   "score": { "biyorezonans": 1 } },
      { "label": "Evet, Solfeggio / 528 Hz uygulamaları", "value": "solfeggio",    "score": { "biyorezonans": 2 } },
      { "label": "Hayır, ilk kez deneyeceğim",            "value": "none",         "score": { "biyorezonans": 0 } }
    ],
    "next": "B05"
  },
  {
    "id": "B05",
    "category": "biyorezonans",
    "question": "Günde kaç dakika kendinize ayırabilirsiniz? (Frekans programı için)",
    "type": "single",
    "options": [
      { "label": "5–10 dakika",  "value": "5-10min",  "programDuration": "short" },
      { "label": "15–20 dakika", "value": "15-20min", "programDuration": "medium" },
      { "label": "30+ dakika",   "value": "30+min",   "programDuration": "full" }
    ],
    "next": null
  }
]
```

---

## Skor Boyutları & Eşikleri

| Boyut            | Düşük (0–4) | Orta (5–9) | Yüksek (10+) |
|------------------|-------------|------------|--------------|
| `enerji`         | Dengeli     | Yorgunluk riski | Kronik yorgunluk protokolü |
| `norolojik`      | Dengeli     | Stres yönetimi | Sinir sistemi desteği |
| `metabolik`      | Dengeli     | Yaşam tarzı düzenlemesi | Metabolik detoks |
| `inflamasyon`    | Dengeli     | Anti-inflamatuar destek | Yoğun protokol |
| `sindirim`       | Dengeli     | Gut sağlığı desteği | Sindirim resetleme |
| `hormonal`       | Dengeli     | Hormonal denge | Endokrin destek |
| `immun`          | Dengeli     | Bağışıklık güçlendirme | İmmün destek protokolü |
| `kardiyovaskuler`| Dengeli     | Kalp sağlığı desteği | Uzman yönlendirmesi* |
| `biyorezonans`   | Düşük hassasiyet | Orta hassasiyet | Yüksek hassasiyet → kişisel frekans |

> *`kardiyovaskuler` skoru 8+ ise kullanıcı, sağlık uzmanına başvurması yönünde bildirim alır.

---

## Dallanma Motoru — Kural Özeti

```
Soru S01 → seçilen semptomlara göre S02–S06 dinamik eklenir
Soru P04 → kronik hastalık yoksa P05–P07 atlanır
Soru E01 → enerji skoru 1–4 ise E02 zorunlu hale gelir
Skor hesaplama → tüm bölümler bittikten sonra tetiklenir
Frekans profili → skor boyutlarına göre atanır (bkz. FREQUENCY.md)
```
