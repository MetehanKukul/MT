const fs = require('fs');

let code = fs.readFileSync('public/app.js', 'utf8');



const popstateHandler = `

// --- History API for Back Button Support ---
window.addEventListener('popstate', (event) => {
  const pdpView = document.getElementById('pdp-view');
  const homeView = document.getElementById('home-view');
  
  if (event.state && event.state.view === 'pdp' && event.state.productId) {
    // We are going back to a product detail page
    // Using a silent rendering so it doesn't pushState again
    renderProductDetailSilent(event.state.productId);
  } else {
    // No state means we are back to the home page / product list
    pdpView.style.display = 'none';
    homeView.style.display = 'block';
    window.scrollTo(0, 0); // optional: could restore scroll position if tracked
  }
});

function closePdpUI() {
  history.pushState(null, '', window.location.pathname);
  document.getElementById('pdp-view').style.display='none'; 
  document.getElementById('home-view').style.display='block';
}

function renderProductDetailSilent(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;
  
  const pdpView = document.getElementById('pdp-view');
  const homeView = document.getElementById('home-view');
  
  const breadcrumbText = \`
    <a href="#" onclick="closePdpUI(); return false;">Anasayfa</a>
    <span>&gt;</span>
    <span>\${product.mainCategory || 'Kategori'}</span>
    <span>&gt;</span>
    <span>\${product.category || ''}</span>
    <span>&gt;</span>
    <b>\${product.brand || ''} \${product.name}</b>
  \`;
  
  const imgUrl = getProductImageUrl(product.image);

  pdpView.innerHTML = \`
    <div class="container pdp-breadcrumb" id="pdp-breadcrumb">
      \${breadcrumbText}
    </div>
    <div class="container pdp-container">
      <div class="pdp-left">
        <div class="pdp-thumbnails">
          <img src="\${imgUrl}" class="pdp-thumb" alt="thumb1" />
          <img src="\${imgUrl}" class="pdp-thumb" alt="thumb2" />
        </div>
        <div class="pdp-main-image-box">
          <span class="pdp-badge">Parlayan'a Özel</span>
          <img src="\${imgUrl}" class="pdp-main-image" />
          <div class="pdp-image-actions">
            <button title="Paylaş">📤</button>
            <button class="fav-btn" data-id="\${product.id}" title="Favorilere Ekle">♡</button>
          </div>
          <button style="position: absolute; bottom: 15px; right: 15px; background: none; border: none; font-size: 20px; color: #4f167a; cursor: pointer;">🔍</button>
        </div>
      </div>
      <div class="pdp-right">
        <div class="pdp-brand-and-fav">
          <span class="pdp-brand">\${product.brand || 'Marka'}</span>
          <span class="pdp-fav-info">💜 41,6B+ Kişi Favoriledi!</span>
        </div>
        <h1 class="pdp-title">\${product.name}</h1>
        <div class="pdp-rating">
          <span class="pdp-rating-stars">★★★★☆</span>
          <span>(4.2)</span> 
          <span>403 Değerlendirme</span> 
          <a href="#" class="pdp-reviews-link">Tüm Yorumları Görüntüle</a>
        </div>
        
        <div class="pdp-price-area">
          \${product.oldPrice ? \`<div class="pdp-old-price">\${product.oldPrice}</div>\` : ''}
          <div class="pdp-card-label">Parlayan Kart ile</div>
          <div class="pdp-new-price">\${product.price}</div>
        </div>

        <div class="pdp-actions">
          <button class="btn-buy-now add-to-cart" data-id="\${product.id}">HEMEN AL</button>
          <button class="btn-add-to-cart add-to-cart" data-id="\${product.id}">SEPETE EKLE</button>
        </div>
      </div>
    </div>
  \`;
  
  homeView.style.display = 'none';
  pdpView.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
`;

// we need to inject the newly updated showProductDetail which PUSHES state.
const newShowProductDetail = \`function showProductDetail(productId) {
  renderProductDetailSilent(productId);
  // Add to History API
  history.pushState({view: 'pdp', productId: productId}, '', '#product-' + productId);
}\`;

// replace the old showProductDetail entirely
const startPattern = 'function showProductDetail(productId) {';
const endPattern = '  window.scrollTo({ top: 0, behavior: \\'smooth\\' });\n}';

const startIndex = code.indexOf(startPattern);
const endIndex = code.indexOf(endPattern, startIndex) + endPattern.length;

if (startIndex !== -1 && endIndex > startIndex) {
  code = code.substring(0, startIndex) + popstateHandler + newShowProductDetail + code.substring(endIndex);
}

// also let's make sure the logo goes home + clears history properly
// replace simple href="/" with logic if possible, or just intercept logo click if we want.
// href="/" works natively to reload the page but we can clear hash manually if we intercept it, 
// usually href='/' reloads the app so it's fine.

// Let's also update the category navigation to push an empty state so clicking "back" works from categories if we want.
// Or just let it do the default (which doesn't use pushState). The main complain was the product detail page opening 
// essentially simulated a new page, but clicking back caused them to leave the site.

fs.writeFileSync('public/app.js', code);
