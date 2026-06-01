const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

code = code.replace(
  "window.scrollTo({ top: 0, behavior: 'smooth' });",
  "window.scrollTo({ top: 0, behavior: 'smooth' });\n  updateUI();"
);

fs.writeFileSync('public/app.js', code);
