const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

code = code.replace(
  '<button class="btn-buy-now add-to-cart" data-id="\' + product.id + \'">HEMEN AL</button>',
  '<button class="btn-buy-now pdp-fav-action-btn" data-id="\' + product.id + \'">FAVORİLERE EKLE</button>'
);

// We need to add the click listener for pdp-fav-action-btn
const clickHandler = `
    if (event.target.classList.contains('pdp-fav-action-btn')) {
      const id = Number.parseInt(event.target.dataset.id, 10);
      toggleFav(id);
    }
`;

const insertionPoint = "if (event.target.classList.contains('fav-btn')) {";

if (!code.includes('pdp-fav-action-btn\')) {')) {
  code = code.replace(insertionPoint, clickHandler + "\n    " + insertionPoint);
}

// We need to update UI for pdp-fav-action-btn 
const updateUIPoint = "document.querySelectorAll('.fav-btn').forEach((btn) => {";
const favUIUpdate = `
  document.querySelectorAll('.pdp-fav-action-btn').forEach((btn) => {
    const id = Number.parseInt(btn.dataset.id, 10);
    if (favorites.includes(id)) {
      btn.textContent = 'FAVORİLERDEN ÇIKAR';
      btn.classList.add('active');
    } else {
      btn.textContent = 'FAVORİLERE EKLE';
      btn.classList.remove('active');
    }
  });
`;

if (!code.includes('.pdp-fav-action-btn\').forEach')) {
  code = code.replace(updateUIPoint, favUIUpdate + "\n  " + updateUIPoint);
}

fs.writeFileSync('public/app.js', code);
console.log("Successfully replaced");
