const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const popstateHandler = `

// --- History API for Back Button Support ---
window.addEventListener('popstate', (event) => {
  const pdpView = document.getElementById('pdp-view');
  const homeView = document.getElementById('home-view');
  
  if (event.state && event.state.view === 'pdp' && event.state.productId) {
    // We are going back to a product detail page
    renderProductDetailSilent(event.state.productId);
  } else {
    // No state means we are back to the home page / product list
    pdpView.style.display = 'none';
    homeView.style.display = 'block';
    // Clear hash so URL looks normal again
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }
});

function closePdpUI() {
  const pdpView = document.getElementById('pdp-view');
  const homeView = document.getElementById('home-view');
  pdpView.style.display = 'none';
  homeView.style.display = 'block';
  // Remove hash and state
  history.pushState(null, '', window.location.pathname + window.location.search);
}

function renderProductDetailSilent(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;
  
  const pdpView = document.getElementById('pdp-view');
  const homeView = document.getElementById('home-view');
  
  const breadcrumbText = 
    '<a href="#" onclick="closePdpUI(); return false;">Anasayfa</a>' +
    '<span>&gt;</span>' +
    '<span>' + (product.mainCategory || 'Kategori') + '</span>' +
    '<span>&gt;</span>' +
    '<span>' + (product.category || '') + '</span>' +
    '<span>&gt;</span>' +
    '<b>' + (product.brand || '') + ' ' + (product.name) + '</b>';
  
  const imgUrl = getProductImageUrl(product.image);

  pdpView.innerHTML = 
    '<div class="container pdp-breadcrumb" id="pdp-breadcrumb">' +
      breadcrumbText +
    '</div>' +
    '<div class="container pdp-container">' +
      '<div class="pdp-left">' +
        '<div class="pdp-thumbnails">' +
          '<img src="' + imgUrl + '" class="pdp-thumb" alt="thumb1" />' +
          '<img src="' + imgUrl + '" class="pdp-thumb" alt="thumb2" />' +
        '</div>' +
        '<div class="pdp-main-image-box">' +
          '<span class="pdp-badge">Parlayan\\'a Özel</span>' +
          '<img src="' + imgUrl + '" class="pdp-main-image" />' +
          '<div class="pdp-image-actions">' +
            '<button title="Paylaş">📤</button>' +
            '<button class="fav-btn" data-id="' + product.id + '" title="Favorilere Ekle">♡</button>' +
          '</div>' +
          '<button style="position: absolute; bottom: 15px; right: 15px; background: none; border: none; font-size: 20px; color: #4f167a; cursor: pointer;">🔍</button>' +
        '</div>' +
      '</div>' +
      '<div class="pdp-right">' +
        '<div class="pdp-brand-and-fav">' +
          '<span class="pdp-brand">' + (product.brand || 'Marka') + '</span>' +
          '<span class="pdp-fav-info">💜 41,6B+ Kişi Favoriledi!</span>' +
        '</div>' +
        '<h1 class="pdp-title">' + product.name + '</h1>' +
        '<div class="pdp-rating">' +
          '<span class="pdp-rating-stars">★★★★☆</span>' +
          '<span>(4.2)</span>' +
          '<span>403 Değerlendirme</span>' +
          '<a href="#" class="pdp-reviews-link">Tüm Yorumları Görüntüle</a>' +
        '</div>' +
        '<div class="pdp-price-area">' +
          (product.oldPrice ? '<div class="pdp-old-price">' + product.oldPrice + '</div>' : '') +
          '<div class="pdp-card-label">Parlayan Kart ile</div>' +
          '<div class="pdp-new-price">' + product.price + '</div>' +
        '</div>' +
        '<div class="pdp-actions">' +
          '<button class="btn-buy-now add-to-cart" data-id="' + product.id + '">HEMEN AL</button>' +
          '<button class="btn-add-to-cart add-to-cart" data-id="' + product.id + '">SEPETE EKLE</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  
  homeView.style.display = 'none';
  pdpView.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
`;

const newShowProductDetail = `
function showProductDetail(productId) {
  // Save current home state so back button works easily
  if (!history.state || history.state.view !== 'pdp') {
    // push state for the product
    history.pushState({view: 'pdp', productId: productId}, '', '#product-' + productId);
  }
  renderProductDetailSilent(productId);
}
`;

const startPattern = 'function showProductDetail(productId) {';
const endPattern = '  window.scrollTo({ top: 0, behavior: \'smooth\' });\n}';

const startIndex = code.indexOf(startPattern);
const endIndex = code.indexOf(endPattern, startIndex) + endPattern.length;

if (startIndex !== -1 && endIndex > startIndex) {
  code = code.substring(0, startIndex) + popstateHandler + newShowProductDetail + code.substring(endIndex);
  fs.writeFileSync('public/app.js', code);
  console.log("Successfully replaced showProductDetail layout");
} else {
  console.log("Could not find the function patterns!");
}
