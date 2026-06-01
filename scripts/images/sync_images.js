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

const SEARCH_URL = 'https://www.gratis.com/search?q=';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const BANNED_SNIPPETS = ['default.png', 'R352rYFRGO', 'QhKaehav1x', 'dPEIbU6AmL', 'placeholder', 'HfvJ7lMkPR', '/Image/get/'];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeProductName(name) {
  if (!name) return '';
  return name
    .replace(/[-_/]/g, ' ')
    .replace(/[“”«»'"()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildSearchCandidates(productName) {
  const normalized = normalizeProductName(productName);
  const words = normalized.split(' ').filter(Boolean);
  const candidates = new Set();

  if (normalized) candidates.add(normalized);
  if (words.length > 5) candidates.add(words.slice(0, 5).join(' '));
  if (words.length > 4) candidates.add(words.slice(0, 4).join(' '));
  if (words.length > 3) candidates.add(words.slice(0, 3).join(' '));
  if (words.length > 1) candidates.add(words.slice(1).join(' '));

  const noNumber = normalized.replace(/\b\d+\b/g, '').replace(/\s+/g, ' ').trim();
  if (noNumber && noNumber !== normalized) candidates.add(noNumber);

  return Array.from(candidates).filter(Boolean);
}

function extractImageUrl(html) {
  const patterns = [
    /https:\/\/api\.gratis\.retter\.io[^"'\s>]+?\/getImage\/[^"'\s>]+?\.(?:jpg|jpeg|png|webp)(?:\?[^"'\s>]*)?/i,
    /https:\/\/img(?:stage|dev|stage2|dev2)?\.gratis\.com[^"'\s>]+?\.(?:jpg|jpeg|png|webp)(?:\?[^"'\s>]*)?/i,
    /data-src=["'](https?:[^"']+?\.(?:jpg|jpeg|png|webp))(?:\?[^"']*)?["']/i,
  ];

  for (const pattern of patterns) {
    const matches = [...html.matchAll(new RegExp(pattern, 'gi'))];
    for (const match of matches) {
      const url = match[1] || match[0];
      if (url) {
        const isBanned = BANNED_SNIPPETS.some(b => url.includes(b));
        if (!isBanned) {
          return url;
        }
      }
    }
  }

  return null;
}

async function fetchGratisImages(productName) {
  const candidates = buildSearchCandidates(productName);
  for (const candidate of candidates) {
    try {
      const url = SEARCH_URL + encodeURIComponent(candidate);
      console.log(`Searching Gratis for: "${candidate}"`);
      const res = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'text/html',
        },
      });

      if (!res.ok) {
        console.warn(`  Gratis search failed (${res.status}) for: ${candidate}`);
        continue;
      }

      const text = await res.text();
      const imageUrl = extractImageUrl(text);
      if (imageUrl) {
        return imageUrl;
      }

      if (/Sonuç bulunamadı|No results|Arama Sonuçları/i.test(text)) {
        continue;
      }
    } catch (error) {
      console.warn(`  Fetch error for "${candidate}": ${error.message}`);
    }
  }

  return null;
}

async function ensureResimUrlColumn(pool) {
  try {
    const checkResult = await pool.request().query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Urunler' AND TABLE_SCHEMA = 'dbo' AND COLUMN_NAME = 'ResimUrl'`
    );
    if (checkResult.recordset.length === 0) {
      await pool.request().query(`ALTER TABLE dbo.Urunler ADD ResimUrl VARCHAR(500) NULL`);
    }
  } catch (error) { }
}

async function syncImages() {
  let pool;
  try {
    pool = await sql.connect(dbConfig);
    await ensureResimUrlColumn(pool);
    
    const productsResult = await pool.request().query("SELECT UrunID, UrunAd, ResimUrl FROM dbo.Urunler WHERE ResimUrl IS NULL OR ResimUrl LIKE '%R352rYFRGO%' OR ResimUrl LIKE '%QhKaehav1x%' OR ResimUrl LIKE '%dPEIbU6AmL%' OR ResimUrl LIKE '%placeholder%' OR ResimUrl LIKE '%HfvJ7lMkPR%' OR ResimUrl LIKE '%/Image/get/%' OR ResimUrl LIKE '%default.png%' ORDER BY UrunID");
    const products = productsResult.recordset;
    
    for (const product of products) {
      const imageUrl = await fetchGratisImages(product.UrunAd);

      if (imageUrl) {
        await pool.request()
          .input('UrunID', sql.Int, product.UrunID)
          .input('ResimUrl', sql.VarChar(500), imageUrl)
          .query('UPDATE dbo.Urunler SET ResimUrl = @ResimUrl WHERE UrunID = @UrunID');
        console.log(`Updated image for: ${product.UrunAd}`);
      } else if (product.ResimUrl && BANNED_SNIPPETS.some(b => product.ResimUrl.includes(b))) {
        await pool.request()
          .input('UrunID', sql.Int, product.UrunID)
          .query('UPDATE dbo.Urunler SET ResimUrl = NULL WHERE UrunID = @UrunID');
        console.log(`Cleared placeholder image for: ${product.UrunAd}`);
      } else {
        console.log(`No image found for: ${product.UrunAd}`);
      }

      await delay(750);
    }
    console.log('SYNC COMPLETED');
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  } finally {
    if (pool) await pool.close();
  }
}

syncImages();