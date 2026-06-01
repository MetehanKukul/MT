const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'test_gratis_search.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Let's find matches of prices like "285,00 TL" or "114,00 TL"
// and extract the surrounding 500 characters of HTML to inspect class names and parent elements!
const matches = [];
const regex = /\b\d+,\d+\s*TL\b/g;
let match;
while ((match = regex.exec(html)) !== null) {
  const index = match.index;
  const start = Math.max(0, index - 250);
  const end = Math.min(html.length, index + 250);
  matches.push({
    price: match[0],
    snippet: html.slice(start, end)
  });
  if (matches.length >= 5) break;
}

console.log("--- Surrounding HTML Snippets ---");
matches.forEach((m, idx) => {
  console.log(`\n[Snippet #${idx + 1}] Price: ${m.price}`);
  console.log(m.snippet);
});
