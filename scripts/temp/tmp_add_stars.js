const fs = require('fs');
let css = fs.readFileSync('public/styles.css', 'utf8');

css = css.replace('.logo-text { font-size', '.logo-text { position: relative; font-size');
css = css.replace('.logo-sub { font-size', '.logo-sub { position: relative; font-size');

const starCss = `
.logo-text::before {
  content: '✦';
  position: absolute;
  top: -8px;
  left: -20px;
  font-size: 22px;
  color: #C89B7B;
  opacity: 0;
  animation: star-twinkle 2.5s infinite ease-in-out;
  pointer-events: none;
}

.logo-text::after {
  content: '✦';
  position: absolute;
  top: 10px;
  right: -24px;
  font-size: 16px;
  color: #C89B7B;
  opacity: 0;
  animation: star-twinkle 2.5s infinite ease-in-out 1s;
  pointer-events: none;
}

.logo-sub::before {
  content: '✦';
  position: absolute;
  top: 10px;
  left: 20px;
  font-size: 10px;
  color: #C89B7B;
  opacity: 0;
  animation: star-twinkle 2.5s infinite ease-in-out 1.8s;
  pointer-events: none;
}

@keyframes star-twinkle {
  0% { opacity: 0; transform: scale(0.5) rotate(0deg); }
  50% { opacity: 1; transform: scale(1.4) rotate(45deg); text-shadow: 0 0 8px rgba(200, 155, 123, 0.8); }
  100% { opacity: 0; transform: scale(0.5) rotate(90deg); }
}
`;

fs.writeFileSync('public/styles.css', css + starCss);
console.log('Stars injected');