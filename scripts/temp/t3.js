const fs = require('fs');
const html = fs.readFileSync('gratis_out.html', 'utf8');

const regex = /https:\/\/api\.gratis\.retter\.io[^"'\s>]+?\/getImage\/[^"'\s>]+?\.(?:jpg|jpeg|png|webp)/gi;
const matches = html.match(regex) || [];

// unique
console.log([...new Set(matches)].slice(0, 10));
