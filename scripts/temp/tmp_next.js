const fs = require('fs');
fetch('https://www.gratis.com/search?q=' + encodeURIComponent('LYKD My Style Up Nail Enamel Oje 679'))
  .then(res => res.text())
  .then(html => {
    // try to find product entries: "name":"LYKD My Style Up Nail Enamel Oje 679 Cloud Pink", ... "images":["..."]
    const pattern = /"name":"([^"]+)"[^{}]*?"images":\["([^"]+)"/g;
    let match;
    const items = [];
    while ((match = pattern.exec(html)) !== null) {
      items.push({name: match[1], url: match[2]});
    }
    console.log(items.length > 0 ? items.slice(0, 5) : html.substring(0, 200));
  });