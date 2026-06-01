const https = require('https');

fetch('https://www.gratis.com/search?q=Beaulis+Beautify+It+BB+Krem')
  .then(res => res.text())
  .then(html => {
    const m = html.match(/https:\/\/api\.gratis\.retter\.io[^\"\'\s>]+?\.(?:jpg|jpeg|png|webp)/gi);
    if(m) {
      console.log(m.slice(0, 15));
    } else {
      console.log("none");
    }
  });