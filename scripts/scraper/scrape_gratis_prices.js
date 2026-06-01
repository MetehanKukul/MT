const { chromium } = require('playwright');
const sql = require('mssql/msnodesqlv8');

const dbConfig = {
  server: 'DESKTOP-HO38PT5\\SQLEXPRESS',
  database: 'ParlayanKozmetik.com',
  driver: 'ODBC Driver 17 for SQL Server',
  options: {
    trustedConnection: true,
    trustServerCertificate: true
  }
};

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Normalize names for fuzzy matching
function cleanName(str) {
  if (!str) return '';
  return str.toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[-–_’'"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Token-based matching to find the best match between scraped name and database name
function isMatch(dbName, scrapedName) {
  const cleanDb = cleanName(dbName);
  const cleanScraped = cleanName(scrapedName);

  if (cleanDb === cleanScraped) return true;
  if (cleanDb.includes(cleanScraped) || cleanScraped.includes(cleanDb)) return true;

  // Split into words and check overlap
  const dbWords = cleanDb.split(' ').filter(w => w.length > 1);
  const scrapedWords = cleanScraped.split(' ').filter(w => w.length > 1);

  let matchCount = 0;
  for (const word of dbWords) {
    if (scrapedWords.includes(word)) {
      matchCount++;
    }
  }

  // If 75% of the database product name words match the scraped name, it is a match!
  const threshold = Math.min(dbWords.length, 3);
  return matchCount >= threshold;
}

async function run() {
  let pool;
  let browser;

  try {
    console.log("Connecting to SQL Server database...");
    pool = await sql.connect(dbConfig);
    console.log("Database connection successful!");

    // Fetch all products with their brand names
    const productsResult = await pool.request().query(`
      SELECT U.UrunID AS id, U.UrunAd AS name, M.MarkaAd AS brand, U.Fiyat AS currentPrice 
      FROM dbo.Urunler U 
      LEFT JOIN dbo.Markalar M ON U.MarkaID = M.MarkaID 
      ORDER BY U.UrunID
    `);
    const allProducts = productsResult.recordset;
    console.log(`Total database products to process: ${allProducts.length}`);

    // Track which product IDs have been updated
    const updatedIds = new Set();

    console.log("Launching headless browser...");
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ userAgent: USER_AGENT });
    const page = await context.newPage();

    // major brands in database
    const majorBrands = ['Benri', 'Beaulis', 'Nivea', 'Eklips', 'Gillette', 'Pantene', 'Kotex', 'Imprime', 'Kalyon'];

    console.log("\n==========================================");
    console.log("PASS 1: Brand-Wide Scrapes");
    console.log("==========================================");

    for (const brand of majorBrands) {
      console.log(`\n--- Starting broad scan for brand: ${brand} ---`);
      const searchUrl = `https://www.gratis.com/search?q=${encodeURIComponent(brand)}`;
      
      try {
        await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 60000 });
        console.log("Navigation successful, waiting for hydration...");
        await page.waitForTimeout(3000);

        // Infinite scroll down to load more products
        console.log("Scrolling down to load products...");
        for (let j = 0; j < 5; j++) {
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await delay(1200);
        }

        // Extract all product cards from the page (Resilient parser)
        const scrapedCards = await page.evaluate(() => {
          const divs = Array.from(document.querySelectorAll('div'));
          const regexPrice = /(\d+,\d+)\s*TL/i;

          // Filter card containers: must contain price, an image, and be relatively compact
          const cardContainers = divs.filter(div => {
            const text = div.textContent || '';
            return regexPrice.test(text) && text.length < 800 && div.querySelectorAll('img').length > 0;
          });

          // Extract clean text of each card
          return cardContainers.map(el => el.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean);
        });

        console.log(`Extracted ${scrapedCards.length} product card strings from search results.`);

        // Parse price and names, and match against database products of this brand
        let brandMatches = 0;
        const brandProducts = allProducts.filter(p => (p.brand || '').toLowerCase().includes(brand.toLowerCase()));

        for (const cardText of scrapedCards) {
          // Find all prices in the card
          const priceMatches = cardText.match(/\b\d+,\d+\s*TL\b/g);
          if (!priceMatches || priceMatches.length === 0) continue;

          // Extract title by splitting by the first price, and stripping any review score tags
          const firstPrice = priceMatches[0];
          const rawName = cardText.split(firstPrice)[0];
          const namePart = rawName.replace(/\(\d+\)[\d,B\+M]*\+?/g, '').trim();
          if (!namePart) continue;

          // Regular price is the first, promo/card price is the second if present
          const normalPriceStr = priceMatches[0];
          const promoPriceStr = priceMatches.length > 1 ? priceMatches[1] : priceMatches[0];

          // Parse to floats
          const normalPrice = parseFloat(normalPriceStr.replace('TL', '').replace(',', '.').trim());
          const promoPrice = parseFloat(promoPriceStr.replace('TL', '').replace(',', '.').trim());
          
          // Use the lowest price
          const finalPrice = Math.min(normalPrice, promoPrice);

          // Find database match
          for (const dbProd of brandProducts) {
            if (updatedIds.has(dbProd.id)) continue;

            if (isMatch(dbProd.name, namePart)) {
              // Update price in SQL Server
              await pool.request()
                .input('id', sql.Int, dbProd.id)
                .input('price', sql.Decimal(10, 2), finalPrice)
                .query('UPDATE dbo.Urunler SET Fiyat = @price WHERE UrunID = @id');

              updatedIds.add(dbProd.id);
              brandMatches++;
              console.log(`[UPDATED] ID: ${dbProd.id} | Match: "${dbProd.name}" ➔ "${namePart}" | Price: ${finalPrice} TL (Before: ${dbProd.currentPrice} TL)`);
              break;
            }
          }
        }
        console.log(`Broad scan for ${brand} successfully matched and updated ${brandMatches} products!`);
      } catch (brandErr) {
        console.warn(`broad scan for ${brand} encountered an error: ${brandErr.message}`);
      }

      await delay(1000);
    }

    console.log("\n==========================================");
    console.log("PASS 2: Targeted Product Scrapes");
    console.log("==========================================");

    const remainingProducts = allProducts.filter(p => !updatedIds.has(p.id));
    console.log(`Remaining products to scan individually: ${remainingProducts.length}`);

    // Scan up to 100 targeted items for this run
    const limit = Math.min(remainingProducts.length, 100);

    for (let i = 0; i < limit; i++) {
      const p = remainingProducts[i];
      // Generate clean short candidate search term: brand + first 3 words of name
      const nameWords = p.name.split(' ').filter(w => w.length > 1);
      const queryWords = nameWords.slice(0, Math.min(nameWords.length, 3));
      const query = `${p.brand || ''} ${queryWords.join(' ')}`.trim();

      console.log(`[#${i + 1}/${limit}] Targeted search for: "${p.name}" (Query: "${query}")`);
      const searchUrl = `https://www.gratis.com/search?q=${encodeURIComponent(query)}`;

      try {
        await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 45000 });
        await page.waitForTimeout(2000);

        const cardText = await page.evaluate(() => {
          const divs = Array.from(document.querySelectorAll('div'));
          const regexPrice = /(\d+,\d+)\s*TL/i;

          // Find the first matching container (Resilient selector without requiring parenthesis)
          const matchedDiv = divs.find(div => {
            const text = div.textContent || '';
            return regexPrice.test(text) && text.length < 800 && div.querySelectorAll('img').length > 0;
          });

          return matchedDiv ? matchedDiv.textContent.replace(/\s+/g, ' ').trim() : null;
        });

        if (cardText) {
          const priceMatches = cardText.match(/\b\d+,\d+\s*TL\b/g);

          if (priceMatches && priceMatches.length > 0) {
            const firstPrice = priceMatches[0];
            const rawName = cardText.split(firstPrice)[0];
            const namePart = rawName.replace(/\(\d+\)[\d,B\+M]*\+?/g, '').trim();

            const normalPrice = parseFloat(priceMatches[0].replace('TL', '').replace(',', '.').trim());
            const promoPrice = priceMatches.length > 1 ? parseFloat(priceMatches[1].replace('TL', '').replace(',', '.').trim()) : normalPrice;
            const finalPrice = Math.min(normalPrice, promoPrice);

            await pool.request()
              .input('id', sql.Int, p.id)
              .input('price', sql.Decimal(10, 2), finalPrice)
              .query('UPDATE dbo.Urunler SET Fiyat = @price WHERE UrunID = @id');

            updatedIds.add(p.id);
            console.log(`   -> SUCCESS: "${namePart}" ➔ Price: ${finalPrice} TL`);
          } else {
            console.log("   -> Price patterns not found on card.");
          }
        } else {
          console.log("   -> No product card matches returned.");
        }
      } catch (err) {
        console.warn(`   -> Error processing product ${p.id}: ${err.message}`);
      }

      await delay(1200);
    }

    console.log("\n==========================================");
    console.log(`SCRAPING RUN COMPLETE! Total updated products: ${updatedIds.size}`);
    console.log("==========================================");

  } catch (err) {
    console.error("Scraping error:", err.message);
  } finally {
    if (browser) await browser.close();
    if (pool) await pool.close();
    console.log("Database connection and browser closed safely.");
  }
}

run();
