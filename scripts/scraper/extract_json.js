const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'test_gratis_search.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Let's find Next.js data blocks in the HTML
// In Next.js App Router, the state is often streamed in script tags containing self.__next_f.push
// Let's search for script tags and inspect their content!
const scripts = [];
const regex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
while ((match = regex.exec(html)) !== null) {
  const content = match[1];
  if (content.includes('self.__next_f.push') || content.includes('products') || content.includes('discountedPrice')) {
    scripts.push(content.slice(0, 1000)); // print first 1000 chars of matching scripts
  }
}

console.log(`Found ${scripts.length} matching scripts.`);
scripts.forEach((s, idx) => {
  console.log(`\n--- Script #${idx + 1} ---`);
  console.log(s);
});

// Let's extract all products from the streamed JSON state!
// We can search for all occurrences of "products" arrays or look for the exact JSON structure
// Let's search for "prices":{"currency":"TRY" pattern
const productJsonMatches = [];
const jsonRegex = /"products":\s*(\[[^\]]*?\])/g;
let jsonMatch;
// Let's find patterns like {"id":"...", "stockStatus":"...", "prices":{...}}
const productRegex = /\{"id":"\d+","stockStatus":"[^"]+","prices":\{[^}]+?\}[^}]+?\}/g;
const pMatches = html.match(productRegex) || [];
console.log(`\nFound ${pMatches.length} raw product JSON matches.`);
pMatches.slice(0, 5).forEach((pm, idx) => {
  console.log(`\nProduct JSON #${idx + 1}:`);
  console.log(pm.slice(0, 500));
});
