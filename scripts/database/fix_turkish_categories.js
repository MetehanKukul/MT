const sql = require('mssql/msnodesqlv8');

const dbConfig = {
  server: 'DESKTOP-HO38PT5\\SQLEXPRESS',
  database: 'ParlayanKozmetik.com',
  driver: 'ODBC Driver 17 for SQL Server',
  options: {
    trustedConnection: true,
    trustServerCertificate: true
  }
};

const categoryMapping = {
  'Erkek Bakim': 'Erkek Bakım',
  'Tiras Ürünleri': 'Tıraş Ürünleri',
  'Tiras Köpügü': 'Tıraş Köpüğü',
  'Tiras Jeli': 'Tıraş Jeli',
  'Tiras Biçagi': 'Tıraş Bıçağı',
  'Tiras Makineleri': 'Tıraş Makineleri',
  'Yedek Biçaklar': 'Yedek Bıçaklar',
  'Kadin Parfüm': 'Kadın Parfüm',
  'Ten Makyaji': 'Ten Makyajı',
  'Kapatici': 'Kapatıcı',
  'Allik': 'Allık',
  'Aydinlatici': 'Aydınlatıcı',
  'Makyaj Bazi': 'Makyaj Bazı',
  'Göz Makyaji': 'Göz Makyajı',
  'Kas': 'Kaş',
  'Dudak Makyaji': 'Dudak Makyajı',
  'Dudak Parlaticisi': 'Dudak Parlatıcısı',
  'Dudak Yagi': 'Dudak Yağı',
  'Tirnak Bakim': 'Tırnak Bakım',
  'Tirnak Bakim Ürünleri': 'Tırnak Bakım Ürünleri',
  'Temizleyici (Tirnak)': 'Temizleyici (Tırnak)',
  'Makyaj Çantalari': 'Makyaj Çantaları',
  'Seyahat Sise / Seti': 'Seyahat Şişe / Seti',
  'Hijyen & Bakim': 'Hijyen & Bakım',
  'Agiz & Dis Bakimi': 'Ağız & Diş Bakımı',
  'Dis Macunu': 'Diş Macunu',
  'Ilk Yardim': 'İlk Yardım',
  'Tras Ürünleri': 'Tıraş Ürünleri',
  'Tras Köpükleri': 'Tıraş Köpükleri',
  'Kisisel Bakim': 'Kişisel Bakım',
  'Makyaj Temizleme Pamugu': 'Makyaj Temizleme Pamuğu',
  'Kulak Pamugu': 'Kulak Pamuğu',
  'Makyaj Aksesuarlari': 'Makyaj Aksesuarları',
  'Makyaj Firçalari': 'Makyaj Fırçaları',
  'Makyaj Aynasi': 'Makyaj Aynası',
  'Takma Tirnak / Kirpik': 'Takma Tırnak / Kirpik',
  'Dus & Banyo': 'Duş & Banyo',
  'Dus Jeli': 'Duş Jeli',
  'Cilt Bakimi': 'Cilt Bakımı',
  'El Bakimi': 'El Bakımı',
  'Vücut Bakimi': 'Vücut Bakımı',
  'Vücut Yagi': 'Vücut Yağı',
  'Ayak Bakimi': 'Ayak Bakımı',
  'Tabanlik': 'Tabanlık',
  'Dudak Bakimi (Cilt)': 'Dudak Bakımı (Cilt)',
  'Yaslanma Karsiti Kremler': 'Yaşlanma Karşıtı Kremler',
  'Leke Karsiti Kremler': 'Leke Karşıtı Kremler',
  'Göz Bakimi': 'Göz Bakımı',
  'Sampuanlar': 'Şampuanlar',
  'Kuru Sampuan': 'Kuru Şampuan',
  'Sac Bakim Ürünleri': 'Saç Bakım Ürünleri',
  'Saç Köpügü': 'Saç Köpüğü',
  'Saç Yagi': 'Saç Yağı',
  'Saç Boyalari': 'Saç Boyaları',
  'Saç Sekillendirici': 'Saç Şekillendirici',
  'Günes Ürünleri': 'Güneş Ürünleri',
  'Günes Kremleri': 'Güneş Kremleri',
  'Günes Spreyi': 'Güneş Spreyi',
  'Bebek / Çocuk Günes Spreyi': 'Bebek / Çocuk Güneş Spreyi',
  'Bebek Bakim Ürünleri': 'Bebek Bakım Ürünleri',
  'Bebek Kolonyasi': 'Bebek Kolonyası',
  'Pisik Kremi': 'Pişik Kremi',
  'Diger': 'Diğer',
  'Tras Bicaklari': 'Tıraş Bıçakları',
  'Yedek Bicaklar': 'Yedek Bıçaklar'
};

async function fix() {
  try {
    const pool = await sql.connect(dbConfig);
    console.log("SQL Server'a başarıyla bağlandı. Güncellemeler başlatılıyor...\n");
    
    let updatedCount = 0;
    for (const [oldVal, newVal] of Object.entries(categoryMapping)) {
      const request = pool.request();
      request.input('oldVal', sql.NVarChar, oldVal);
      request.input('newVal', sql.NVarChar, newVal);
      
      const res = await request.query(
        'UPDATE dbo.Kategoriler SET KategoriAd = @newVal WHERE KategoriAd = @oldVal'
      );
      
      if (res.rowsAffected[0] > 0) {
        console.log(`✓ '${oldVal}' ➔ '${newVal}' olarak güncellendi. (${res.rowsAffected[0]} satır etkilendi)`);
        updatedCount++;
      }
    }
    
    console.log(`\nGüncelleme işlemi tamamlandı. Toplam ${updatedCount} kategori güncellendi.`);
    process.exit(0);
  } catch (err) {
    console.error("Veritabanı hatası:", err.message);
    process.exit(1);
  }
}

fix();
