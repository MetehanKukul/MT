const fs = require('fs');

let html = fs.readFileSync('public/index.html', 'utf8');

const replacements = [
  { old: '>Siparişlerim<', new: '>📦 <span class="dd-text">Siparişlerim</span><' },
  { old: '>Favorilerim<', new: '>🤍 <span class="dd-text">Favorilerim</span><' },
  { old: '>Adreslerim<', new: '>📍 <span class="dd-text">Adreslerim</span><' },
  { old: '>Kampanyalarım<', new: '>💎 <span class="dd-text">Kampanyalarım</span><' },
  { old: '>Parlayan Kartım<', new: '>✨ <span class="dd-text">Parlayan Kartım</span><' },
  { old: '>Puanlarım<', new: '>⭐ <span class="dd-text">Puanlarım</span><' },
  { old: '>Tekrar Satın Al<', new: '>🔄 <span class="dd-text">Tekrar Satın Al</span><' },
  { old: '>Hesabım ve Ayarlarım<', new: '>⚙️ <span class="dd-text">Hesabım ve Ayarlarım</span><' }
];

replacements.forEach(rep => {
  html = html.replace(rep.old, rep.new);
});

fs.writeFileSync('public/index.html', html);
console.log('index.html updated successfully.');


let css = fs.readFileSync('public/styles.css', 'utf8');

// remove old account dropdown css
const startIdx = css.indexOf('.account-dropdown {');
const endIdx = css.indexOf('.hamburger {'); // Next section

if(startIdx !== -1 && endIdx !== -1) {
  css = css.substring(0, startIdx) + css.substring(endIdx);
}

const modernCss = `
/* Account Dropdown Modern */
.account-dropdown {
  position: absolute;
  top: 130%;
  right: -10px;
  width: 270px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(227, 216, 231, 0.5);
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.08), 0 2px 10px rgba(0,0,0,0.03);
  z-index: 3000;
  padding: 12px 0 16px 0;
  cursor: default;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.account-menu-wrapper:hover .account-dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-pointer {
  position: absolute;
  top: -6px;
  right: 32px;
  width: 14px;
  height: 14px;
  background: #ffffff;
  transform: rotate(45deg);
  border-top: 1px solid rgba(227, 216, 231, 0.5);
  border-left: 1px solid rgba(227, 216, 231, 0.5);
  z-index: 3001;
}

.dropdown-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dropdown-list li a {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  margin: 4px 12px;
  color: var(--primary);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.dropdown-list li a .dd-text {
  flex-grow: 1;
}

.dropdown-list li a:hover {
  background: #fdfaf6;
  color: var(--secondary);
  transform: translateX(4px);
}

.dropdown-footer {
  padding: 12px 20px 0 20px;
  margin-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.logout-btn {
  width: 100%;
  background: transparent;
  color: var(--discount-red);
  border: 1px solid rgba(181, 66, 66, 0.2);
  padding: 10px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.logout-btn:hover {
  background: var(--discount-red);
  color: #fff;
}
`;

css = css.replace('/* Account Dropdown */', '/* Account Dropdown Modern */\n' + modernCss);

fs.writeFileSync('public/styles.css', css);
console.log('styles.css updated successfully.');

