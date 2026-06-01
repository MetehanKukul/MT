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

function generateDescription(name, category, brandName) {
  const brand = brandName && brandName !== 'Bilinmiyor' ? brandName : (name.split(' ')[0] || '');
  const lowerName = name.toLowerCase();
  const lowerCat = (category || '').toLowerCase();

  // 1. DUDAK MAKYAJI / RUJLAR
  if (lowerName.includes('ruj') || lowerName.includes('lip') || lowerName.includes('parlatici') || lowerName.includes('dudak')) {
    return `${brand} markasının en beğenilen serilerinden biri olan ${name}, gün boyu kalıcılık ve dudaklarınızı kurutmayan özel bir formül sunar. İpeksi dokusu sayesinde kolayca sürülür, dudak hatlarınızı belirginleştirerek makyajınıza büyüleyici bir matlık veya ışıltılı bir parlaklık kazandırır. Günlük kullanım ve özel davetler için vazgeçilmezdir.`;
  }
  
  // 2. MASKARA / GÖZ MAKYAJI
  if (lowerName.includes('maskara') || lowerName.includes('eyeliner') || lowerName.includes('far') || lowerName.includes('göz') || lowerName.includes('eyebrow') || lowerName.includes('kaş')) {
    return `${brand} uzmanlığıyla geliştirilen ${name}, göz makyajınızda profesyonel sonuçlar elde etmenizi sağlar. Kirpikleri tek tek ayıran özel fırça yapısıyla dolgun ve hacimli kirpikler sunarken, akma veya dökülme yapmayan dayanıklı formülü sayesinde bakışlarınıza gün boyu derinlik ve çekicilik katar.`;
  }
  
  // 3. TEN MAKYAJI (BB, CC, Fondöten, Allık)
  if (lowerName.includes('krem') && (lowerName.includes('bb') || lowerName.includes('cc')) || lowerName.includes('fondöten') || lowerName.includes('allik') || lowerName.includes('pudra') || lowerName.includes('kapatici') || lowerName.includes('aydinlatici')) {
    return `${brand} kalitesiyle sunulan ${name}, cilt tonunuzu mükemmel şekilde eşitleyerek doğal ve pürüzsüz bir görünüm sağlar. Hafif formülü cildinizin gün boyu nefes almasına izin verirken, lekeleri ve gözenekleri gizleyerek kadifemsi bir bitiş sunar. Gün boyu süren kalıcı etkisiyle cildinize taze ve aydınlık bir ışıltı katar.`;
  }

  // 4. ŞAMPUNLAR VE SAÇ BAKIMI
  if (lowerName.includes('sampuan') || lowerName.includes('şampuan') || lowerName.includes('saç') || lowerName.includes('sac') || lowerName.includes('köpük') || lowerName.includes('wax')) {
    return `${brand} saç bakım teknolojisi ile üretilen ${name}, saç tellerinizi kökten uca derinlemesine besler ve saç derisini kurutmadan nazikçe temizler. Özel Pro-V/Keratin/Argan formülü sayesinde yıpranmış saçları onarır, saçın doğal nem dengesini koruyarak ipeksi bir yumuşaklık ve göz alıcı bir parlaklık kazandırır.`;
  }

  // 5. PARFÜMLER & DEODORANTLAR
  if (lowerName.includes('parfüm') || lowerName.includes('edp') || lowerName.includes('edt') || lowerName.includes('deodorant') || lowerName.includes('roll')) {
    return `${brand} imzasını taşıyan ${name}, büyüleyici koku notalarıyla gün boyu süren ferahlık ve kalıcılık sağlar. Her anınızda kendinizi özel ve özgüvenli hissetmenizi sağlayacak benzersiz esans bileşenleri, ciltte tazeleyici bir his bırakır. Teninizle mükemmel uyum sağlayarak günün her saatinde kalıcı bir iz bırakır.`;
  }

  // 6. OJELER & TIRNAK BAKIMI
  if (lowerName.includes('oje') || lowerName.includes('tırnak') || lowerName.includes('tirnak')) {
    return `Tırnaklarınızda profesyonel ve pürüzsüz bir görünüm sağlayan ${name}, yüksek örtücülük ve soyulmaya karşı ekstra dayanıklı formüle sahiptir. Hızlı kuruma özelliği sayesinde zamandan tasarruf etmenizi sağlarken, canlı ve parlak tonları tırnaklarınıza şık ve bakımlı bir estetik kazandırır.`;
  }

  // 7. CİLT BAKIMI / NEMLENDİRİCİ / SERUM
  if (lowerName.includes('serum') || lowerName.includes('nemlendirici') || lowerName.includes('peeling') || lowerName.includes('tonik') || lowerName.includes('cilt') || lowerName.includes('vücut')) {
    return `${brand} dermatolojik uzmanlığıyla geliştirilen ${name}, cildinizin ihtiyaç duyduğu derinlemesine nemlendirmeyi ve bakımı anında sunar. Cilt bariyerinizi güçlendirerek kuruluk ve yıpranmalara karşı korur, cildinize doğal bir yumuşaklık ve pürüzsüz bir esneklik kazandırarak genç ve canlı görünümünü destekler.`;
  }

  // 8. HİJYENİK PED VE KİŞİSEL HİJYEN
  if (lowerName.includes('ped') || lowerName.includes('tampon') || lowerName.includes('hijyen')) {
    return `${brand} kalitesiyle geliştirilen ${name}, üstün emici gücü ve pamuksu yumuşaklıktaki dokusu ile özel günlerinizde veya günlük hayatınızda %100 güvenli bir koruma sunar. Sızdırmayan özel bariyerleri ve nefes alan yüzeyi sayesinde cildinizde tahrişe izin vermez, gün boyu yüksek konfor ve hareket özgürlüğü sağlar.`;
  }

  // 9. PAMUK VE TEMİZLEME MENDİLLERİ
  if (lowerName.includes('pamuk') || lowerName.includes('mendil') || lowerName.includes('islak')) {
    return `Cildiniz için ekstra yumuşak ve doğal liflerden üretilmiş ${name}, kişisel bakım ve makyaj temizliği uygulamalarında en nazik yardımcınızdır. Emici dokusu makyaj kalıntılarını ve toniği cildinizi tahriş etmeden kolayca arındırır. Seyahatlerde ve günlük hayatta pratik ve hijyenik kullanım sağlar.`;
  }

  // 10. MAKYAJ VE BAKIM AKSESUARLARI
  if (lowerName.includes('aksesuar') || lowerName.includes('sünger') || lowerName.includes('fırça') || lowerName.includes('firça') || lowerName.includes('ayna')) {
    return `Kusursuz ve profesyonel makyaj uygulamaları için özel olarak üretilen ${name}, yüksek kaliteli malzemesi ve ergonomik tasarımıyla kolay kullanım sunar. Makyaj ürünlerinizin cildinize eşit ve homojen bir şekilde dağılmasını sağlayarak pürüzsüz bir makyaj sonucu elde etmenize yardımcı olur.`;
  }

  // 11. GENEL FALLBACK (Genel Ürün Açıklaması)
  return `${brand} markasının en çok tercih edilen ürünlerinden biri olan ${name}, yüksek kaliteli hammaddeleri ve dermatolojik olarak test edilmiş formülü ile kişisel bakımınızın vazgeçilmezi olacaktır. Kullanıcı memnuniyeti odaklı yapısıyla günlük bakım rutininize konfor ve canlılık katar.`;
}

async function run() {
  try {
    const pool = await sql.connect(dbConfig);
    console.log("SQL Server'a başarıyla bağlandı. Ürün bilgileri çekiliyor...\n");
    
    // Fetch all products with category names
    const productsRes = await pool.request().query(`
      SELECT 
        U.UrunID, 
        U.UrunAd, 
        COALESCE(M.MarkaAd, 'Bilinmiyor') AS MarkaAd,
        COALESCE(K.KategoriAd, '') AS KategoriAd
      FROM dbo.Urunler U
      LEFT JOIN dbo.Markalar M ON U.MarkaID = M.MarkaID
      LEFT JOIN dbo.Kategoriler K ON U.KategoriID = K.KategoriID
    `);
    
    const products = productsRes.recordset;
    console.log(`Toplam ${products.length} ürün bulundu. Açıklamalar üretilip güncelleniyor...\n`);
    
    let updatedCount = 0;
    
    for (const p of products) {
      const description = generateDescription(p.UrunAd, p.KategoriAd, p.MarkaAd);
      
      const request = pool.request();
      request.input('id', sql.Int, p.UrunID);
      request.input('description', sql.NVarChar, description);
      
      const res = await request.query(
        'UPDATE dbo.Urunler SET Aciklama = @description WHERE UrunID = @id'
      );
      
      if (res.rowsAffected[0] > 0) {
        updatedCount++;
        // Print progress for first few and every 50 products
        if (updatedCount <= 5 || updatedCount % 100 === 0 || updatedCount === products.length) {
          console.log(`[${updatedCount}/${products.length}] ✓ '${p.UrunAd}' için açıklama başarıyla yazıldı.`);
        }
      }
    }
    
    console.log(`\nVeri tabanı başarıyla güncellendi! Toplam ${updatedCount} ürünün teker teker açıklaması eklendi.`);
    process.exit(0);
  } catch (err) {
    console.error("Hata:", err.message);
    process.exit(1);
  }
}

run();
