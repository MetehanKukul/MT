const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function testSearch() {
  let browser;
  try {
    console.log("Launching browser...");
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ userAgent: USER_AGENT });
    const page = await context.newPage();

    const query = "Beaulis";
    const url = `https://www.gratis.com/search?q=${encodeURIComponent(query)}`;
    console.log(`Navigating to: ${url}`);
    
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    console.log("Navigation successful!");

    // Wait a bit for React to hydrate
    await page.waitForTimeout(3000);

    // Save page HTML to inspect it if needed
    const html = await page.content();
    fs.writeFileSync(path.join(__dirname, 'test_gratis_search.html'), html);
    console.log("Saved test_gratis_search.html");

    // Let's inspect some elements to find product cards and prices
    const products = await page.evaluate(() => {
      const results = [];
      
      // Try to find elements that look like product cards
      // Common class selectors on Gratis or generic next.js app:
      // Let's find any text with 'TL' or price indicators, and list classes of surrounding elements.
      const divs = Array.from(document.querySelectorAll('div, a, span'));
      
      // Let's filter elements that contain price patterns
      const priceElements = divs.filter(el => {
        const text = el.textContent || '';
        return (el.children.length === 0 || el.children.length <= 2) && 
               /\d+[,.]\d+\s*(?:TL|₺)/i.test(text.trim()) && 
               text.trim().length < 25;
      }).map(el => ({
        tag: el.tagName,
        class: el.className,
        text: el.textContent.trim(),
        parentClass: el.parentElement ? el.parentElement.className : ''
      }));

      // Let's look for images or product names to see general structure
      const productCards = Array.from(document.querySelectorAll('a[href*="/product/"], div[class*="product"], div[class*="card"]'));
      const sampleCards = productCards.slice(0, 10).map(el => ({
        tag: el.tagName,
        class: el.className,
        text: (el.textContent || '').slice(0, 100).trim().replace(/\s+/g, ' ')
      }));

      return {
        priceElements: priceElements.slice(0, 15),
        sampleCards
      };
    });

    console.log("--- Extracted Price Elements ---");
    console.log(products.priceElements);

    console.log("\n--- Extracted Sample Cards ---");
    console.log(products.sampleCards);

    // Let's try some specific selectors that are commonly used on Gratis
    const selectorPrices = await page.evaluate(() => {
      // Let's look for common price classes:
      // e.g. .price, .product-price, .discount-price, .amount, .price-box
      const selectors = [
        '.price', '.product-price', '.discount-price', '.amount',
        'div[class*="price"]', 'span[class*="price"]', 'p[class*="price"]'
      ];
      
      const found = [];
      for (const sel of selectors) {
        const elems = Array.from(document.querySelectorAll(sel));
        if (elems.length > 0) {
          found.push({
            selector: sel,
            count: elems.length,
            samples: elems.slice(0, 5).map(el => el.textContent.trim().replace(/\s+/g, ' '))
          });
        }
      }
      return found;
    });

    console.log("\n--- Selector Search Results ---");
    console.log(selectorPrices);

  } catch (err) {
    console.error("Error during test search:", err.message);
  } finally {
    if (browser) await browser.close();
    console.log("Done.");
  }
}

testSearch();
