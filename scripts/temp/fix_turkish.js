const fs = require('fs');
const content = fs.readFileSync('public/index.html', 'utf-8');

const newNav = `<nav class="main-nav">
  <div class="nav-inner" style="max-width: 1200px; margin: 0 auto;" id="nav-links">
    <div class="nav-item-wrapper"><a href="#" class="nav-item" data-cat="Makyaj">Makyaj</a></div>
    <div class="nav-item-wrapper"><a href="#" class="nav-item" data-cat="Hijyen & Bakım">Hijyen & Bakım</a></div>
    <div class="nav-item-wrapper"><a href="#" class="nav-item" data-cat="Kişisel Bakım">Kişisel Bakım</a></div>
    <div class="nav-item-wrapper"><a href="#" class="nav-item" data-cat="Duş & Banyo">Duş & Banyo</a></div>
    <div class="nav-item-wrapper"><a href="#" class="nav-item" data-cat="Cilt Bakım">Cilt Bakım</a></div>
    <div class="nav-item-wrapper"><a href="#" class="nav-item" data-cat="Saç Bakım">Saç Bakım</a></div>
    <div class="nav-item-wrapper"><a href="#" class="nav-item" data-cat="Parfüm & Deodorant">Parfüm & Deodorant</a></div>
    <div class="nav-item-wrapper"><a href="#" class="nav-item" data-cat="Ev Temizlik / Hijyen Ürünleri">Ev Temizlik / Hijyen Ürünleri</a></div>
    <div class="nav-item-wrapper"><a href="#" class="nav-item" data-cat="Erkek Bakım">Erkek Bakım</a></div>
    <div class="nav-item-wrapper"><a href="#" class="nav-item" data-cat="Bebek Bakım">Bebek Bakım</a></div>
    <div class="nav-item-wrapper"><a href="#" class="nav-item" data-cat="Güneş Ürünleri">Güneş Ürünleri</a></div>
  </div>

</nav>`;

const replaced = content.replace(/<nav class="main-nav">[\s\S]*?<\/nav>/, newNav);
fs.writeFileSync('public/index.html', replaced, 'utf-8');
