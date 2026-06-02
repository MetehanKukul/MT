/* ==========================================================================
   🧠 SİTENİN BEYNİ: app.js
   Hocanız "Ürünler nereden geliyor?", "Sepete nasıl ürün ekleniyor?" derse
   bu dosyanın içindeki işlemleri referans gösterebilirsiniz.
   Buradaki değişkenler sitenin verilerini hafızada tutar.
   ========================================================================== */
// State Configuration
let allProducts = [];
let allCategories = [];
let categoryTree = {}; // child -> parent map
let cart = JSON.parse(localStorage.getItem('parlayan_cart')) || [];
let favorites = JSON.parse(localStorage.getItem('parlayan_favs')) || [];
let currentUser = JSON.parse(localStorage.getItem('parlayan_user')) || null;
let orders = JSON.parse(localStorage.getItem('parlayan_orders')) || [];
let addresses = JSON.parse(localStorage.getItem('parlayan_addresses')) || [];
let loyaltyPoints = JSON.parse(localStorage.getItem('parlayan_points')) || 0;

const Elements = {
  grid: document.getElementById('product-grid'),
  cartBadge: document.getElementById('cart-badge'),
  favBadge: document.getElementById('fav-badge'),
  cartItems: document.getElementById('cart-items'),
  favItems: document.getElementById('fav-items'),
  cartTotal: document.getElementById('cart-total-price'),
  overlay: document.getElementById('site-overlay'),
  productsHeading: document.getElementById('products-heading'),
  homeBanner: document.getElementById('home-banner'),
  homeBrands: document.getElementById('home-brands'),
  accountText: document.getElementById('account-text'),
  accountDropdown: document.getElementById('account-dropdown'),
  accountPanelTitle: document.getElementById('account-panel-title'),
  accountPanelBody: document.getElementById('account-panel-body'),
};

document.addEventListener('DOMContentLoaded', () => {
  // Ürünleri Çek
  fetch('/api/products')
    .then((response) => response.json())
    .then((data) => {
      allProducts = data;
      renderProducts(allProducts.slice(0, 6));
      updateUI();

      // Check if URL has a product hash on load
      const hash = window.location.hash;
      if (hash && hash.startsWith('#product-')) {
        const pId = hash.replace('#product-', '');
        if (pId) {
          // Replace current state so we know we start at a product
          history.replaceState({ view: 'pdp', productId: pId }, '', hash);
          renderProductDetailSilent(pId);
        }
      }
    })
    .catch(() => {
      Elements.grid.innerHTML = '<p style="text-align:center;grid-column: span 4;">Katalog yüklenemedi.</p>';
    });

  // Kategorileri Çek
  fetch('/api/categories')
    .then(response => response.json())
    .then(categories => {
      allCategories = categories;
      categories.forEach(c => {
        categoryTree[c.id] = c.parentId;
      });

      const footerCategories = document.getElementById('footer-categories');
      const navLinks = document.getElementById('nav-links');

      if (footerCategories) {
        footerCategories.innerHTML = categories.map(c => `
          <li>${escapeHtml(c.name)}</li>
        `).join('');
      }

      if (navLinks) {
        // Sadece başlıkta görünmesini istediğimiz ana kategorileri filtreleyelim
        const anaKategoriler = [
          'Makyaj', 'Hijyen & Bakım', 'Kişisel Bakım', 'Duş & Banyo',
          'Cilt Bakımı', 'Saç Bakımı', 'Parfüm & Deodorant', 'Erkek Bakım',
          'Güneş Ürünleri'
        ];

        const filteredCategories = categories.filter(c => anaKategoriler.includes(c.name)).sort((a, b) => anaKategoriler.indexOf(a.name) - anaKategoriler.indexOf(b.name));

        navLinks.innerHTML = filteredCategories.map(c => {
          let megaMenuHTML = '';

          if (c.name === 'Makyaj') {
            megaMenuHTML = `
              <div class="mega-menu">
                <div class="mega-menu-content" style="display: flex; justify-content: space-between; padding: 20px 0;">
                  <div class="mega-columns-container" style="display: flex; gap: 60px; flex: 2;">
                    
                    <div class="mega-column-wrapper" style="display: flex; flex-direction: column; gap: 30px;">
                      <div class="mega-sub-category">
                        <h4 style="color: #4a154b; font-size: 16px; margin-bottom: 15px; font-weight: 600;">Dudak Makyajı</h4>
                        <ul style="list-style:none; padding:0; line-height:2.2;">
                          <li><a href="#" style="color:#555; text-decoration:none; font-size:14px;">Ruj</a></li>
                          <li><a href="#" style="color:#555; text-decoration:none; font-size:14px;">Likit Ruj</a></li>
                          <li><a href="#" style="color:#555; text-decoration:none; font-size:14px;">Kalem Ruj</a></li>
                          <li><a href="#" style="color:#555; text-decoration:none; font-size:14px;">Dudak Kalemi</a></li>
                          <li><a href="#" style="color:#555; text-decoration:none; font-size:14px;">Dudak Parlatıcısı</a></li>
                        </ul>
                      </div>

                      <div class="mega-sub-category">
                        <h4 style="color: #4a154b; font-size: 16px; margin-bottom: 15px; font-weight: 600;">Göz Makyajı</h4>
                        <ul style="list-style:none; padding:0; line-height:2.2;">
                          <li><a href="#" style="color:#555; text-decoration:none; font-size:14px;">Maskara</a></li>
                          <li><a href="#" style="color:#555; text-decoration:none; font-size:14px;">Eyeliner</a></li>
                          <li><a href="#" style="color:#555; text-decoration:none; font-size:14px;">Göz Kalemi</a></li>
                          <li><a href="#" style="color:#555; text-decoration:none; font-size:14px;">Far</a></li>
                        </ul>
                      </div>
                    </div>

                    <div class="mega-sub-category">
                      <h4 style="color: #4a154b; font-size: 16px; margin-bottom: 15px; font-weight: 600;">Yüz Makyajı</h4>
                      <ul style="list-style:none; padding:0; line-height:2.2;">
                        <li><a href="#" style="color:#555; text-decoration:none; font-size:14px;">Aydınlatıcı</a></li>
                        <li><a href="#" style="color:#555; text-decoration:none; font-size:14px;">Allık</a></li>
                        <li><a href="#" style="color:#555; text-decoration:none; font-size:14px;">Bronzer</a></li>
                        <li><a href="#" style="color:#555; text-decoration:none; font-size:14px;">Fondöten</a></li>
                        <li><a href="#" style="color:#555; text-decoration:none; font-size:14px;">BB-CC Kremler</a></li>
                        <li><a href="#" style="color:#555; text-decoration:none; font-size:14px;">Kapatıcı</a></li>
                        <li><a href="#" style="color:#555; text-decoration:none; font-size:14px;">Kontür</a></li>
                        <li><a href="#" style="color:#555; text-decoration:none; font-size:14px;">Pudra</a></li>
                        <li><a href="#" style="color:#555; text-decoration:none; font-size:14px;">Makyaj Bazı</a></li>
                        <li><a href="#" style="color:#555; text-decoration:none; font-size:14px;">Makyaj Sabitleyici</a></li>
                        <li><a href="#" style="color:#555; text-decoration:none; font-size:14px;">Ruj & Allık</a></li>
                      </ul>
                    </div>

                    <div class="mega-sub-category">
                      <h4 style="color: #4a154b; font-size: 16px; margin-bottom: 15px; font-weight: 600;">Tırnak Bakım</h4>
                      <ul style="list-style:none; padding:0; line-height:2.2;">
                        <li><a href="#" style="color:#555; text-decoration:none; font-size:14px;">Oje</a></li>
                        <li><a href="#" style="color:#555; text-decoration:none; font-size:14px;">Tırnak Bakım Ürünleri</a></li>
                      </ul>
                    </div>

                  </div>

                  <div class="mega-brands-container" style="flex: 1.5; padding: 0 0 0 40px; background: radial-gradient(circle at right bottom, rgba(253,242,248,1) 0%, rgba(255,255,255,0) 80%); border-left: 1px solid #f0f0f0;">
                    <h4 style="color: #4a154b; font-size: 16px; margin-bottom: 30px; font-weight: 600;">Bu Kategoride Öne Çıkan Markalar</h4>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; text-align: center;">
                      
                      <div>
                        <div style="width: 90px; height: 90px; border-radius: 50%; border: 3px solid #fae8f0; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; background: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.02);">
                          <span style="color: #e56d90; font-weight: 700; font-size: 16px;">beaulis</span>
                        </div>
                        <span style="font-size: 13px; color: #4a154b;">Beaulis</span>
                      </div>

                      <div>
                        <div style="width: 90px; height: 90px; border-radius: 50%; border: 3px solid #fae8f0; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; background: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.02);">
                          <span style="color: #333; font-weight: 800; font-size: 16px; letter-spacing: 1px;">LYKD</span>
                        </div>
                        <span style="font-size: 13px; color: #4a154b;">LYKD</span>
                      </div>

                      <div>
                        <div style="width: 90px; height: 90px; border-radius: 50%; border: 3px solid #fae8f0; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; background: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.02); flex-direction:column;">
                          <span style="color: #e56d90; font-weight: 700; font-size: 15px; line-height: 1;">beaulis</span>
                          <span style="color: #e56d90; font-weight: 700; font-size: 13px; line-height: 1;">fun</span>
                        </div>
                        <span style="font-size: 13px; color: #4a154b;">Beaulis Fun</span>
                      </div>

                      <div>
                        <div style="width: 90px; height: 90px; border-radius: 50%; border: 3px solid #fae8f0; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; background: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.02);">
                          <span style="color: #888; font-size: 14px;">rom&amp;nd</span>
                        </div>
                        <span style="font-size: 13px; color: #4a154b;">rom&amp;nd</span>
                      </div>

                      <div>
                        <div style="width: 90px; height: 90px; border-radius: 50%; border: 3px solid #fae8f0; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; background: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.02);">
                          <span style="color: #444; font-family: cursive; font-size: 16px;">theBalm</span>
                        </div>
                        <span style="font-size: 13px; color: #4a154b;">theBalm</span>
                      </div>

                      <div>
                        <div style="width: 90px; height: 90px; border-radius: 50%; border: 3px solid #fff; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; background: #000; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                          <span style="color: #fff; font-size: 14px; letter-spacing: 1px;">ASTRA</span>
                        </div>
                        <span style="font-size: 13px; color: #4a154b;">Astra</span>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            `;
          } else {
            const subCats = categories.filter(sub => sub.parentId === c.id);
            if (subCats.length > 0) {
              let columnsHTML = '';
              subCats.forEach(sub => {
                const items = categories.filter(item => item.parentId === sub.id);
                if (items.length > 0) {
                  const listHTML = items.map(i => `<li><a href="#">${escapeHtml(i.name)}</a></li>`).join('');
                  columnsHTML += `
                    <div class="mega-sub-category">
                      <h4>${escapeHtml(sub.name)}</h4>
                      <ul>${listHTML}</ul>
                    </div>
                  `;
                }
              });
              megaMenuHTML = `
                <div class="mega-menu">
                  <div class="mega-menu-content">
                    <div class="mega-columns-container">
                      ${columnsHTML}
                    </div>
                  </div>
                </div>
              `;
            }
          }

          return `<div class="nav-item-wrapper"><a href="#" class="nav-item" data-id="${c.id}" data-cat="${escapeHtml(c.name)}">${escapeHtml(c.name)}</a>${megaMenuHTML}</div>`;
        }).join('');
      }
    })
    .catch(err => console.error('Kategoriler yüklenemedi', err));

  // Markaları Çek
  fetch('/api/brands')
    .then(response => response.json())
    .then(brands => {
      if (Elements.homeBrands) {
        Elements.homeBrands.innerHTML = brands.map(b => `
          <div class="brand-item">${escapeHtml(b.name.toUpperCase())}</div>
        `).join('');
      }
    })
    .catch(err => console.error('Markalar yüklenemedi', err));

  setupListeners();
  updateUI();
});

function parsePrice(priceText) {
  return Number.parseFloat(String(priceText).replace('TL', '').replace(',', '.').trim()) || 0;
}

function formatPrice(value) {
  return `${value.toFixed(2)} TL`;
}

function customAlert(message, title = 'Bilgi') {
  const alertTitle = document.getElementById('custom-alert-title');
  const alertMsg = document.getElementById('custom-alert-message');
  if (alertTitle) alertTitle.textContent = title;
  if (alertMsg) alertMsg.textContent = message;
  openModal('custom-alert-modal');
}

function normalizeCategoryName(name) {
  if (!name) return '';
  let normalized = name.toLowerCase()
    .replace(/&amp;/g, 've')
    .replace(/&/g, 've')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .trim();

  normalized = normalized.replace(/cilt bakimi/g, 'cilt bakim')
    .replace(/sac bakimi/g, 'sac bakim');
  return normalized;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getRootCategoryId(id) {
  let curr = id;
  while (categoryTree[curr]) {
    curr = categoryTree[curr];
  }
  return curr;
}

function calculateCartTotal(items) {
  return items.reduce((sum, item) => {
    const product = allProducts.find((p) => String(p.id) === String(item.id));
    if (!product) return sum;
    return sum + parsePrice(product.price) * item.qty;
  }, 0);
}

function saveState() {
  localStorage.setItem('parlayan_cart', JSON.stringify(cart));
  localStorage.setItem('parlayan_favs', JSON.stringify(favorites));
  localStorage.setItem('parlayan_user', JSON.stringify(currentUser));
  localStorage.setItem('parlayan_orders', JSON.stringify(orders));
  localStorage.setItem('parlayan_addresses', JSON.stringify(addresses));
  localStorage.setItem('parlayan_points', JSON.stringify(loyaltyPoints));
}

function updateUI() {
  saveState();

  if (currentUser) {
    Elements.accountText.textContent = 'Hesabım';
  } else {
    Elements.accountText.textContent = 'Giriş / Üye Ol';
    Elements.accountDropdown.classList.add('hidden');
  }

  const cartQty = cart.reduce((acc, item) => acc + item.qty, 0);
  Elements.cartBadge.textContent = cartQty;
  Elements.cartBadge.classList.toggle('hidden', cartQty === 0);

  Elements.favBadge.textContent = favorites.length;
  Elements.favBadge.classList.toggle('hidden', favorites.length === 0);


  document.querySelectorAll('.pdp-fav-action-btn').forEach((btn) => {
    const id = btn.dataset.id;
    if (favorites.some(f => String(f) === String(id))) {
      btn.textContent = 'FAVORİLERDEN ÇIKAR';
      btn.classList.add('active');
    } else {
      btn.textContent = 'FAVORİLERE EKLE';
      btn.classList.remove('active');
    }
  });

  document.querySelectorAll('.fav-btn').forEach((btn) => {
    const id = btn.dataset.id;
    if (favorites.some(f => String(f) === String(id))) {
      btn.classList.add('active');
      btn.innerHTML = '♥';
    } else {
      btn.classList.remove('active');
      btn.innerHTML = '♡';
    }
  });

  renderCartSidebar();
  renderFavSidebar();
}

const DEFAULT_PRODUCT_IMAGE = '/images/default-product.svg';

function getIcon(category) {
  if (category.includes('Makyaj')) return '💄';
  if (category.includes('Cilt')) return '🧴';
  if (category.includes('Aksesuar')) return '🖌';
  if (category.includes('Kişisel')) return '🧼';
  return '✨';
}

function isValidProductImage(url) {
  if (!url) return false;
  return !url.includes('default.png') && !url.includes('/Image/get/default') && !url.includes('placeholder');
}

function getProductImageUrl(url) {
  return isValidProductImage(url) ? url : DEFAULT_PRODUCT_IMAGE;
}

// ==========================================
// 📦 ÜRÜNLERİ EKRANA ÇİZDİRME FONKSİYONU (renderProducts)
// Hoca "Ürünleri nereden ekrana basıyorsun?" diye sorarsa bu fonksiyonu gösterin.
// Bu fonksiyon, gelen ürün listesini (items) alır ve HTML kartlarına dönüştürerek ekrana basar.
// ==========================================
function renderProducts(items) {
  if (!items.length) {
    Elements.grid.innerHTML = '<p style="text-align:center;padding:40px; grid-column:span 4">Bu kategoride ürün bulunamadı.</p>';
    return;
  }

  Elements.grid.innerHTML = items
    .map(
      (product) => `
      <article class="product-card pdp-trigger" data-id="${product.id}" style="cursor:pointer;">
        <button class="fav-btn" data-id="${product.id}">♡</button>
        ${product.badge ? `<span class="badge">${product.badge}</span>` : ''}
        <img src="${getProductImageUrl(product.image)}" class="product-image-img" alt="${product.name}" style="width: 100%; height: 180px; object-fit: contain; background: #fff;" onerror="this.onerror=null;this.src='${DEFAULT_PRODUCT_IMAGE}';" />
        <div class="product-brand">${product.brand}</div>
        <h3 class="product-name">${product.name}</h3>
        <div class="product-prices">
          ${product.oldPrice ? `<span class="old-price">${product.oldPrice}</span>` : ''}
          <span class="new-price">${product.price}</span>
        </div>
        <button class="add-to-cart" data-id="${product.id}">SEPETE EKLE</button>
      </article>
    `,
    )
    .join('');

  updateUI();
}

function renderCartSidebar() {
  if (!cart.length) {
    Elements.cartItems.innerHTML = '<div class="empty-msg">Sepetiniz şu an boş.</div>';
    Elements.cartTotal.textContent = '0.00 TL';
    return;
  }

  Elements.cartItems.innerHTML = cart
    .map((item) => {
      const product = allProducts.find((p) => String(p.id) === String(item.id));
      if (!product) return '';
      return `
      <div class="mini-item">
        <div class="mini-item-img">
          <img src="${getProductImageUrl(product.image)}" alt="${product.name}" onerror="this.onerror=null;this.src='${DEFAULT_PRODUCT_IMAGE}';"/>
        </div>
        <div class="mini-item-info">
          <span class="mini-item-brand">${product.brand}</span>
          <h4 class="mini-item-name">${product.name}</h4>
          <div class="mini-item-price-row">
            <span class="mini-item-price">${product.price}</span>
            <span class="mini-item-qty">${item.qty} Adet</span>
          </div>
        </div>
        <button class="mini-item-remove-btn" onclick="removeFromCart('${product.id}')" title="Sepetten Çıkar">
          <i class="ph ph-trash"></i>
        </button>
      </div>
    `;
    })
    .join('');

  Elements.cartTotal.textContent = formatPrice(calculateCartTotal(cart));
}

function renderFavSidebar() {
  if (!favorites.length) {
    Elements.favItems.innerHTML = '<div class="empty-msg">Favorileriniz boş.</div>';
    return;
  }

  Elements.favItems.innerHTML = favorites
    .map((id) => {
      const product = allProducts.find((p) => String(p.id) === String(id));
      if (!product) return '';
      return `
      <div class="mini-item">
        <div class="mini-item-img">
          <img src="${getProductImageUrl(product.image)}" alt="${product.name}" onerror="this.onerror=null;this.src='${DEFAULT_PRODUCT_IMAGE}';"/>
        </div>
        <div class="mini-item-info">
          <span class="mini-item-brand">${product.brand}</span>
          <h4 class="mini-item-name">${product.name}</h4>
          <span class="mini-item-price">${product.price}</span>
          <button class="mini-item-action" onclick="addToCart('${product.id}'); removeFromFav('${product.id}')">
            <i class="ph ph-shopping-bag"></i> Sepete At
          </button>
        </div>
        <button class="mini-item-remove-btn" onclick="removeFromFav('${product.id}')" title="Favorilerden Çıkar">
          <i class="ph ph-trash"></i>
        </button>
      </div>
    `;
    })
    .join('');
}

function openAccountPanel(title, bodyHtml) {
  Elements.accountPanelTitle.textContent = title;
  Elements.accountPanelBody.innerHTML = bodyHtml;
  openModal('account-panel-modal');
}

function showOrdersPanel() {
  if (!orders.length) {
    openAccountPanel('Siparişlerim', '<div class="account-panel-card">Henüz oluşturulmuş sipariş bulunmuyor.</div>');
    return;
  }

  const html = orders
    .map((order) => {
      const count = order.items.reduce((acc, item) => acc + item.qty, 0);
      return `
        <div class="account-panel-card">
          <strong>${escapeHtml(order.id)}</strong>
          <div>${escapeHtml(order.date)}</div>
          <div>${count} ürün • ${formatPrice(order.total)}</div>
        </div>
      `;
    })
    .join('');

  openAccountPanel('Siparişlerim', html);
}

function showAddressesPanel() {
  const listHtml = addresses.length
    ? addresses
      .map(
        (address, index) => `
        <div class="account-panel-card">
          <div>${escapeHtml(address)}</div>
          <button class="mini-item-remove" style="position: static; margin-top: 8px;" data-account-panel-action="remove-address" data-address-index="${index}">Sil</button>
        </div>
      `,
      )
      .join('')
    : '<div class="account-panel-card">Kayıtlı adresiniz bulunmuyor.</div>';

  openAccountPanel(
    'Adreslerim',
    `${listHtml}<button class="primary-btn w-100" data-account-panel-action="add-address">Yeni Adres Ekle</button>`,
  );
}

function showCampaignsPanel() {
  const html = `
    <div class="account-panel-card"><strong>%50 Makyaj Fırsatı</strong><div>Seçili ürünlerde geçerli.</div></div>
    <div class="account-panel-card"><strong>2 Al 1 Öde</strong><div>Cilt bakım ürünlerinde aktif.</div></div>
    <div class="account-panel-card"><strong>Kargo Bedava</strong><div>750 TL ve üzeri alışverişte.</div></div>
  `;
  openAccountPanel('Kampanyalarım', html);
}

function showCardPanel() {
  const cardUserName = currentUser.name || "Sümeyye Akdaş";
  const html = `
    <div class="card-panel-container">
      <div class="card-top-section">
        <div class="loyalty-card-visual">
          <div class="loyalty-card-logo">parlayan <span class="card-logo-gold">KART</span></div>
          <div class="card-chip"></div>
          <div class="card-contactless"><i class="ph ph-wifi-high"></i></div>
          <div class="loyalty-card-info">
            <div class="loyalty-card-number">6374 6187 2512 9106</div>
            <div class="loyalty-card-name">${escapeHtml(cardUserName)}</div>
          </div>
        </div>
        <div class="loyalty-card-benefits">
          <h4>Parlayan Kart size ne gibi faydalar sağlar?</h4>
          <ul class="benefits-list">
            <li><span class="benefit-icon"><i class="ph ph-tag"></i></span> Parlayan Kozmetik Mağazaları ve Online Alışveriş'te Özel İndirimler</li>
            <li><span class="benefit-icon"><i class="ph ph-sparkle"></i></span> Marka işbirliklerine özel kampanyalardan yararlanma</li>
            <li><span class="benefit-icon"><i class="ph ph-gift"></i></span> Sürpriz Avantajlar</li>
            <li><span class="benefit-icon"><i class="ph ph-package"></i></span> Koşulsuz İade</li>
          </ul>
        </div>
      </div>
      
      <div class="faq-section">
        <h4 class="faq-title">Parlayan Kart</h4>
        
        <div class="faq-item" onclick="toggleFaq(this)">
          <div class="faq-question">
            <span>Nasıl Parlayan Kart üyesi olurum?</span>
            <span class="faq-icon">+</span>
          </div>
          <div class="faq-answer">
            Ücretsiz olarak web sitemiz üzerinden kayıt formunu doldurarak veya herhangi bir Parlayan Kozmetik mağazasında kasa görevlisine cep telefonu numaranızı belirterek anında üye olabilirsiniz.
          </div>
        </div>
        
        <div class="faq-item" onclick="toggleFaq(this)">
          <div class="faq-question">
            <span>Üyelik bilgilerimi nasıl güncellerim?</span>
            <span class="faq-icon">+</span>
          </div>
          <div class="faq-answer">
            Profilinizdeki "Hesabım > Ayarlar" sekmesinden bilgilerinizi kendiniz düzenleyebilir ya da mağazalarımızdaki kasa sorumlularından bilgilerinizi güncellemesini isteyebilirsiniz.
          </div>
        </div>
        
        <div class="faq-item" onclick="toggleFaq(this)">
          <div class="faq-question">
            <span>Üyeliğimi nasıl iptal ederim?</span>
            <span class="faq-icon">+</span>
          </div>
          <div class="faq-answer">
            Müşteri Hizmetleri numaramız (0850 210 69 00) üzerinden veya profilinizdeki iletişim formu vasıtasıyla üyelik iptal talebinizi kolayca iletebilirsiniz.
          </div>
        </div>
        
        <div class="faq-item" onclick="toggleFaq(this)">
          <div class="faq-question">
            <span>Üyeliğim iptal olmuş, yeniden üye olmak istiyorum</span>
            <span class="faq-icon">+</span>
          </div>
          <div class="faq-answer">
            İptal olan üyeliğinizi aktif hale getirmek için size en yakın mağazamıza cep telefonunuzla başvurarak veya Müşteri Hizmetlerimizi arayarak saniyeler içinde yeni bir aktivasyon gerçekleştirebilirsiniz.
          </div>
        </div>
        
        <div class="faq-item" onclick="toggleFaq(this)">
          <div class="faq-question">
            <span>SMS ve e-posta gönderilmesini istiyorum. Ne yapmalıyım?</span>
            <span class="faq-icon">+</span>
          </div>
          <div class="faq-answer">
            En güncel indirim ve kampanyalardan haberdar olmak için profilinizin "İletişim Tercihleri" menüsünden SMS ve E-posta izinlerini aktif hale getirmeniz yeterlidir.
          </div>
        </div>
      </div>
    </div>
  `;
  openAccountPanel('Parlayan Kartım', html);
}

window.toggleFaq = function (element) {
  const isActive = element.classList.contains('active');

  // Tüm diğer açık sıkça sorulan soruları kapat (Accordion etkisi)
  const allItems = document.querySelectorAll('.faq-item');
  allItems.forEach(item => {
    item.classList.remove('active');
    const ic = item.querySelector('.faq-icon');
    if (ic) ic.textContent = '+';
  });

  // Eğer tıklanan soru aktif değilse aç
  if (!isActive) {
    element.classList.add('active');
    const icon = element.querySelector('.faq-icon');
    if (icon) icon.textContent = '−';
  }
};

function showPointsPanel() {
  const html = `
    <div class="account-panel-card"><strong>Mevcut Puan:</strong> ${loyaltyPoints}</div>
    <div class="account-panel-card">Her siparişte ödeme tutarının yaklaşık %3'ü kadar puan kazanırsın.</div>
  `;
  openAccountPanel('Puanlarım', html);
}

function showSettingsPanel() {
  // Kullanıcı bilgileri
  const name = currentUser && currentUser.name ? escapeHtml(currentUser.name) : '';
  const email = currentUser && currentUser.email ? escapeHtml(currentUser.email) : '';
  const phone = currentUser && currentUser.phone ? currentUser.phone : '';
  const regDate = currentUser && currentUser.registrationDate && currentUser.registrationDate !== '-'
    ? escapeHtml(new Date(currentUser.registrationDate).toLocaleDateString('tr-TR'))
    : 'Bilinmiyor';

  const html = `
    <div class="settings-form-wrapper">
      <div class="account-panel-card">
        <h4>Kişisel Bilgiler</h4>
        <form id="settings-form">
          <div class="form-group">
            <label for="settings-name">Ad Soyad</label>
            <input type="text" id="settings-name" class="form-control" value="${name}" placeholder="Ad Soyadınızı girin" required />
          </div>
          <div class="form-group" style="margin-top: 15px;">
            <label for="settings-email">E-posta Adresi</label>
            <input type="email" id="settings-email" class="form-control" value="${email}" placeholder="E-posta adresinizi girin" required />
          </div>
          <div class="form-group" style="margin-top: 15px;">
            <label for="settings-date">Kayıt Tarihi</label>
            <input type="text" id="settings-date" class="form-control" value="${regDate}" disabled />
          </div>
          <div class="form-group" style="margin-top: 15px;">
            <label for="settings-password">Yeni Şifre (İsteğe Bağlı)</label>
            <input type="password" id="settings-password" class="form-control" placeholder="Değiştirmek istemiyorsanız boş bırakın" />
          </div>
          <div class="form-group" style="margin-top: 15px;">
            <label for="settings-phone">Telefon Numarası</label>
            <input type="tel" id="settings-phone" class="form-control" value="${phone}" placeholder="05XX XXX XX XX" />
          </div>
          <button type="submit" class="primary-btn w-100" style="margin-top: 20px;">Bilgilerimi Güncelle</button>
        </form>
      </div>

      <div class="account-panel-card" style="margin-top: 20px;">
        <h4>Tercihlerim</h4>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px;">
          <span>E-posta & SMS Bildirimleri</span>
          <input type="checkbox" id="settings-notifications" checked />
        </div>
      </div>
    </div>
  `;
  openAccountPanel('Hesabım ve Ayarlarım', html);

  // Add event listener to the newly rendered form
  setTimeout(() => {
    const form = document.getElementById('settings-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Form değerlerini okuyalım
        const newName = document.getElementById('settings-name').value.trim();
        const newEmail = document.getElementById('settings-email').value.trim();
        const newPassword = document.getElementById('settings-password').value.trim();

        // currentUser'ı güncelleyelim (eğer giriş yapmışsa)
        if (currentUser) {
          currentUser.name = newName;
          currentUser.email = newEmail;
          const newPhone = document.getElementById('settings-phone').value.trim();
          currentUser.phone = newPhone;
          // LocalStorage'ı ve UI'ı güncelle
          saveState();
          updateUI();

          // API request to trigger backend SQL UPDATE
          fetch('/api/users/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: currentUser.id,
              name: currentUser.name,
              email: currentUser.email,
              phone: currentUser.phone,
              password: newPassword
            })
          }).then(res => res.json()).then(data => {
            if (data.success) {
              showToast('Bilgileriniz başarıyla güncellendi!');
            } else {
              showToast('Hata: ' + data.message);
            }
          }).catch(err => {
            console.error(err);
            showToast('Sunucu bağlantı hatası oluştu!');
          });
        } else {
          customAlert('Lütfen önce giriş yapın.');
        }
      });
    }
  }, 0);
}

function rebuyLastOrder() {
  if (!orders.length) {
    customAlert('Tekrar satın almak için önce bir sipariş oluşturmalısın.');
    return;
  }

  const lastOrder = orders[0];
  lastOrder.items.forEach((item) => {
    const existing = cart.find((c) => c.id === item.id);
    if (existing) {
      existing.qty += item.qty;
    } else {
      cart.push({ id: item.id, qty: item.qty });
    }
  });

  updateUI();
  openModal('cart-sidebar');
  customAlert('Son siparişin tekrar sepete eklendi.');
}

function handleAccountAction(action) {
  if (!currentUser) {
    openModal('login-modal');
    return;
  }

  Elements.accountDropdown.classList.add('hidden');

  switch (action) {
    case 'orders':
      showOrdersPanel();
      break;
    case 'favorites':
      openModal('fav-sidebar');
      break;
    case 'addresses':
      showAddressesPanel();
      break;
    case 'campaigns':
      showCampaignsPanel();
      break;
    case 'card':
      showCardPanel();
      break;
    case 'points':
      showPointsPanel();
      break;
    case 'rebuy':
      rebuyLastOrder();
      break;
    case 'settings':
      showSettingsPanel();
      break;
    default:
      break;
  }
}

// ==========================================
// 🛒 SEPETE EKLEME FONKSİYONU (addToCart)
// Hoca "Sepete ekleme işlemi nasıl çalışıyor?" diye sorarsa bu kısmı gösterin.
// Kullanıcı butona basınca ürün ID'sini alıp `cart` adlı sepete atıyor.
// ==========================================
window.addToCart = function (id) {
  const strId = String(id);
  const existing = cart.find((item) => String(item.id) === strId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: strId, qty: 1 });
  }
  updateUI();
};

window.removeFromCart = function (id) {
  const strId = String(id);
  cart = cart.filter((item) => String(item.id) !== strId);
  updateUI();
};

window.toggleFav = function (id) {
  if (!currentUser) {
    customAlert('Favorilere eklemek için giriş yapmalısınız.');
    return;
  }

  const strId = String(id);
  if (favorites.some(f => String(f) === strId)) {
    favorites = favorites.filter((favId) => String(favId) !== strId);
  } else {
    favorites.push(strId);
  }

  updateUI();
};

window.removeFromFav = function (id) {
  const strId = String(id);
  favorites = favorites.filter((favId) => String(favId) !== strId);
  updateUI();
};

function updateOverlayVisibility() {
  const anyOpenPanel = document.querySelector('.modal:not(.hidden), .sidebar:not(.hidden)');
  Elements.overlay.classList.toggle('hidden', !anyOpenPanel);
}

function openModal(id) {
  const target = document.getElementById(id);
  if (!target) return;
  target.classList.remove('hidden');
  updateOverlayVisibility();
}

function closeModal(id) {
  const target = document.getElementById(id);
  if (!target) return;
  target.classList.add('hidden');
  updateOverlayVisibility();
}

function closeAllPanels() {
  document.querySelectorAll('.modal, .sidebar').forEach((panel) => panel.classList.add('hidden'));
  Elements.overlay.classList.add('hidden');
  Elements.accountDropdown.classList.add('hidden');
  const mainNav = document.querySelector('.main-nav');
  if (mainNav) mainNav.classList.remove('active');
}

function setupListeners() {
  document.body.addEventListener('click', (event) => {
    // PDP Tab Switching Logic
    const tabBtn = event.target.closest('.pdp-tab-btn');
    if (tabBtn) {
      const tabId = tabBtn.dataset.tab;
      const wrapper = tabBtn.closest('.pdp-tabs-wrapper');
      if (wrapper) {
        wrapper.querySelectorAll('.pdp-tab-btn').forEach(btn => btn.classList.remove('active'));
        wrapper.querySelectorAll('.pdp-tab-panel').forEach(panel => panel.classList.remove('active'));
        tabBtn.classList.add('active');
        const activePanel = wrapper.querySelector(`#pdp-tab-${tabId}`);
        if (activePanel) {
          activePanel.classList.add('active');
        }
      }
      return;
    }

    // Promo Grid Campaigns Click Handlers
    const basketDeal = event.target.closest('.promo-basket-deal');
    if (basketDeal) {
      const activeSlide = basketDeal.querySelector('.promo-slide.active');
      const dealId = activeSlide ? activeSlide.dataset.dealId : null;
      if (dealId) {
        showProductDetail(dealId);
      }
      return;
    }

    const campaignProduct = event.target.closest('.campaign-product-card');
    if (campaignProduct) {
      const prodId = campaignProduct.dataset.promoProductId;
      if (prodId) {
        showProductDetail(prodId);
      }
      return;
    }

    if (event.target.classList.contains('add-to-cart')) {
      const id = event.target.dataset.id;
      addToCart(id);
      event.target.textContent = 'SEPETE EKLENDİ ✓';
      event.target.style.background = '#4CAF50';
      event.target.style.color = '#fff';
      setTimeout(() => {
        event.target.textContent = 'SEPETE EKLE';
        event.target.style.background = '';
        event.target.style.color = '';
      }, 1200);
    }


    if (event.target.classList.contains('pdp-fav-action-btn')) {
      const id = event.target.dataset.id;
      toggleFav(id);
    }

    if (event.target.classList.contains('fav-btn')) {
      const id = event.target.dataset.id;
      toggleFav(id);
    }

    const pdpTrigger = event.target.closest('.pdp-trigger');
    if (pdpTrigger && !event.target.classList.contains('add-to-cart') && !event.target.classList.contains('fav-btn')) {
      const id = pdpTrigger.dataset.id;
      showProductDetail(id);
    }

    if (event.target.classList.contains('nav-item')) {
      event.preventDefault();
      const cat = event.target.dataset.cat;
      const catId = String(event.target.dataset.id);
      const normalizedCat = normalizeCategoryName(cat);

      document.getElementById('pdp-view').style.display = 'none';
      document.getElementById('home-view').style.display = 'block';
      document.getElementById('pdp-view').style.display = 'none';
      document.getElementById('home-view').style.display = 'block';
      Elements.homeBanner.style.display = 'none';
      Elements.homeBrands.style.display = 'none';

      document.querySelectorAll('.nav-item').forEach((item) => {
        item.style.opacity = '1';
      });
      event.target.style.opacity = '0.55';

      // Hem ana kategori tablosuna (ana_kategori) hem isme hem id'ye göre filtreleme
      const filtered = allProducts.filter(p => {
        if (p.mainCategory && normalizeCategoryName(p.mainCategory) === normalizedCat) {
          return true;
        }
        if (p.categoryId) {
          return String(p.categoryId) === catId || String(getRootCategoryId(p.categoryId)) === catId;
        }
        return p.category === cat;
      });

      renderProducts(filtered);

      if (Elements.productsHeading) {
        Elements.productsHeading.textContent = `★ ${cat} Ürünleri`;
      }

      if (Elements.grid) {
        Elements.grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    if (event.target.closest('.mega-sub-category') && event.target.tagName === 'A') {
      event.preventDefault();
      const subCat = event.target.textContent.trim();
      // Alt kategorilere göre de filtreleme yapmak için
      const filtered = allProducts.filter(p => p.category === subCat || p.name.includes(subCat));
      renderProducts(filtered);

      if (Elements.productsHeading) {
        Elements.productsHeading.textContent = `★ ${subCat} Ürünleri`;
      }

      if (Elements.grid) {
        Elements.grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    if (event.target.matches('[data-close]')) {
      closeModal(event.target.dataset.close);
    }

    if (event.target.id === 'site-overlay') {
      closeAllPanels();
    }

    if (!event.target.closest('#btn-account') && !Elements.accountDropdown.classList.contains('hidden')) {
      Elements.accountDropdown.classList.add('hidden');
    }
  });

  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      const mainNav = document.querySelector('.main-nav');
      if (mainNav) {
        mainNav.classList.toggle('active');
        if (mainNav.classList.contains('active')) {
          Elements.overlay.classList.remove('hidden');
        } else {
          closeAllPanels();
        }
      }
    });
  }

  const btnAccount = document.getElementById('btn-account');
  if (btnAccount) {
    btnAccount.addEventListener('click', (event) => {
      event.preventDefault();
      if (!currentUser) {
        openModal('login-modal');
        return;
      }

      if (!event.target.closest('.dropdown-list') && !event.target.closest('.dropdown-footer')) {
        Elements.accountDropdown.classList.toggle('hidden');
      }
    });
  }

  if (Elements.accountDropdown) {
    Elements.accountDropdown.addEventListener('click', (event) => {
      const actionLink = event.target.closest('[data-account-action]');
      if (!actionLink) return;
      event.preventDefault();
      handleAccountAction(actionLink.dataset.accountAction);
    });
  }

  const logoutButton = document.getElementById('btn-logout');
  if (logoutButton) {
    logoutButton.addEventListener('click', (event) => {
      event.preventDefault();
      currentUser = null;
      closeAllPanels();
      updateUI();
    });
  }

  const btnCart = document.getElementById('btn-cart');
  if (btnCart) {
    btnCart.addEventListener('click', () => openModal('cart-sidebar'));
  }

  const btnFavs = document.getElementById('btn-favs');
  if (btnFavs) {
    btnFavs.addEventListener('click', () => openModal('fav-sidebar'));
  }

  const btnCheckout = document.getElementById('btn-checkout');
  if (btnCheckout) {
    btnCheckout.addEventListener('click', () => {
      if (!currentUser) {
        customAlert('Alışverişi tamamlamak için lütfen giriş yapın.');
        closeModal('cart-sidebar');
        openModal('login-modal');
        return;
      }

      if (!cart || cart.length === 0 || calculateCartTotal(cart) <= 0) {
        customAlert('Sepetiniz boş. Lütfen ödeme yapabilmek için sepetinize ürün ekleyin.', 'Sepet Boş');
        return;
      }

      // Close cart and open checkout modal
      closeModal('cart-sidebar');
      openModal('checkout-modal');

      // Populate summary
      const subtotal = calculateCartTotal(cart);
      const kargo = subtotal >= 750 ? 0 : 29.99;
      const total = subtotal + kargo;
      const kargoText = kargo === 0 ? 'Bedava' : formatPrice(kargo);

      const summaryElem = document.getElementById('checkout-order-summary');
      if (summaryElem) {
        summaryElem.innerHTML = `
          <div class="checkout-summary-row">
            <span>Ara Toplam</span>
            <span>${formatPrice(subtotal)}</span>
          </div>
          <div class="checkout-summary-row">
            <span>Kargo Ücreti</span>
            <span>${kargoText}</span>
          </div>
          <div class="checkout-summary-row total-row">
            <span>Genel Toplam</span>
            <strong>${formatPrice(total)}</strong>
          </div>
        `;
      }

      // Populate addresses dropdown
      const select = document.getElementById('checkout-address-select');
      const newAddressText = document.getElementById('checkout-new-address');
      if (select && newAddressText) {
        if (addresses.length > 0) {
          select.innerHTML = addresses.map((addr, idx) => `
            <option value="${idx}">${escapeHtml(addr.length > 60 ? addr.slice(0, 57) + '...' : addr)}</option>
          `).join('') + '<option value="new" selected>Yeni Adres Ekle</option>';
          newAddressText.style.display = 'block';
          newAddressText.setAttribute('required', 'true');
        } else {
          select.innerHTML = '<option value="new" selected>Yeni Adres Ekle</option>';
          newAddressText.style.display = 'block';
          newAddressText.setAttribute('required', 'true');
        }
      }
    });
  }

  // Checkout address selector toggle helper
  const addressSelect = document.getElementById('checkout-address-select');
  const newAddressText = document.getElementById('checkout-new-address');
  if (addressSelect && newAddressText) {
    addressSelect.addEventListener('change', () => {
      if (addressSelect.value === 'new') {
        newAddressText.style.display = 'block';
        newAddressText.setAttribute('required', 'true');
      } else {
        newAddressText.style.display = 'none';
        newAddressText.removeAttribute('required');
      }
    });
  }

  // Card expiration mask format (MM/YY) & preview update
  const cardExpiry = document.getElementById('checkout-card-expiry');
  const previewExpiry = document.getElementById('card-preview-expiry');
  if (cardExpiry) {
    cardExpiry.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, ''); // strip non-digits
      if (val.length > 4) val = val.slice(0, 4);
      if (val.length > 2) {
        e.target.value = val.slice(0, 2) + '/' + val.slice(2);
      } else {
        e.target.value = val;
      }
      if (previewExpiry) {
        previewExpiry.textContent = e.target.value || 'AA/YY';
      }
    });
  }

  // Credit card number spacing format & brand detection & preview update
  const cardNumber = document.getElementById('checkout-card-number');
  const previewNumber = document.getElementById('card-preview-number');
  const previewBrand = document.getElementById('card-preview-brand');
  if (cardNumber) {
    cardNumber.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, ''); // strip non-digits
      if (val.length > 16) val = val.slice(0, 16);

      // Update preview card network brand dynamically
      if (previewBrand) {
        if (val.startsWith('4')) {
          previewBrand.textContent = 'VISA';
        } else if (val.startsWith('5')) {
          previewBrand.textContent = 'MASTERCARD';
        } else if (val.startsWith('9')) {
          previewBrand.textContent = 'TROY';
        } else if (val.startsWith('3')) {
          previewBrand.textContent = 'AMEX';
        } else {
          previewBrand.textContent = 'KART';
        }
      }

      const matches = val.match(/\d{1,4}/g);
      if (matches) {
        e.target.value = matches.join(' ');
      } else {
        e.target.value = val;
      }

      if (previewNumber) {
        previewNumber.textContent = e.target.value || '•••• •••• •••• ••••';
      }
    });
  }

  // Card Holder Name preview update
  const cardName = document.getElementById('checkout-card-name');
  const previewName = document.getElementById('card-preview-name');
  if (cardName && previewName) {
    cardName.addEventListener('input', (e) => {
      previewName.textContent = e.target.value.toUpperCase() || 'AD SOYAD';
    });
  }

  // CVV restriction format (digits only, max length 3)
  const cardCvv = document.getElementById('checkout-card-cvv');
  if (cardCvv) {
    cardCvv.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
    });
  }

  // Shipping Carrier Cards selection listener
  const shippingCards = document.querySelectorAll('.shipping-card');
  if (shippingCards.length > 0) {
    shippingCards.forEach(card => {
      card.addEventListener('click', () => {
        shippingCards.forEach(c => {
          c.classList.remove('active');
          c.style.borderColor = 'var(--border-color)';
          c.style.background = '#FFF';
        });
        card.classList.add('active');
        card.style.borderColor = 'var(--secondary)';
        card.style.background = '#FAF6F2';
        const radio = card.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
      });
    });
  }

  // Submit checkout form and place order
  const formCheckout = document.getElementById('form-checkout');
  if (formCheckout) {
    formCheckout.addEventListener('submit', (e) => {
      e.preventDefault();

      let deliveryAddress = '';
      if (addressSelect.value === 'new') {
        deliveryAddress = newAddressText.value.trim();
        if (!deliveryAddress) {
          customAlert('Lütfen yeni bir teslimat adresi giriniz.');
          return;
        }
        if (!addresses.includes(deliveryAddress)) {
          addresses.push(deliveryAddress);
          saveState();
        }
      } else {
        const addrIndex = parseInt(addressSelect.value, 10);
        deliveryAddress = addresses[addrIndex];
      }

      const cardName = document.getElementById('checkout-card-name').value.trim();
      const cardNoClean = cardNumber.value.replace(/\s/g, '');
      const expiry = cardExpiry.value.trim();
      const cvv = cardCvv.value.trim();

      if (!cardName) {
        customAlert('Lütfen kart üzerindeki ismi giriniz.');
        return;
      }
      if (cardNoClean.length !== 16) {
        customAlert('Lütfen 16 haneli kart numaranızı giriniz.');
        return;
      }
      if (expiry.length !== 5 || !expiry.includes('/')) {
        customAlert('Lütfen geçerli son kullanma tarihi giriniz (AA/YY).');
        return;
      }
      if (cvv.length !== 3) {
        customAlert('Lütfen 3 haneli CVV kodunu giriniz.');
        return;
      }

      // Create SIP
      const subtotal = calculateCartTotal(cart);
      const kargo = subtotal >= 750 ? 0 : 29.99;
      const orderTotal = subtotal + kargo;
      const orderItems = cart.map((item) => ({ id: item.id, qty: item.qty }));

      const newOrder = {
        id: `SIP-${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleString('tr-TR'),
        items: orderItems,
        total: orderTotal,
        address: deliveryAddress
      };

      orders.unshift(newOrder);
      loyaltyPoints += Math.max(1, Math.round(orderTotal * 0.03));
      cart = [];
      updateUI();
      closeModal('checkout-modal');
      formCheckout.reset();
      customAlert('Siparişiniz başarıyla alındı ve ödemeniz güvenli şekilde tamamlandı!', 'Tebrikler');
    });
  }

  const loginForm = document.getElementById('form-login');
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value.trim();

      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.success) {
          // Backend'den gelen kullanıcı bilgilerini kaydediyoruz (Ad ve Soyad sütunlarını birleştirerek)
          currentUser = {
            id: data.user.id,
            name: (data.user.Ad + ' ' + data.user.Soyad).trim(),
            email: data.user.Eposta,
            phone: data.user.Telefon || '',
            registrationDate: data.user.KayitTarihi || '-'
          };
          saveState();
          updateUI();
          closeModal('login-modal');
          event.target.reset();
          customAlert('Başarıyla giriş yaptınız!');
        } else {
          customAlert('Giriş başarısız: ' + (data.message || 'Veritabanında bulunamadı.'));
        }
      } catch (err) {
        console.error('Giriş hatası:', err);
        customAlert('Sunucu ile bağlantı kurulamadı.');
      }
    });
  }

  const registerForm = document.getElementById('form-register');
  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const fullName = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value.trim();

      // Ad ve soyadı boşluktan ayırıyoruz ("Sümeyye Meryem Akdaş" => Ad: "Sümeyye Meryem", Soyad: "Akdaş")
      const nameParts = fullName.split(' ');
      const soyad = nameParts.length > 1 ? nameParts.pop() : ''; // Son kelime soyad
      const ad = nameParts.join(' '); // Kalanlar ad

      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ad, soyad, email, password })
        });

        const data = await response.json();

        if (data.success) {
          customAlert('Başarıyla kayıt oldunuz! Lütfen şimdi giriş yapın.');
          closeModal('register-modal');
          openModal('login-modal'); // Kullanıcıyı giriş formuna yönlendir
          event.target.reset();
        } else {
          customAlert('Kayıt başarısız: ' + (data.message || 'Bilinmeyen hata'));
        }
      } catch (err) {
        console.error('Kayıt hatası:', err);
        customAlert('Sunucu ile bağlantı kurulamadı.');
      }
    });
  }

  const switchToRegister = document.getElementById('switch-to-register');
  if (switchToRegister) {
    switchToRegister.addEventListener('click', (event) => {
      event.preventDefault();
      closeModal('login-modal');
      openModal('register-modal');
    });
  }

  const switchToLogin = document.getElementById('switch-to-login');
  if (switchToLogin) {
    switchToLogin.addEventListener('click', (event) => {
      event.preventDefault();
      closeModal('register-modal');
      openModal('login-modal');
    });
  }

  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');

  function performSearch() {
    if (!searchInput) return;
    const term = searchInput.value.toLowerCase().trim();

    Elements.homeBanner.style.display = term ? 'none' : 'flex';
    Elements.homeBrands.style.display = term ? 'none' : 'flex';

    const filtered = allProducts.filter(
      (product) => product.name.toLowerCase().includes(term) || (product.brand && product.brand.toLowerCase().includes(term)),
    );
    renderProducts(filtered);
    Elements.productsHeading.textContent = term ? `"${term}" için Arama Sonuçları` : '★ Haftanın Yıldızları';

    if (term && Elements.grid) {
      Elements.grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  if (searchInput) {
    searchInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        performSearch();
      }
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener('click', (event) => {
      event.preventDefault();
      performSearch();
    });
  }

  const navLinks = document.getElementById('nav-links');
  if (navLinks) {
    document.addEventListener('click', (event) => {
      const targetLink = event.target.closest('.mega-column a, .banner-sidebar li');
      if (!targetLink) return;

      const isSubItem = targetLink.closest('.mega-column') !== null;
      if (!isSubItem) return;

      event.preventDefault();
      Elements.homeBanner.style.display = 'none';
      Elements.homeBrands.style.display = 'none';

      if (isSubItem) {
        const subCat = targetLink.textContent.trim();
        const matchSub = subCat.toLocaleLowerCase('tr-TR');
        const filtered = allProducts.filter((product) => {
          const pName = (product.name || '').toLocaleLowerCase('tr-TR');
          const pCat = (product.category || '').toLocaleLowerCase('tr-TR');
          return pName.includes(matchSub) || pCat.includes(matchSub);
        });

        renderProducts(filtered);
        Elements.productsHeading.textContent = subCat + ' Ürünleri';

        const megaMenu = targetLink.closest('.mega-menu');
        if (megaMenu) {
          megaMenu.style.display = 'none';
          setTimeout(() => megaMenu.style.display = '', 200);
        }
      }
    });
  }

  const goShopping = document.getElementById('go-shopping');
  if (goShopping) {
    goShopping.addEventListener('click', (event) => {
      event.preventDefault();

      const grid = document.getElementById('product-grid');
      // İndirimli ürünleri (badge: %50 vs.) filtrele ve en başa getir. 
      // Veya direkt o kısma scoll yaparak göze çarpan ilk ürünlere odaklansın
      renderProducts(allProducts.slice(0, 12));
      Elements.productsHeading.textContent = '★ Bahar İndirimi Fırsatları';

      if (grid) {
        const topPos = grid.getBoundingClientRect().top + window.scrollY - 120;
        window.scrollTo({ top: topPos, behavior: 'smooth' });
      }
    });
  }

  // --- Üst Header Linkleri ---
  const linkCusService = document.getElementById('link-cus-service');
  const linkStores = document.getElementById('link-stores');
  const linkOrderTrack = document.getElementById('link-order-track');

  if (linkCusService) {
    linkCusService.addEventListener('click', (e) => {
      e.preventDefault();
      customAlert('Müşteri hizmetlerine hoş geldiniz! Çağrı merkezimize 0850 000 00 00 numarasından ulaşabilirsiniz.');
    });
  }

  if (linkStores) {
    linkStores.addEventListener('click', (e) => {
      e.preventDefault();
      customAlert('Tüm şubelerimiz yakında eklenecektir. Şu an tüm siparişlerinizde online mağazamızdan indirimli alışveriş yapabilirsiniz.');
    });
  }

  if (linkOrderTrack) {
    linkOrderTrack.addEventListener('click', (e) => {
      e.preventDefault();
      if (!currentUser) {
        customAlert('Sipariş takibi yapabilmek için lütfen giriş yapınız.');
        openModal('login-modal');
      } else {
        showOrdersPanel();
      }
    });
  }

  if (Elements.accountPanelBody) {
    Elements.accountPanelBody.addEventListener('click', (event) => {
      const actionButton = event.target.closest('[data-account-panel-action]');
      if (!actionButton) return;

      const action = actionButton.dataset.accountPanelAction;

      if (action === 'add-address') {
        const newAddress = prompt('Yeni adresinizi girin:');
        if (newAddress && newAddress.trim()) {
          addresses.push(newAddress.trim());
          saveState();
          showAddressesPanel();
        }
        return;
      }

      if (action === 'remove-address') {
        const index = Number.parseInt(actionButton.dataset.addressIndex, 10);
        if (!Number.isNaN(index)) {
          addresses = addresses.filter((_, currentIndex) => currentIndex !== index);
          saveState();
          showAddressesPanel();
        }
        return;
      }

      if (action === 'edit-name') {
        const newName = prompt('Yeni ad soyad girin:', currentUser.name);
        if (newName && newName.trim()) {
          currentUser.name = newName.trim();
          saveState();
          updateUI();
          showSettingsPanel();
        }
      }
    });
  }
}

// -- Intersection Observer for scroll animations --
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running';
      entry.target.classList.add('visible');
      scrollObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('section, .brands-section, .main-footer').forEach(el => {
  if (!el.classList.contains('hero-banner')) {
    el.classList.add('animate-on-scroll');
    scrollObserver.observe(el);
  }
});



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
  document.getElementById('pdp-view').style.display = 'none';
  document.getElementById('home-view').style.display = 'block';
  history.pushState(null, '', window.location.pathname + window.location.search);
}

function renderProductDetailSilent(productId) {
  const product = allProducts.find(p => String(p.id) === String(productId));
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

  // 1. Ürün açıklaması cümlelere ayrılıp listeye çevrilir
  const description = product.description || 'Bu ürün için henüz bir açıklama girilmemiş.';
  const sentences = description.split('. ').map(s => s.trim()).filter(s => s.length > 0);
  const bulletPointsHTML = sentences.map(s => {
    const clean = s.endsWith('.') ? s : s + '.';
    return `<li>${escapeHtml(clean)}</li>`;
  }).join('');

  // 2. Kullanım yönergesi kategoriye göre belirlenir
  let usageInstructions = '';
  const lowerName = product.name.toLowerCase();
  if (lowerName.includes('sampuan') || lowerName.includes('şampuan') || lowerName.includes('saç') || lowerName.includes('sac') || lowerName.includes('köpük') || lowerName.includes('wax')) {
    usageInstructions = '<li>Islak saça masaj yaparak köpürtün ve ardından bol su ile durulayın.</li><li>En iyi sonuç için düzenli olarak her banyoda kullanılması tavsiye edilir.</li>';
  } else if (lowerName.includes('serum') || lowerName.includes('nemlendirici') || lowerName.includes('peeling') || lowerName.includes('tonik') || lowerName.includes('cilt') || lowerName.includes('vücut')) {
    usageInstructions = '<li>Temizlenmiş cildinize dairesel hareketlerle nazikçe masaj yaparak uygulayınız.</li><li>Sabah ve akşam olmak üzere günde iki kez uygulanması tavsiye edilir.</li>';
  } else if (lowerName.includes('ruj') || lowerName.includes('lip') || lowerName.includes('parlatici') || lowerName.includes('dudak')) {
    usageInstructions = '<li>Dudak hatlarınızı belirleyerek dudak merkezinden dışarıya doğru eşit bir şekilde uygulayınız.</li><li>Günlük makyajınızda tazeleyici bir his için istediğiniz sıklıkta yenileyebilirsiniz.</li>';
  } else {
    usageInstructions = '<li>Kuru veya nemli cilt yüzeyine ihtiyaç duyduğunuz sıklıkta uygulayabilirsiniz.</li><li>Ürünü oda sıcaklığında muhafaza ediniz ve doğrudan güneş ışığına maruz bırakmayınız.</li>';
  }

  // 3. Kod ve Barkod üretilir
  const productCode = 10200000 + product.id;
  const productBarcode = 8690000000000 + product.id;

  // 4. Tab yapısı HTML oluşturulur
  const tabsHTML = `
    <div class="pdp-tabs-wrapper container">
      <div class="pdp-tabs-header">
        <button class="pdp-tab-btn active" data-tab="specs">Ürün Özellikleri</button>
        <button class="pdp-tab-btn" data-tab="reviews">Yorumlar</button>
        <button class="pdp-tab-btn" data-tab="returns">İade Koşulları</button>
        <button class="pdp-tab-btn" data-tab="payments">Ödeme Seçenekleri</button>
        <button class="pdp-tab-btn" data-tab="supplier">Tedarikçi Bilgileri</button>
      </div>
      <div class="pdp-tabs-content">
        <!-- Ürün Özellikleri Tab -->
        <div class="pdp-tab-panel active" id="pdp-tab-specs">
          <ul class="pdp-features-list">
            ${bulletPointsHTML}
          </ul>
          
          <h4 class="pdp-section-subtitle">Kullanımı</h4>
          <ul class="pdp-features-list">
            ${usageInstructions}
          </ul>
          
          <div class="pdp-info-banner">
            <span class="pdp-info-icon">ⓘ</span>
            <p class="pdp-info-text">
              Ürün görselleri stüdyo ortamında, profesyonel ışıklandırma ile çekilmiştir. Bu nedenle, ekran parlaklığı, çözünürlük ve cihaz ayarlarına bağlı olarak ürünün renk ve ambalaj tonlarında farklılıklar oluşabilir. Sipariş verdiğiniz ürün ve ambalaj, görselleriyle aynı renkte olmakla birlikte ton farkları yaşanması mümkündür.
            </p>
          </div>
          
          <table class="pdp-specs-table">
            <tr>
              <td>Ürün Kodu</td>
              <td>${productCode}</td>
            </tr>
            <tr>
              <td>Ürün Barkodu</td>
              <td>${productBarcode}</td>
            </tr>
            <tr>
              <td>Çeşit</td>
              <td>Tekli</td>
            </tr>
          </table>
        </div>
        
        <!-- Yorumlar Tab -->
        <div class="pdp-tab-panel" id="pdp-tab-reviews">
          <div class="pdp-review-card">
            <div class="pdp-review-header">
              <span class="pdp-review-author">Sümeyye A.</span>
              <span class="pdp-review-rating">★★★★★</span>
            </div>
            <p class="pdp-review-text">Çok başarılı bir ürün, sürekli kullanıyorum. Kargo çok hızlıydı ve harika paketlenmişti.</p>
          </div>
          <div class="pdp-review-card">
            <div class="pdp-review-header">
              <span class="pdp-review-author">Merve T.</span>
              <span class="pdp-review-rating">★★★★★</span>
            </div>
            <p class="pdp-review-text">Renk tonu tam göründüğü gibi, cilde harika bir ipeksi dokunuş veriyor. Kesinlikle tavsiye ederim.</p>
          </div>
          <div class="pdp-review-card">
            <div class="pdp-review-header">
              <span class="pdp-review-author">Ayşe K.</span>
              <span class="pdp-review-rating">★★★★☆</span>
            </div>
            <p class="pdp-review-text">Fiyatı çok uygun, makyaj çantamın vazgeçilmezi oldu. 1 günde elime ulaştı teşekkürler Parlayan Kozmetik!</p>
          </div>
        </div>
        
        <!-- İade Koşulları Tab -->
        <div class="pdp-tab-panel" id="pdp-tab-returns">
          <ul class="pdp-features-list">
            <li>Satın aldığınız ürünleri fatura tarihinden itibaren 14 gün içerisinde iade edebilirsiniz.</li>
            <li>İade edilecek ürünlerin ambalajının açılmamış, kullanılmamış ve hasar görmemiş olması gerekmektedir.</li>
            <li>Kozmetik ve kişisel bakım ürünlerinde hijyen kuralları gereği ambalajı veya emniyet bandı açılmış ürünlerin iadesi yasal olarak kabul edilememektedir.</li>
          </ul>
        </div>
        
        <!-- Ödeme Seçenekleri Tab -->
        <div class="pdp-tab-panel" id="pdp-tab-payments">
          <ul class="pdp-features-list">
            <li>Tüm bankaların Kredi Kartı veya Banka Kartı ile online güvenli ödeme (3D Secure).</li>
            <li>Parlayan Kart puanlarınız veya kupon kodlarınız ile sepette anında indirim ve ödeme imkanı.</li>
            <li>Anlaşmalı kargo firmaları aracılığıyla kapıda nakit veya kartla güvenli ödeme seçeneği.</li>
          </ul>
        </div>
        
        <!-- Tedarikçi Bilgileri Tab -->
        <div class="pdp-tab-panel" id="pdp-tab-supplier">
          <ul class="pdp-features-list">
            <li>Üretici / İthalatçı: Parlayan Kozmetik ve Sanayi Ticaret A.Ş.</li>
            <li>Adres: Levent Mahallesi, Büyükdere Cad. No: 100, Şişli / İstanbul</li>
            <li>Sağlık Bakanlığı onaylı ve GMP (İyi Üretim Uygulamaları) sertifikalı tesislerde hijyen standartlarına uygun üretilmiştir.</li>
          </ul>
        </div>
      </div>
    </div>
  `;

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
    '<span class="pdp-badge">Parlayan\'a Özel</span>' +
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
    '<button class="btn-buy-now pdp-fav-action-btn" data-id="' + product.id + '">FAVORİLERE EKLE</button>' +
    '<button class="btn-add-to-cart add-to-cart" data-id="' + product.id + '">SEPETE EKLE</button>' +
    '</div>' +
    '</div>' +
    '</div>' +
    tabsHTML;

  homeView.style.display = 'none';
  pdpView.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  updateUI();
}

function showProductDetail(productId) {
  if (!history.state || history.state.view !== 'pdp' || history.state.productId !== productId) {
    history.pushState({ view: 'pdp', productId: productId }, '', '#product-' + productId);
  }
  renderProductDetailSilent(productId);
}


function showToast(message) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = '✨ ' + message;
  container.appendChild(toast);

  // animate in
  setTimeout(() => toast.classList.add('show'), 10);

  // animate out
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

// --- Footer Modal Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
  // Footer link listeners
  document.querySelectorAll('.footer-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = link.dataset.modal;
      if (modalId) {
        openModal(modalId);
      }
    });
  });

  // FAQ Toggle functionality
  document.querySelectorAll('.faq-toggle').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const content = toggle.nextElementSibling;
      if (content && content.classList.contains('faq-content')) {
        content.style.display = content.style.display === 'none' ? 'block' : 'none';
        toggle.textContent = toggle.textContent.replace('▶', '▼');
        toggle.textContent = toggle.textContent.replace('▼', '▶');
      }
    });
  });

  // Generic Promo Card Carousel
  document.querySelectorAll('.promo-card').forEach((card) => {
    const slides = card.querySelectorAll('.promo-slide');
    const dots = card.querySelectorAll('.promo-dots .dot');
    if (slides.length <= 1) return;

    let currentIndex = 0;
    let intervalId;

    function showSlide(index) {
      slides.forEach((slide, i) => {
        if (i === index) {
          slide.classList.add('active');
        } else {
          slide.classList.remove('active');
        }
      });
      dots.forEach((dot, i) => {
        if (i === index) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
      currentIndex = index;
    }

    function nextSlide() {
      let nextIndex = (currentIndex + 1) % slides.length;
      showSlide(nextIndex);
    }

    function startAuto() {
      intervalId = setInterval(nextSlide, 4500);
    }

    function stopAuto() {
      clearInterval(intervalId);
    }

    // Dot click listeners
    dots.forEach((dot, i) => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent triggering parent card click handlers
        stopAuto();
        showSlide(i);
        startAuto();
      });
    });

    startAuto();
  });
});
