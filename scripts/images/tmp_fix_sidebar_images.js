const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const oldStr = '<div class="mini-item-img">${getIcon(product.category)}</div>';
const newStr = '<div class="mini-item-img" style="background: #fff; padding: 2px;"><img src="${getProductImageUrl(product.image)}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 4px;" onerror="this.onerror=null;this.src=\'${DEFAULT_PRODUCT_IMAGE}\';"/></div>';

code = code.split(oldStr).join(newStr);
fs.writeFileSync('public/app.js', code);
console.log('App.js updated');