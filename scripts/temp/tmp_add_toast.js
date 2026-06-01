const fs = require('fs');

let css = fs.readFileSync('public/styles.css', 'utf8');
const toastCss = `
/* Toast Notification */
#toast-container {
  position: fixed;
  top: 90px;
  right: 30px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.toast {
  background: var(--secondary);
  color: #fff;
  padding: 15px 25px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  font-weight: 600;
  opacity: 0;
  transform: translateX(100%);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast.show {
  opacity: 1;
  transform: translateX(0);
}
`;

if (!css.includes('Toast Notification')) {
  fs.writeFileSync('public/styles.css', css + '\n' + toastCss);
}

let appjs = fs.readFileSync('public/app.js', 'utf8');
const toastFunc = `
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
`;

if (!appjs.includes('function showToast')) {
  appjs = appjs + '\n' + toastFunc;
}

const oldSaveLine = "customAlert('Bilgileriniz başarıyla güncellendi!');";
const newSaveLine = "showToast('Bilgileriniz başarıyla güncellendi!');";

if (appjs.includes(oldSaveLine)) {
  appjs = appjs.replace(oldSaveLine, newSaveLine);
}

fs.writeFileSync('public/app.js', appjs);
console.log('Toast integrated');
