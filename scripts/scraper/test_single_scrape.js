const { chromium } = require('playwright');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function testSingleScrape() {
  let browser;
  try {
    console.log("Launching browser...");
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ userAgent: USER_AGENT });
    const page = await context.newPage();

    const query = "Beaulis Beautify It BB Krem - 130 Porcelain";
    const url = `https://www.gratis.com/search?q=${encodeURIComponent(query)}`;
    console.log(`Navigating to search page: ${url}`);

    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000); // Allow React hydration

    // Let's inspect the page and extract the first product's price!
    const productInfo = await page.evaluate(() => {
      // Let's find all text elements that contain TL
      // We can look for cards. A product card on Gratis search usually contains:
      // - Product image
      // - Product name
      // - Price elements
      
      // Let's find elements that look like a price
      const divs = Array.from(document.querySelectorAll('div, span, p'));
      
      // Find all texts matching price pattern, e.g., "285,00 TL" or "114,00 TL" or "91,50 TL"
      const pricesFound = [];
      const regex = /(\d+,\d+)\s*TL/i;

      // Let's find product card wrappers by searching for parent divs that contain an image and some text
      // Let's check any elements with next.js grid layout
      const cards = [];
      
      // Let's search for elements that have classes like "text-primary-500" (normal price) and "text-primary-850" (card price)
      const normalPriceElems = Array.from(document.querySelectorAll('.text-primary-500, [class*="text-primary-500"]'));
      const promoPriceElems = Array.from(document.querySelectorAll('.text-primary-850, [class*="text-primary-850"]'));
      
      const normalPrices = normalPriceElems.map(el => el.textContent.trim()).filter(t => regex.test(t));
      const promoPrices = promoPriceElems.map(el => el.textContent.trim()).filter(t => regex.test(t));

      // Let's also look at all elements containing "/product/" in their links
      const productLinks = Array.from(document.querySelectorAll('a')).filter(a => {
        const href = a.getAttribute('href') || '';
        return href.includes('/product/') || href.includes('/p/');
      });

      const links = productLinks.map(a => ({
        href: a.getAttribute('href'),
        text: a.textContent.trim().replace(/\s+/g, ' ')
      })).slice(0, 5);

      return {
        normalPrices,
        promoPrices,
        links,
        bodyTextLength: document.body.textContent.length
      };
    });

    console.log("--- Extracted Product Info ---");
    console.log(productInfo);

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    if (browser) await browser.close();
    console.log("Done.");
  }
}

testSingleScrape();
