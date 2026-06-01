const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'public', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Remove user links from top header
html = html.replace(/<div class="user-links" id="user-links-container">[\s\S]*?<\/div>/, '<div class="user-links" id="user-links-container" style="display:none;"></div>');

// Add the account dropdown inside header-actions before btn-favs
const actionsRegex = /<div class="header-actions">/;
html = html.replace(actionsRegex, `<div class="header-actions">
        <div class="action-item account-menu-wrapper" id="btn-account">
          <span class="icon">👤</span>
          <span id="account-text">Giriş Yap</span>
          <div class="account-dropdown hidden" id="account-dropdown">
            <div class="dropdown-pointer"></div>
            <ul class="dropdown-list">
              <li><a href="#">Siparişlerim</a></li>
              <li><a href="#" id="menu-favs">Favorilerim</a></li>
              <li><a href="#">Adreslerim</a></li>
              <li><a href="#">Kampanyalarım</a></li>
              <li><a href="#">Parlayan Kartım</a></li>
              <li><a href="#">Puanlarım</a></li>
              <li><a href="#">Tekrar Satın Al</a></li>
              <li><a href="#">Hesabım ve Ayarlarım</a></li>
            </ul>
            <div class="dropdown-footer">
              <button class="logout-btn" id="btn-logout">Çıkış Yap <span style="font-size:18px;">➔</span></button>
            </div>
          </div>
        </div>`);

fs.writeFileSync(htmlPath, html);

const cssPath = path.join(__dirname, 'public', 'styles.css');
let css = fs.readFileSync(cssPath, 'utf8');

css += `\n
/* Account Dropdown */
.account-menu-wrapper {
  position: relative;
}
.account-dropdown {
  position: absolute;
  top: 130%;
  right: 0;
  width: 280px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
  z-index: 1000;
  padding: 10px 0 20px 0;
  cursor: default;
}
.dropdown-pointer {
  position: absolute;
  top: -8px;
  right: 25px;
  width: 16px;
  height: 16px;
  background: #ffffff;
  transform: rotate(45deg);
  border-top: 1px solid rgba(0,0,0,0.05);
  border-left: 1px solid rgba(0,0,0,0.05);
}
.dropdown-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.dropdown-list li a {
  display: block;
  padding: 16px 25px;
  color: var(--primary);
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.2s;
}
.dropdown-list li a:hover {
  background: rgba(90, 30, 92, 0.05);
}
.dropdown-footer {
  padding: 15px 25px 0 25px;
  margin-top: 10px;
}
.logout-btn {
  width: 100%;
  background: white;
  color: var(--primary);
  border: 1px solid #cc99cc;
  padding: 12px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s;
}
.logout-btn:hover {
  background: #fdf5fd;
  border-color: var(--primary);
}
`;
fs.writeFileSync(cssPath, css);


const appPath = path.join(__dirname, 'public', 'app.js');
let appJs = fs.readFileSync(appPath, 'utf8');

// Replace updateUI logic for userLinks
appJs = appJs.replace(
  /Elements\.userLinks\.innerHTML = `Hoş geldin, <strong style="color:var\(--primary\)">\${currentUser\.name}<\/strong> &nbsp;\|&nbsp; <a href="#" id="btn-logout">Çıkış Yap<\/a>`;\s+document\.getElementById\('btn-logout'\)\?\.addEventListener\('click', e => \{\s+e\.preventDefault\(\);\s+currentUser = null;\s+updateUI\(\);\s+\}\);/,
  `document.getElementById('account-text').textContent = 'Hesabım';
    if(document.getElementById('account-dropdown')) {
      document.getElementById('account-dropdown').classList.remove('hidden');
    }
  `
);

appJs = appJs.replace(
  /Elements\.userLinks\.innerHTML = `<a href="#" id="btn-login" data-target="login-modal">Giriş Yap<\/a> veya <a href="#" id="btn-register" data-target="register-modal">Üye Ol<\/a>`;/,
  `document.getElementById('account-text').textContent = 'Giriş Yap';
    if(document.getElementById('account-dropdown')) {
      document.getElementById('account-dropdown').classList.add('hidden');
    }
  `
);

appJs = appJs.replace(
  /document\.getElementById\('form-login'\)\.addEventListener\('submit', e => {/,
  `
  // Login Dropdown / Modal Logic
  document.getElementById('btn-account').addEventListener('click', (e) => {
    if(!currentUser) {
      openModal('login-modal');
    } else {
       // Toggle dropdown if clicked exactly on the icon/text when logged in
       if(e.target.closest('.account-dropdown') === null) {
          const dd = document.getElementById('account-dropdown');
          dd.classList.toggle('hidden');
       }
    }
  });
  
  // Menu Favorilerim link wrapper
  const menuFavs = document.getElementById('menu-favs');
  if (menuFavs) {
    menuFavs.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('fav-sidebar');
      document.getElementById('account-dropdown').classList.add('hidden');
    });
  }

  // Logout from dropdown
  const logoutBtn = document.getElementById('btn-logout');
  if(logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      currentUser = null;
      updateUI();
      document.getElementById('account-dropdown').classList.add('hidden');
    });
  }

  document.getElementById('form-login').addEventListener('submit', e => {`
);

fs.writeFileSync(appPath, appJs);
console.log('User dropdown updated.');
