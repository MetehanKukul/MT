const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'test_gratis_search.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Let's extract ALL href attributes from the HTML!
const hrefs = new Set();
const regex = /href="([^"]+?)"/gi;
let match;
while ((match = regex.exec(html)) !== null) {
  hrefs.add(match[1]);
}

console.log(`Extracted ${hrefs.size} unique href attributes.`);

// Let's print out links that look like products:
// Look for links containing '-p-', '/p/', '/product', '/urun', '/brand', or have a code like -10290536
const productLinks = Array.from(hrefs).filter(href => {
  const lower = href.toLowerCase();
  return lower.includes('-p-') || lower.includes('/p/') || lower.includes('/urun/') || lower.includes('/product/') || /\d{6,}/.test(href);
});

console.log(`\nFound ${productLinks.length} product-like links:`);
productLinks.slice(0, 20).forEach(pl => console.log("- " + pl));

// Let's also search for all occurrences of names of products like "Beautify It BB Krem" or "BB Krem" in the text
const titleSearches = ["BB Krem", "Beautify", "Beaulis", "Pantene", "Nivea"];
titleSearches.forEach(term => {
  const index = html.indexOf(term);
  if (index !== -1) {
    console.log(`\n--- HTML surrounding term '${term}' ---`);
    console.log(html.slice(Math.max(0, index - 100), Math.min(html.length, index + 300)));
  }
});
