# 🎓 Detaylı Proje Sunumu Kopya Kağıdı (Cheat Sheet)

Sitenizi hocanıza sunarken gelebilecek olası tüm detaylı sorulara ve değişiklik isteklerine karşı bu genişletilmiş rehber sizin en iyi yardımcınız olacak.

> [!TIP]
> Bir değişikliği yaptıktan sonra sitenin güncellenmiş halini görmek için sayfayı **yenilemeyi (Refresh / F5)** unutmayın!

---

## 🎨 1. TASARIM VE RENK DEĞİŞİKLİKLERİ (styles.css)

**🤔 Soru:** *"Sitenin ana rengini (siyah) veya vurgu rengini (altın/pudra) değiştirebilir miyiz?"*
**💡 Çözüm:**
- `public/styles.css` dosyasını açın.
- **6. Satır:** `var(--primary)` sitenin ana rengidir (Siyah/Koyu Gri).
- **9. Satır:** `var(--secondary)` sitenin ikincil vurgu rengidir (Altın/Pudra).
- Buradaki kodları silip yerine red, blue veya #FF0000 gibi renkler yazabilirsiniz.

**🤔 Soru:** *"Arka plan rengini tam beyaz veya hafif gri yapalım."*
**💡 Çözüm:**
- `public/styles.css` **12. Satır:** `var(--bg-color)` değerini `#FFFFFF` (tam beyaz) veya `#F5F5F5` (hafif gri) olarak değiştirin.

**🤔 Soru:** *"Butonların (Sepete Ekle, Kayıt Ol) rengini nasıl değiştiririz?"*
**💡 Çözüm:**
- `public/styles.css` içinde `Ctrl + F` (veya `Cmd + F`) yaparak `.primary-btn` kelimesini aratın.
- Burada `background:` veya `background-color:` özelliğini bulup istediğiniz renkle değiştirebilirsiniz. Veya en tepedeki `--primary` değerini değiştirirseniz otomatik olarak hepsi değişir!

---

## 📝 2. YAZILARI VE GÖRSELLERİ DEĞİŞTİRME (index.html)

**🤔 Soru:** *"Logodaki 'PARLAYAN KOZMETİK' yazısını 'GÜZEL KOZMETİK' yap."*
**💡 Çözüm:**
- `public/index.html` **28. satıra** gidin. `<span class="logo-text">PARLAYAN</span>` kelimesini değiştirin.

**🤔 Soru:** *"Kayan dev fotoğraftaki (Hero Banner) yazıyı ve resmi değiştir."*
**💡 Çözüm:**
- `public/index.html` **81. satırdaki** `<h1>Işıltınızı<br>Keşfedin</h1>` metnini güncelleyin.
- Resmi değiştirmek için **86. satırdaki** `<img src="/images/hero_banner_cosmetics.png"...` içindeki `src` bağlantısını başka bir resim linki ile (örneğin: `https://via.placeholder.com/800x400`) değiştirin.

**🤔 Soru:** *"İletişim modalındaki telefon numarasını değiştir."*
**💡 Çözüm:**
- `public/index.html` dosyasında `Ctrl + F` ile **"Telefon"** veya **"555-0123"** aratın. 533. satır civarındaki numarayı güncelleyin.

---

## ⚙️ 3. SİSTEMİN ÇALIŞMA MANTIĞI & JAVASCRIPT (app.js)

**🤔 Soru:** *"Bu ürünler ve markalar sayfaya statik (sabit HTML) olarak mı yazıldı, yoksa bir veritabanından mı geliyor?"*
**🗣️ Cevabınız:**
> "Ürünler sabit HTML değil hocam. Arka planda çalışan bir API sunucum var. Sayfa ilk yüklendiğinde JavaScript içerisindeki `fetch('/api/products')` fonksiyonunu kullanarak veritabanındaki ürünleri JSON formatında çekiyorum. Ardından bu verileri JavaScript ile dinamik olarak döngüye sokup ekrana (`index.html` içine) bastırıyorum."
> *(Kanıt: `app.js` dosyasının üst kısımlarındaki `// Ürünleri Çek` başlığı altındaki fetch kodlarını gösterebilirsiniz.)*

**🤔 Soru:** *"Kullanıcı 'Sepete Ekle' butonuna bastığında arka planda tam olarak ne oluyor?"*
**🗣️ Cevabınız:**
> "1. `addToCart(productId)` fonksiyonu tetikleniyor.
> 2. Ürünün ID'si sepette (cart dizisinde) var mı diye kontrol ediliyor.
> 3. Varsa sadece adedi (quantity) artırılıyor, yoksa sepete yeni bir obje olarak ekleniyor.
> 4. Sonrasında sepet state'i `localStorage`'a kaydediliyor ki sayfa yenilendiğinde sepet silinmesin.
> 5. Son adımda `updateUI()` fonksiyonunu çağırarak sağdan açılan sepet penceresinin HTML'ini ve üstteki sepet sayısını güncelliyorum."
> *(Kanıt: `app.js` içindeki `addToCart` fonksiyonu bloklarını gösterebilirsiniz.)*

**🤔 Soru:** *"Favorilere ekleme (Kalp) işlemi nasıl çalışıyor?"*
**🗣️ Cevabınız:**
> "Favoriler de sepet ile benzer bir mantıkta çalışıyor. Tıklanan ürünün ID'si `favorites` adlı diziye (Array) ekleniyor veya çıkarılıyor (`toggleFav` fonksiyonu). Sepette olduğu gibi bu veri de tarayıcının `localStorage` kısmında tutuluyor, bu sayede kullanıcı siteye tekrar girdiğinde favorileri kaybolmuyor."

**🤔 Soru:** *"Kategorilerdeki 'Filtreleme' nasıl çalışıyor?"*
**🗣️ Cevabınız:**
> "Kullanıcı bir kategoriye veya arama çubuğuna tıkladığında tüm ürünlerin bulunduğu `allProducts` dizisi üzerinde bir `filter()` işlemi uyguluyorum. Seçilen kategoriye veya aranan kelimeye (lowercase yapılarak) uyan ürünleri yeni bir diziye alıp sadece onları ekrana (`renderProducts` ile) çizdiriyorum."

---

## 🚀 4. ACİL DURUM KURTARMA TAKTİKLERİ

- **Sitede her şey kaydıysa / bozulduysa:** Hocanın isteğini yaparken yanlışlıkla bir `<div ...>` etiketini veya `}` parantezini silmiş olabilirsiniz. Hiç panik yapmayın. Hemen kod editörünüzde (VS Code / AI) **CTRL + Z** (Mac için CMD + Z) tuşlarına basarak işleminizi geri alın.
- **"Burayı nasıl kodladın?" sorusuna genel cevap:** "Hocam sayfanın iskeleti HTML ile kuruldu. Görsellik, animasyonlar ve responsive (mobil uyumlu) yapı tamamen CSS ile yazıldı. Sepete ekleme, veri çekme ve filtreleme gibi dinamik işlemlerin tümü ise Vanilla JavaScript (app.js) ile kodlandı."
- **Nerede Olduğunuzu Bulmak İçin:** Dosyalarda her zaman `Ctrl + F` aramasını kullanın. Ekranda gördüğünüz kelimeyi aratırsanız %99 kodun tam yerini bulursunuz.
