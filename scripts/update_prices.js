const { MongoClient } = require('mongodb');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ParlayanKozmetik';
const client = new MongoClient(uri);

const sleep = ms => new Promise(res => setTimeout(res, ms));

async function runUpdater() {
  let browser;
  try {
    console.log('MongoDB Atlas\'a bağlanılıyor...');
    await client.connect();
    const db = client.db();
    const collection = db.collection('products');

    const products = await collection.find({}).toArray();
    console.log(`Veritabanında toplam ${products.length} ürün bulundu.`);
    
    console.log('Tarayıcı açılıyor (Gerçek tarayıcı modunda)... Lütfen açılan Chrome penceresini kapatmayın!');
    // Headless: false ile gerçek Chrome açıyoruz ki güvenlik duvarını aşalım!
    browser = await puppeteer.launch({ 
      headless: false, 
      defaultViewport: null,
      args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    // Tarayıcının Gratis'i engelsiz açması için bekleme
    await page.goto('https://www.gratis.com', { waitUntil: 'networkidle2' });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      // Kullanıcının belirttiği gibi "ana ürün" (main product) ismini bulmalıyız.
      // Örn: "Beaulis Tone’n Roll Fondöten 107 Warm Beige" -> "Beaulis Tone’n Roll Fondöten"
      // Örn: "Beautify It BB Krem - 130 Porcelain" -> "Beaulis Beautify It BB Krem"
      
      let baseName = product.name.split(/[0-9]+/)[0]; // İlk rakamdan (renk kodu, ml vb) sonrasını at
      baseName = baseName.replace(/[-,\s:.]+$/, '').trim(); // Sonda kalan tire, boşluk, nokta veya iki noktayı sil
      
      let queryName = baseName;
      // Eğer ana ürün adının içinde marka ismi yoksa, daha iyi arama için başa markayı ekle
      if (product.brand && !queryName.toLowerCase().includes(product.brand.toLowerCase())) {
        queryName = `${product.brand} ${queryName}`;
      }
      
      console.log(`[${i + 1}/${products.length}] Aranıyor: ${queryName}...`);
      
      try {
        // Doğrudan arama URL'sine gidiyoruz (Gratis araması /search?q= formatındadır)
        const searchUrl = `https://www.gratis.com/search?q=${encodeURIComponent(queryName)}`;
        
        // Timeout olsa bile sayfanın DOM'u yüklenmiş olabilir, hata fırlatmasını engelliyoruz
        await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
        
        // Ürün kartlarının yüklenmesini bekle
        await page.waitForSelector('.border.rounded-xl.bg-white, [class*="border-gray-200"]', { timeout: 5000 }).catch(() => {});
        // Javascript'in fiyatları tam render etmesi için kısa bir süre bekle
        await sleep(4000);
        
        // Fiyatı sayfadan çek
        const priceData = await page.evaluate((dbProductName) => {
          // Sayfadaki tüm ürün kartlarını bul
          const cards = Array.from(document.querySelectorAll('.border.rounded-xl.bg-white, [class*="border-gray-200"][class*="rounded-xl"]'));
          if (cards.length === 0) return null;

          let fallbackData = null;

          for (let card of cards) {
            const text = card.innerText || '';
            const isOutOfStock = text.toUpperCase().includes('STOKTA YOK') || text.toUpperCase().includes('TÜKENDİ');

            // Fiyat formatını ara (Örn: 127,50 TL veya 319,00 TL)
            const matches = text.match(/\b\d{1,3}(?:[.,]\d{3})*\s*[,.]\s*\d{2}\s*TL/gi);
            if (!matches || matches.length === 0) continue;

            const parsedPrices = matches.map(m => {
              const numStr = m.replace(/[^0-9,]/g, '').replace(',', '.');
              return parseFloat(numStr);
            }).filter(num => !isNaN(num) && num > 0);

            if (parsedPrices.length === 0) continue;

            // Satış fiyatı (price) her zaman en düşük fiyattır (indirimli fiyat)
            const price = Math.min(...parsedPrices);
            // Üstü çizili fiyat (oldPrice) sayfada birden fazla fiyat varsa en büyük fiyattır. Tek fiyat varsa indirim yoktur (null).
            const oldPrice = parsedPrices.length > 1 ? Math.max(...parsedPrices) : null;

            // Karşılaştırma için isimleri temizle
            const cardNameClean = text.split('\n')[0].replace(/\s+/g, ' ').trim().toLowerCase();
            const dbNameClean = dbProductName.replace(/\s+/g, ' ').trim().toLowerCase();

            // Eğer birebir aradığımız ürün varyantı ise ve stoktaysa doğrudan bu fiyat bilgisini dön
            const isExactMatch = cardNameClean.includes(dbNameClean) || dbNameClean.includes(cardNameClean);

            if (isExactMatch && !isOutOfStock) {
              return { price, oldPrice };
            }

            // Stokta olan ilk benzer ürün varyantını yedek olarak kaydet
            if (!isOutOfStock && !fallbackData) {
              fallbackData = { price, oldPrice };
            }
          }

          return fallbackData;
        }, product.name);

        if (priceData && typeof priceData === 'object') {
          const { price, oldPrice } = priceData;
          if (price && price > 0) {
            await collection.updateOne(
              { _id: product._id },
              { $set: { price, oldPrice } }
            );
            console.log(`   ✅ Fiyat güncellendi: ${product.price} TL -> ${price} TL (Eski: ${oldPrice || 'Yok'} TL)`);
            successCount++;
            await sleep(1000);
            continue;
          }
        }
        
        console.log(`   ❌ Fiyat okunamadı (Sonuç çıkmamış veya tükenmiş olabilir).`);
        failCount++;
      } catch (err) {
        console.log(`   ❌ Sayfa yüklenirken hata oluştu.`);
        failCount++;
      }
      
      await sleep(2000); // 2 saniye dinlen
    }

    console.log('-----------------------------------');
    console.log('🎉 TARAMA TAMAMLANDI 🎉');
    console.log(`Başarıyla güncellenen: ${successCount}, Bulunamayan: ${failCount}`);

  } catch (err) {
    console.error('Kritik bir hata oluştu:', err);
  } finally {
    if (browser) await browser.close();
    await client.close();
    process.exit(0);
  }
}

runUpdater();
