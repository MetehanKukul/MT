const { chromium } = require('playwright');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function debugTargeted() {
  let browser;
  try {
    console.log("Launching browser...");
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ userAgent: USER_AGENT });
    const page = await context.newPage();

    const query = "Beaulis Beautify It BB";
    const url = `https://www.gratis.com/search?q=${encodeURIComponent(query)}`;
    console.log(`Navigating to: ${url}`);

    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);

    // Let's inspect the divs and find out why matchedDiv failed!
    const divsInfo = await page.evaluate(() => {
      const divs = Array.from(document.querySelectorAll('div'));
      const regexPrice = /(\d+,\d+)\s*TL/i;

      // Find any div matching regexPrice, length < 800, and having images
      const matches = divs.filter(div => {
        const text = div.textContent || '';
        return regexPrice.test(text) && text.length < 800 && div.querySelectorAll('img').length > 0;
      });

      // Let's map first 5 matches to their text and classes
      const matchedData = matches.map(el => ({
        class: el.className,
        text: el.textContent.replace(/\s+/g, ' ').trim(),
        imgCount: el.querySelectorAll('img').length,
        regexMatch: regexPrice.test(el.textContent)
      }));

      // Let's also get the entire text content of the page to see if products loaded
      const allText = document.body.textContent.replace(/\s+/g, ' ').trim();
      const hasProducts = allText.includes('Porcelain') || allText.includes('Krem');

      return {
        matchedCount: matches.length,
        matchedData: matchedData.slice(0, 10),
        allTextSnippet: allText.slice(0, 1000),
        hasProducts
      };
    });

    console.log("--- Debug Targeted Search Results ---");
    console.log("Matched count:", divsInfo.matchedCount);
    console.log("Has products:", divsInfo.hasProducts);
    console.log("All text snippet:", divsInfo.allTextSnippet);
    console.log("\nMatched Data:");
    console.log(divsInfo.matchedData);

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    if (browser) await browser.close();
    console.log("Done.");
  }
}

debugTargeted();
