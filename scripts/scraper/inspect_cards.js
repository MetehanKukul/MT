const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'test_gratis_search.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Let's find product links in the HTML
// A product link typically looks like <a href="/product/brand-name-category-id" class="..." ...>Product Name</a>
// Let's find tags like <a href="/product/...
const productLinks = [];
const regex = /<a\b[^>]*href="\/product\/([^"]+?)"[^>]*>([\s\S]*?)<\/a>/gi;
let match;
while ((match = regex.exec(html)) !== null) {
  productLinks.push({
    url: match[1],
    content: match[2].trim().replace(/\s+/g, ' ')
  });
}

console.log(`Found ${productLinks.length} product links.`);
productLinks.slice(0, 10).forEach((pl, idx) => {
  console.log(`\nLink #${idx + 1}:`);
  console.log(`URL: /product/${pl.url}`);
  console.log(`Content: ${pl.content.slice(0, 300)}`);
});

// Let's look for tags that contain product images and titles
// Let's search for "text-primary-850" (discount price) and see how far it is from product title links in the HTML!
const indexPrice = html.indexOf('text-primary-850');
if (indexPrice !== -1) {
  console.log("\n--- HTML surrounding a promo price ---");
  const start = Math.max(0, indexPrice - 300);
  const end = Math.min(html.length, indexPrice + 1200);
  console.log(html.slice(start, end));
}
