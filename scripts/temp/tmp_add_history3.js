const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const popstateHandler = `
// --- History API for Back Button Support ---
window.addEventListener('popstate', (event) => {
  const pdpView = document.getElementById('pdp-view');
  const homeView = document.getElementById('home-view');
  
  if (event.state && event.state.view === 'pdp' && event.state.productId) {
    renderProductDetailSilent(event.state.productId);
  } else {
    pdpView.style.display = 'none';
    homeView.style.display = 'block';
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }
});

function closePdpUI() {
  document.getElementById('pdp-view').style.display='none'; 
  document.getElementById('home-view').style.display='block';
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

function showProductDetail(productId) {
  if (!history.state || history.state.view !== 'pdp' || history.state.productId !== productId) {
    history.pushState({view: 'pdp', productId: productId}, '', '#product-' + productId);
  }
  renderProductDetailSilent(productId);
}
`;

const startIndex = code.indexOf('function showProductDetail(productId) {');
if (startIndex !== -1) {
  // Let's just remove the rest of the file assuming it's the last function
  // because in the previous step we appended it.
  code = code.substring(0, startIndex);
  code = code + popstateHandler;
  fs.writeFileSync('public/app.js', code);
  console.log("Successfully patched");
} else {
  console.log("Not found");
}
