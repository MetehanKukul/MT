const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();
  const q = encodeURIComponent('Compact It 3 in 1 Face Palette');
  console.log('URL=', `https://www.gratis.com/arama?q=${q}`);
  await page.goto(`https://www.gratis.com/arama?q=${q}`);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(5000);
  const imgs = await page.$$eval('img', (imgs) =>
    imgs.slice(0, 30).map((img) => ({
      src: img.src,
      alt: img.alt,
      class: img.className,
      parent: img.parentElement ? img.parentElement.tagName : null,
      outer: img.outerHTML.slice(0, 200),
    })),
  );
  console.log(JSON.stringify(imgs, null, 2));
  const cards = await page.$$eval(
    '[data-testid], .product-card, a[href*="-p-"]',
    (els) =>
      els.slice(0, 30).map((el) => ({
        tag: el.tagName,
        testid: el.getAttribute('data-testid'),
        class: el.className,
        outer: el.outerHTML.slice(0, 250),
      })),
  );
  console.log('cards', JSON.stringify(cards, null, 2));
  await browser.close();
})();
