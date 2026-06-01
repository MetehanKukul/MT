const { chromium } = require('playwright');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function testLinks() {
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
    console.log("Navigation complete. Waiting for React...");
    await page.waitForTimeout(3000);

    // Let's extract visual product cards
    const results = await page.evaluate(() => {
      // Let's find all product cards.
      // On Gratis, the product cards usually contain an image, a brand name, and product title.
      // Let's find all text elements that look like brand names or titles.
      // Let's find elements that contain product titles or descriptions
      // Let's query any cards containing "Beaulis"
      const cards = [];
      
      // Let's select all card containers.
      // On the new next.js gratis app, each product is typically rendered as a grid item or inside a card div.
      // Let's look for images and travel upwards to find card wrappers, or find all divs containing a price.
      const priceElems = Array.from(document.querySelectorAll('.text-primary-500, .text-primary-850, [class*="text-primary-500"], [class*="text-primary-850"]'));
      
      // Let's group card data by looking at parent elements that contain the titles and prices.
      // A common card container:
      const cardContainers = Array.from(document.querySelectorAll('div')).filter(div => {
        const text = div.textContent || '';
        return text.includes('Beaulis') && /\d+,\d+\s*TL/.test(text) && text.length < 800 && div.querySelectorAll('img').length > 0;
      });

      return cardContainers.map(el => {
        // Under this card, find prices and names
        const text = el.textContent.replace(/\s+/g, ' ').trim();
        return {
          cardClass: el.className,
          text
        };
      }).slice(0, 10);
    });

    console.log("--- Extracted Visual Card Containers ---");
    console.log(results);

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    if (browser) await browser.close();
    console.log("Done.");
  }
}

testLinks();
