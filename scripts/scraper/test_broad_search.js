const { chromium } = require('playwright');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function testBroad() {
  let browser;
  try {
    console.log("Launching browser...");
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ userAgent: USER_AGENT });
    const page = await context.newPage();

    const query = "Beaulis BB Krem";
    const url = `https://www.gratis.com/search?q=${encodeURIComponent(query)}`;
    console.log(`Navigating to: ${url}`);

    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    console.log("Navigation complete. Waiting for React...");
    await page.waitForTimeout(3000);

    // Let's extract prices and product links visually
    const results = await page.evaluate(() => {
      const regex = /(\d+,\d+)\s*TL/i;
      
      // Let's find all text elements on the page that match prices
      const divs = Array.from(document.querySelectorAll('div, span, p'));
      const prices = divs
        .map(el => el.textContent.trim())
        .filter(text => regex.test(text) && text.length < 30);

      // Let's find selectors
      const normalPriceElems = Array.from(document.querySelectorAll('.text-primary-500, [class*="text-primary-500"]'));
      const promoPriceElems = Array.from(document.querySelectorAll('.text-primary-850, [class*="text-primary-850"]'));
      
      const normal = normalPriceElems.map(el => el.textContent.trim());
      const promo = promoPriceElems.map(el => el.textContent.trim());

      // Let's look for link elements
      const links = Array.from(document.querySelectorAll('a'))
        .filter(a => {
          const href = a.getAttribute('href') || '';
          return href.includes('/product/') || href.includes('/p/');
        })
        .map(a => ({
          href: a.getAttribute('href'),
          text: a.textContent.trim().replace(/\s+/g, ' ')
        })).slice(0, 10);

      return {
        totalPriceTexts: prices.slice(0, 20),
        normalSelectorTexts: normal.slice(0, 10),
        promoSelectorTexts: promo.slice(0, 10),
        links
      };
    });

    console.log("--- Extraction Results ---");
    console.log(results);

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    if (browser) await browser.close();
    console.log("Done.");
  }
}

testBroad();
