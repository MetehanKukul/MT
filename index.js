const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');

// MongoDB Bağlantı Ayarları
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ParlayanKozmetik';
const client = new MongoClient(uri);

// Veritabanı bağlantısını başlat
async function connectDB() {
  try {
    await client.connect();
    console.log('MongoDB veritabanına başarıyla bağlanıldı.');
  } catch (err) {
    console.error('MongoDB bağlantı hatası:', err);
  }
}
connectDB();

// Fallback (Yedek) Veri (Veritabanına ulaşılamazsa kullanılacak)
const featuredProducts = [
  { id: 1, brand: 'Beaulis', name: 'Zip It Likit Mat Ruj', price: '99.50 TL', oldPrice: '199.00 TL', category: 'Makyaj', badge: '%50' },
  { id: 2, brand: 'Lykd', name: 'Glow Yüz Serumu', price: '129.00 TL', oldPrice: '258.00 TL', category: 'Cilt Bakım', badge: '%50' },
  { id: 3, brand: 'Maybelline', name: 'Lash Sensational Maskara', price: '249.00 TL', oldPrice: '450.00 TL', category: 'Makyaj', badge: 'İndirim' },
  { id: 4, brand: 'Benri', name: 'Pamuk 100lü', price: '29.50 TL', oldPrice: '35.00 TL', category: 'Kişisel Bakım', badge: 'Avantaj' },
  { id: 5, brand: 'Garnier', name: 'Micellar Kusursuz Makyaj Temizleme', price: '149.00 TL', oldPrice: '290.00 TL', category: 'Cilt Bakım', badge: '%48' },
  { id: 6, brand: 'Pastel', name: 'Day Long Lipcolor Kissproof', price: '189.00 TL', oldPrice: '250.00 TL', category: 'Makyaj', badge: 'Çok Satan' },
  { id: 7, brand: 'Himalaya', name: 'Ceviz Özlü Peeling Etkili Yüz Yıkama', price: '89.00 TL', oldPrice: '150.00 TL', category: 'Cilt Bakım', badge: 'Fırsat' },
  { id: 8, brand: 'Eklips', name: 'Makyaj Süngeri', price: '45.00 TL', oldPrice: '60.00 TL', category: 'Aksesuar', badge: 'Yeni' },
];

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg'
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Bulunamadı');
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

function resolveStaticPath(requestPath) {
  const normalizedPath = path.normalize(requestPath).replace(/^([.]{2}[\\/])+/, '');
  const candidatePath = path.join(publicDir, normalizedPath);
  if (!candidatePath.startsWith(publicDir)) return null;
  return candidatePath;
}

http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const db = client.db();
  
  if (requestUrl.pathname === '/api/products') {
    try {
      // MongoDB'den ürünleri çekiyoruz
      const products = await db.collection('products').find({}).toArray();
      
      if (products.length === 0) {
        // Eğer veritabanı boşsa (henüz veri eklenmemişse) fallback veriyi gönder
        return sendJson(res, 200, featuredProducts);
      }
      
      // Frontend'in beklediği formata (id alanı vb.) çeviriyoruz
      const formattedProducts = products.map(p => ({
        id: p.id || p._id.toString(),
        brand: p.brand || 'Bilinmiyor',
        name: p.name,
        price: p.price + ' TL',
        oldPrice: p.oldPrice ? p.oldPrice + ' TL' : (p.price > 50 ? (p.price + 20) + ' TL' : ''),
        category: p.category || 'Tümü',
        categoryId: p.categoryId,
        mainCategory: p.mainCategory,
        image: p.image,
        description: p.description,
        badge: p.badge || (p.price < 100 ? 'Fırsat' : 'Sevilen')
      }));
      
      return sendJson(res, 200, formattedProducts);
    } catch (err) {
      console.error('Veri tabanından ürünleri çekerken hata oluştu: ', err);
      // Hata olursa statik verilerimiz gösterilebilir
      return sendJson(res, 200, featuredProducts);
    }
  } else if (requestUrl.pathname === '/api/categories') {
    try {
      const categories = await db.collection('categories').find({}).toArray();
      
      const formattedCategories = categories.map(c => ({
        id: c.id || c._id.toString(),
        name: c.name,
        parentId: c.parentId ? c.parentId.toString() : null
      }));
      
      return sendJson(res, 200, formattedCategories);
    } catch (err) {
      console.error('Kategorileri çekerken hata oluştu: ', err);
      return sendJson(res, 500, { error: 'Veriler çekilemedi' });
    }
  } else if (requestUrl.pathname === '/api/brands') {
    try {
      const brands = await db.collection('brands').find({}).toArray();
      
      const formattedBrands = brands.map(b => ({
        id: b.id || b._id.toString(),
        name: b.name
      }));
      
      return sendJson(res, 200, formattedBrands);
    } catch (err) {
      console.error('Markaları çekerken hata oluştu: ', err);
      return sendJson(res, 500, { error: 'Veriler çekilemedi' });
    }
  } else if (requestUrl.pathname === '/api/users') {
    try {
      const users = await db.collection('users').find({}).toArray();
      
      const formattedUsers = users.map(u => ({
        id: u.id || u._id.toString(),
        ad: u.ad,
        soyad: u.soyad,
        email: u.email,
        telefon: u.phone,
        kayitTarihi: u.createdAt
      }));
      
      return sendJson(res, 200, formattedUsers);
    } catch (err) {
      console.error('Kullanıcıları çekerken hata oluştu: ', err);
      return sendJson(res, 500, { error: 'Kullanıcılar çekilemedi' });
    }
  } else if (requestUrl.pathname === '/api/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const { email, password } = JSON.parse(body);
        
        const user = await db.collection('users').findOne({ email: email, password: password });
          
        if (user) {
          // Frontend'e giderken _id'yi id'ye çevirip password'ü gizliyoruz
          const safeUser = {
            id: user.id || user._id.toString(),
            KullaniciID: user.id || user._id.toString(), // Geriye dönük uyumluluk için
            Eposta: user.email,
            Ad: user.ad,
            Soyad: user.soyad,
            Telefon: user.phone
          };
          return sendJson(res, 200, { success: true, user: safeUser });
        } else {
          return sendJson(res, 401, { success: false, message: 'Hatalı e-posta veya şifre!' });
        }
      } catch (err) {
        console.error('Giriş işlemi sırasında hata oluştu: ', err);
        return sendJson(res, 500, { success: false, message: 'Sunucu hatası' });
      }
    });
    return;
  
  } else if (requestUrl.pathname === '/api/users/update' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        
        if (!payload.id) {
            return sendJson(res, 400, { success: false, message: 'Kullanıcı ID gereklidir.' });
        }

        const updateData = { email: payload.email };
        
        if (payload.name) {
            const parts = payload.name.trim().split(' ');
            updateData.ad = parts[0];
            updateData.soyad = parts.length > 1 ? parts.slice(1).join(' ') : 'Soyad Yok';
        }
        
        if (payload.phone !== undefined) {
             updateData.phone = payload.phone;
        }
        
        if (payload.password && payload.password.trim() !== '') {
            updateData.password = payload.password;
        }
        
        const result = await db.collection('users').updateOne(
            { _id: new ObjectId(payload.id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
             return sendJson(res, 404, { success: false, message: 'Kullanıcı bulunamadı.' });
        }
        
        return sendJson(res, 200, { success: true, message: 'Bilgileriniz başarıyla güncellendi' });
      } catch (err) {
        console.error('Update hatası:', err);
        return sendJson(res, 500, { success: false, message: 'Sunucu hatası: ' + err.message });
      }
    });
    return;
  } else if (requestUrl.pathname === '/api/register' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const { ad, soyad, email, password } = JSON.parse(body);
        
        // E-postanın kullanımda olup olmadığını kontrol et
        const existingUser = await db.collection('users').findOne({ email: email });

        if (existingUser) {
          return sendJson(res, 400, { success: false, message: 'Bu e-posta adresi zaten sisteme kayıtlı.' });
        }

        // Yeni kullanıcıyı ekle
        await db.collection('users').insertOne({
            ad: ad || 'Ad Yok',
            soyad: soyad || 'Soyad Yok',
            email: email,
            password: password,
            createdAt: new Date()
        });

        return sendJson(res, 200, { success: true, message: 'Kullanıcı başarıyla kaydedildi.' });
      } catch (err) {
        console.error('Kayıt işlemi sırasında hata oluştu: ', err);
        return sendJson(res, 500, { success: false, message: 'Sunucu hatası: ' + err.message });
      }
    });
    return;
  }

  const staticPath = requestUrl.pathname === '/' ? path.join(publicDir, 'index.html') : resolveStaticPath(requestUrl.pathname);
  if (staticPath && fs.existsSync(staticPath) && fs.statSync(staticPath).isFile()) {
    return sendFile(res, staticPath);
  }
  
  sendFile(res, path.join(publicDir, 'index.html'));
}).listen(port, () => console.log(`Server started on port ${port}`));
