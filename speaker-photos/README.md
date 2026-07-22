# Konuşmacı Fotoğrafları — 29-30 Temmuz Çalıştayı

50 kişilik konuşmacı listesi için profil fotoğrafı kaynakları ve tek tip
(10×15 cm, aynı renk tonu) fotoğraf üretim aracı.

> **Neden hazır fotoğraflar yok?** Bu çalışma ortamının ağ politikası dış
> sitelerden dosya indirmeye izin vermiyor (LinkedIn zaten oturum açmadan
> fotoğraf vermez). Bu yüzden her konuşmacı için doğrulanmış kaynak URL'leri
> araştırıldı (`manifest.csv`) ve indirme + standartlaştırma işini normal
> internet erişimi olan bir bilgisayarda tek komutla yapan betik hazırlandı.

## Kullanım

```bash
pip install pillow requests
cd speaker-photos

python process_photos.py download   # otomatik indirilebilenleri çeker
                                    # LinkedIn/eksik olanları listeler
python process_photos.py process    # photos_raw/ -> photos_final/ (10x15cm, 300dpi, tek renk tonu)
python process_photos.py sheet      # contact_sheet.pdf (kimlik kontrolü için)
```

- LinkedIn kaynaklı fotoğraflar: profili oturum açılmış tarayıcıda açıp
  fotoğrafı `photos_raw/` altına `NN_Isim.jpg` adıyla kaydedin (ör.
  `08_Janina_Seiler.jpg`). Betik gerisini halleder.
- Elinizde zaten bulunan fotoğrafları da aynı adlandırmayla `photos_raw/`
  altına atabilirsiniz; hepsi aynı boyut ve renk düzenine getirilir.

## Çıktı standardı

| Özellik | Değer |
|---|---|
| Boyut | 10 × 15 cm (dikey), 1181 × 1772 px |
| Çözünürlük | 300 DPI (baskı kalitesi) |
| Kırpma | 2:3, yüz üst üçte birlikte kalacak şekilde üstten ağırlıklı |
| Renk | Gri-dünya beyaz dengesi + parlaklık eşitleme + hafif kontrast/doygunluk normalizasyonu (tüm sette aynı) |
| Format | JPEG, kalite 92 |

## Kaynak durumu (manifest.csv özeti)

- **Yüksek güven (resmî sayfa/basın fotoğrafı):** Ali Fidan, Emrullah Gölcük,
  Gökhan Demirtola, Edward Kwakwa (WIPO Flickr), Etienne Sanz de Acedo (INTA
  basın kiti), Gert-Jan van Diest, M. Zeki Durak, U. Çağdaş Tahiroğulları,
  Erdoğan Öz, Ömer Bircan, Yıldıray Gençer, Arzu Oğuz, Münir Oğuz, Neil
  Narriman, Claudio Bergonzi, Nicole Klug, Direnç Bada, Ali Bozoğlu.
- **LinkedIn (manuel kayıt gerekli):** Janina Seiler, Lucy Hambloch, Mohamed
  Taha, Çağdaş Aksoy, Aslı Tireli, Bahar Dağhan, Colin Denyer, Bora Çakmak,
  Niall McCarthy.
- **Orta güven (haber/kişisel site fotoğrafı):** Sevil Hüseyinova (WHO),
  Zeliha Özdemir Köken, Yunus Bayram, Tayyip Eroğlu, Mehmet Taştan (kişisel
  sitesi — hakim/şair, aynı kişi olduğu teyit edilmeli), Mesut Ük (REDES
  haberleri), Recep Tolga Kıvanç, Artur Shamilov, Burak Deveci.
- **Bulunamadı (ikinci tur aramada da):** Cemil Cem Aydın, Ali Kemal Al,
  Özgür Atış, Evrim Kayataş Sencer, Hasibe Işıklı, Marcus Akota (isim yazımı
  büyük olasılıkla hatalı), Şanel Karatepe (kaynaklarda "Şanel Ala"),
  Emmanuel Aubriot, J. E. Blasco Ruiz, Süleyman Kenar, Anton Pakhomov
  (yalnız ZoomInfo kaydı), Mehmet Çakmak. Bunlar için en sağlıklı yol
  kurumlarından/kendilerinden vesikalık istemek.

Notlar:
- Listede 22 = 46 (Yıldıray Gençer) ve 38 = 48 (Süleyman Kenar) mükerrer.
- 36 "Nicola Klug" → doğrusu **Nicole Klug**; 49 "Artur Samilova" → muhtemelen
  **Artur Shamilov** (FAO Budapeşte).
- 40 Niall McCarthy'nin kurumu tespit edildi: **Pharmaceutical Security
  Institute (PSI) EMEA Bölge Direktörü** (eski HPRA).
- Betik her satır için `source_url` + `alt_url` dener, sayfadaki aday
  görsellerden en büyüğünü seçer (Flickr boyut varyantları dahil).
