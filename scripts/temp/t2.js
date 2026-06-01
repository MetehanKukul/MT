const fs = require('fs');
const html = fs.readFileSync('gratis_out.html', 'utf8');

// Looking for "images":["https://api.gratis.retter.io/1oakekr4e/CALL/Image/getImage/..."]
const pattern = /"images":\["([^"]+)"\]/g;
const matches = [...html.matchAll(pattern)];

const BANNED = ['default.png', 'R352rYFRGO', 'QhKaehav1x', 'dPEIbU6AmL', 'placeholder', 'HfvJ7lMkPR'];

const uniqueImages = new Set();
for (const m of matches) {
  const url = m[1];
  if (url && url.includes('/getImage/')) { // Only keep actual product images
      uniqueImages.add(url);
  }
}
console.log(Array.from(uniqueImages).slice(0, 10));
