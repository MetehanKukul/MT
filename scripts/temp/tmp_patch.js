
const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

code = code.replace(
  "Elements.homeBanner.style.display = 'none';", 
  "document.getElementById('pdp-view').style.display = 'none';\n      document.getElementById('home-view').style.display = 'block';\n      Elements.homeBanner.style.display = 'none';"
);

code = code.replace(
  "Elements.homeBanner.style.display = 'none';\n      Elements.homeBrands.style.display = 'none';", 
  "document.getElementById('pdp-view').style.display = 'none';\n      document.getElementById('home-view').style.display = 'block';\n      Elements.homeBanner.style.display = 'none';\n      Elements.homeBrands.style.display = 'none';"
);

fs.writeFileSync('public/app.js', code);
