const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ParlayanKozmetik';
const client = new MongoClient(uri);

async function seedDB() {
  try {
    await client.connect();
    console.log('MongoDB bağlantısı başarılı. Veriler ekleniyor...');
    
    const db = client.db();

    // Koleksiyonları temizle (isteğe bağlı, sıfırdan başlamak için)
    await db.collection('products').deleteMany({});
    await db.collection('categories').deleteMany({});
    await db.collection('brands').deleteMany({});
    await db.collection('users').deleteMany({});

    // --- Kategoriler ---
    const categories = [
      { name: 'Makyaj' },
      { name: 'Cilt Bakım' },
      { name: 'Kişisel Bakım' },
      { name: 'Aksesuar' }
    ];
    const categoryResult = await db.collection('categories').insertMany(categories);
    const catMap = {
      'Makyaj': categoryResult.insertedIds[0],
      'Cilt Bakım': categoryResult.insertedIds[1],
      'Kişisel Bakım': categoryResult.insertedIds[2],
      'Aksesuar': categoryResult.insertedIds[3]
    };

    // --- Markalar ---
    const brands = [
      { name: 'Beaulis' },
      { name: 'Lykd' },
      { name: 'Maybelline' },
      { name: 'Benri' },
      { name: 'Garnier' },
      { name: 'Pastel' },
      { name: 'Himalaya' },
      { name: 'Eklips' }
    ];
    const brandResult = await db.collection('brands').insertMany(brands);

    // --- Ürünler ---
    const products = [
      { brand: 'Beaulis', name: 'Zip It Likit Mat Ruj', price: 99.50, oldPrice: 199.00, category: 'Makyaj', categoryId: catMap['Makyaj'], badge: '%50' },
      { brand: 'Lykd', name: 'Glow Yüz Serumu', price: 129.00, oldPrice: 258.00, category: 'Cilt Bakım', categoryId: catMap['Cilt Bakım'], badge: '%50' },
      { brand: 'Maybelline', name: 'Lash Sensational Maskara', price: 249.00, oldPrice: 450.00, category: 'Makyaj', categoryId: catMap['Makyaj'], badge: 'İndirim' },
      { brand: 'Benri', name: 'Pamuk 100lü', price: 29.50, oldPrice: 35.00, category: 'Kişisel Bakım', categoryId: catMap['Kişisel Bakım'], badge: 'Avantaj' },
      { brand: 'Garnier', name: 'Micellar Kusursuz Makyaj Temizleme', price: 149.00, oldPrice: 290.00, category: 'Cilt Bakım', categoryId: catMap['Cilt Bakım'], badge: '%48' },
      { brand: 'Pastel', name: 'Day Long Lipcolor Kissproof', price: 189.00, oldPrice: 250.00, category: 'Makyaj', categoryId: catMap['Makyaj'], badge: 'Çok Satan' },
      { brand: 'Himalaya', name: 'Ceviz Özlü Peeling Etkili Yüz Yıkama', price: 89.00, oldPrice: 150.00, category: 'Cilt Bakım', categoryId: catMap['Cilt Bakım'], badge: 'Fırsat' },
      { brand: 'Eklips', name: 'Makyaj Süngeri', price: 45.00, oldPrice: 60.00, category: 'Aksesuar', categoryId: catMap['Aksesuar'], badge: 'Yeni' }
    ];
    await db.collection('products').insertMany(products);

    // --- Örnek Kullanıcı ---
    await db.collection('users').insertOne({
      ad: 'Test',
      soyad: 'Kullanıcısı',
      email: 'test@test.com',
      password: '123',
      phone: '05554443322',
      createdAt: new Date()
    });

    console.log('Tüm örnek veriler (Kategoriler, Markalar, Ürünler, Kullanıcı) başarıyla eklendi!');
  } catch (err) {
    console.error('Veri eklerken hata oluştu:', err);
  } finally {
    await client.close();
  }
}

seedDB();
