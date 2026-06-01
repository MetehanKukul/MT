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

const SEARCH_URL = 'https://www.gratis.com/search?q=';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const VALID_HOSTS = ['retter.io', 'img.gratis.com', 'cdn.gratis.com', 'gratis.com'];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeName(name) {
  return name
    .replace(/[-_/]/g, ' ')
    .replace(/[“”«»'"()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildSearchCandidates(name, brand) {
  const normalized = normalizeName(name);
  const words = normalized.split(' ').filter(Boolean);
  const candidates = new Set();

  if (normalized) candidates.add(normalized);
  if (brand) candidates.add(`${brand} ${normalized}`.trim());
  if (words.length > 6) candidates.add(words.slice(0, 6).join(' '));
  if (words.length > 4) candidates.add(words.slice(0, 4).join(' '));
  if (words.length > 2) candidates.add(words.slice(0, 3).join(' '));
  if (words.length > 1) candidates.add(words.slice(-3).join(' '));

  return Array.from(candidates).filter(Boolean);
}

function isValidImageUrl(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  if (
    lower.includes('default') ||
    lower.includes('placeholder') ||
    lower.includes('logo') ||
    lower.includes('/icon/') ||
    lower.includes('search-icon') ||
    lower.includes('profile-icon') ||
    lower.includes('basket-icon')
  ) return false;
  return VALID_HOSTS.some((host) => lower.includes(host)) && /\.(jpg|jpeg|png|webp)(\?|$)/i.test(lower);
}

async function extractImageFromPage(page) {
  const images = await page.evaluate(() => {
    const collected = [];
    const imgs = Array.from(document.querySelectorAll('img'));
    for (const img of imgs) {
      const src = img.currentSrc || img.src || '';
      collected.push({
        src: src || '',
        alt: img.alt || '',
        className: img.className || '',
      });
    }

    const metas = Array.from(document.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]'));
    for (const meta of metas) {
      if (meta.content) collected.push({ src: meta.content, alt: 'meta', className: '' });
    }

    return collected.filter((item) => item.src);
  });

  if (Array.isArray(images)) {
    const productImage = images.find(({ src, alt }) => {
      const lowerAlt = alt.toLowerCase();
      return (
        isValidImageUrl(src) &&
        (lowerAlt.includes('product') || lowerAlt.includes('ürün') || /call\/image\/getimage\//i.test(src) || /api\.gratis\.retter\.io/i.test(src))
      );
    });
    if (productImage) return productImage.src;

    for (const { src } of images) {
      if (isValidImageUrl(src)) return src;
    }
  }

  const pageText = await page.content();
  const regex = /https:\/\/(?:api\.gratis\.retter\.io|img(?:\.stage|\.dev|)?\.gratis\.com|cdn\.gratis\.com)[^"'\s>]+?\.(?:jpg|jpeg|png|webp)/ig;
  const matches = pageText.match(regex) || [];
  for (const match of matches) {
    if (isValidImageUrl(match)) return match;
  }

  return null;
}

async function fetchImageForProduct(page, product) {
  const candidates = buildSearchCandidates(product.UrunAd, product.Marka || '');
  const tried = new Set();

  for (const candidate of candidates) {
    if (tried.has(candidate)) continue;
    tried.add(candidate);

    const url = `${SEARCH_URL}${encodeURIComponent(candidate)}`;
    console.log(` Searching: ${candidate}`);

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
        try {
          await page.waitForSelector('img[alt="product"], img[alt*="product"], a[href*="/product/"] img', { timeout: 15000 });
        } catch {
          // If a product image selector never appears, continue and let extraction try the available images.
        }
        await page.waitForTimeout(1200);
        const imageUrl = await extractImageFromPage(page);
        if (imageUrl) {
          return imageUrl;
        }
      } catch (error) {
        const message = error?.message || String(error);
        console.warn(`   attempt ${attempt} failed: ${message}`);
        if (attempt === 2) break;
        await delay(1500);
      }
    }
  }

  return null;
}

async function run() {
  let pool;
  let browser;

  try {
    pool = await sql.connect(dbConfig);
    const productsResult = await pool.request().query(
      'SELECT UrunID, UrunAd, M.MarkaAd AS Marka FROM dbo.Urunler U LEFT JOIN dbo.Markalar M ON U.MarkaID = M.MarkaID WHERE U.ResimUrl IS NULL OR U.ResimUrl LIKE \'%default%\' OR U.ResimUrl LIKE \'%placeholder%\' ORDER BY UrunID',
    );
    const products = productsResult.recordset;

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ userAgent: USER_AGENT });
    const page = await context.newPage();

    for (let i = 0; i < products.length; i += 1) {
      const product = products[i];
      console.log(`[#${i + 1}/${products.length}] ${product.UrunAd}`);
      const imageUrl = await fetchImageForProduct(page, product);

      if (imageUrl) {
        await pool.request()
          .input('UrunID', sql.Int, product.UrunID)
          .input('ResimUrl', sql.VarChar(500), imageUrl)
          .query('UPDATE dbo.Urunler SET ResimUrl = @ResimUrl WHERE UrunID = @UrunID');
        console.log(`   -> SAVED ${imageUrl}`);
      } else {
        console.log('   -> IMAGE NOT FOUND');
      }

      await delay(800);
    }

    console.log('SYNC COMPLETED');
  } catch (err) {
    console.error(err);
  } finally {
    if (browser) await browser.close();
    if (pool) await pool.close();
  }
}

run();