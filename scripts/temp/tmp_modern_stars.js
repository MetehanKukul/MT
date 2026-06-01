const fs = require('fs');

let css = fs.readFileSync('public/styles.css', 'utf8');

// remove everything from the first old star injection onwards
const marker = '.logo-text::before {';
const index = css.indexOf(marker);
if (index !== -1) {
    css = css.substring(0, index).trim();
}

const modernStarCss = `
/* Modern Yıldız / Parlama Efekti */
.logo-text::before {
  content: '';
  position: absolute;
  top: -10px;
  left: -18px;
  width: 24px;
  height: 24px;
  background: radial-gradient(circle, #ffffff 10%, #d4af94 30%, transparent 60%);
  clip-path: polygon(50% 0%, 53% 47%, 100% 50%, 53% 53%, 50% 100%, 47% 53%, 0% 50%, 47% 47%);
  opacity: 0;
  animation: modern-flare 3.5s infinite ease-in-out;
  pointer-events: none;
}

.logo-text::after {
  content: '';
  position: absolute;
  top: 12px;
  right: -20px;
  width: 18px;
  height: 18px;
  background: radial-gradient(circle, #ffffff 10%, #d4af94 30%, transparent 60%);
  clip-path: polygon(50% 0%, 54% 46%, 100% 50%, 54% 54%, 50% 100%, 46% 54%, 0% 50%, 46% 46%);
  opacity: 0;
  animation: modern-flare 4s infinite ease-in-out 1.2s;
  pointer-events: none;
}

.logo-sub::before {
  content: '';
  position: absolute;
  top: 10px;
  left: 20px;
  width: 14px;
  height: 14px;
  background: radial-gradient(circle, #ffffff 10%, #d4af94 30%, transparent 60%);
  clip-path: polygon(50% 0%, 55% 45%, 100% 50%, 55% 55%, 50% 100%, 45% 55%, 0% 50%, 45% 45%);
  opacity: 0;
  animation: modern-flare 3s infinite ease-in-out 2s;
  pointer-events: none;
}

@keyframes modern-flare {
  0% { 
    opacity: 0; 
    transform: scale(0.2) rotate(0deg); 
  }
  30% { 
    opacity: 0.9; 
    transform: scale(1.1) rotate(45deg); 
  }
  50% { 
    opacity: 1; 
    transform: scale(1.3) rotate(90deg);
    filter: drop-shadow(0 0 8px rgba(200, 155, 123, 0.8));
  }
  70% { 
    opacity: 0.9; 
    transform: scale(1.1) rotate(135deg); 
  }
  100% { 
    opacity: 0; 
    transform: scale(0.2) rotate(180deg); 
  }
}
`;

fs.writeFileSync('public/styles.css', css + '\n\n' + modernStarCss);
console.log('Modern stars injected');