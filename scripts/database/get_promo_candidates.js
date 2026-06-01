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

async function findCandidates() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT * FROM (
        SELECT TOP 1 U.UrunID AS id, M.MarkaAd AS brand, U.UrunAd AS name, U.Fiyat AS price, K.KategoriAd AS category, U.ResimUrl AS image
        FROM dbo.Urunler U
        LEFT JOIN dbo.Markalar M ON U.MarkaID = M.MarkaID
        LEFT JOIN dbo.Kategoriler K ON U.KategoriID = K.KategoriID
        WHERE M.MarkaAd = 'Beaulis' AND U.ResimUrl IS NOT NULL AND U.ResimUrl != '' AND U.ResimUrl NOT LIKE '%default%'
        ORDER BY U.UrunID ASC
      ) B
      UNION ALL
      SELECT * FROM (
        SELECT TOP 1 U.UrunID AS id, M.MarkaAd AS brand, U.UrunAd AS name, U.Fiyat AS price, K.KategoriAd AS category, U.ResimUrl AS image
        FROM dbo.Urunler U
        LEFT JOIN dbo.Markalar M ON U.MarkaID = M.MarkaID
        LEFT JOIN dbo.Kategoriler K ON U.KategoriID = K.KategoriID
        WHERE M.MarkaAd = 'LYKD' AND U.ResimUrl IS NOT NULL AND U.ResimUrl != '' AND U.ResimUrl NOT LIKE '%default%'
        ORDER BY U.UrunID ASC
      ) L
      UNION ALL
      SELECT * FROM (
        SELECT TOP 1 U.UrunID AS id, M.MarkaAd AS brand, U.UrunAd AS name, U.Fiyat AS price, K.KategoriAd AS category, U.ResimUrl AS image
        FROM dbo.Urunler U
        LEFT JOIN dbo.Markalar M ON U.MarkaID = M.MarkaID
        LEFT JOIN dbo.Kategoriler K ON U.KategoriID = K.KategoriID
        WHERE M.MarkaAd = 'Nivea' AND U.ResimUrl IS NOT NULL AND U.ResimUrl != '' AND U.ResimUrl NOT LIKE '%default%'
        ORDER BY U.UrunID ASC
      ) N
      UNION ALL
      SELECT * FROM (
        SELECT TOP 1 U.UrunID AS id, M.MarkaAd AS brand, U.UrunAd AS name, U.Fiyat AS price, K.KategoriAd AS category, U.ResimUrl AS image
        FROM dbo.Urunler U
        LEFT JOIN dbo.Markalar M ON U.MarkaID = M.MarkaID
        LEFT JOIN dbo.Kategoriler K ON U.KategoriID = K.KategoriID
        WHERE M.MarkaAd = 'Pantene' AND U.ResimUrl IS NOT NULL AND U.ResimUrl != '' AND U.ResimUrl NOT LIKE '%default%'
        ORDER BY U.UrunID ASC
      ) P
      UNION ALL
      SELECT * FROM (
        SELECT TOP 1 U.UrunID AS id, M.MarkaAd AS brand, U.UrunAd AS name, U.Fiyat AS price, K.KategoriAd AS category, U.ResimUrl AS image
        FROM dbo.Urunler U
        LEFT JOIN dbo.Markalar M ON U.MarkaID = M.MarkaID
        LEFT JOIN dbo.Kategoriler K ON U.KategoriID = K.KategoriID
        WHERE M.MarkaAd = 'Benri' AND U.ResimUrl IS NOT NULL AND U.ResimUrl != '' AND U.ResimUrl NOT LIKE '%default%'
        ORDER BY U.UrunID ASC
      ) BE
    `);
    
    console.log("--- CANDIDATES ---");
    result.recordset.forEach(p => {
      console.log(`ID: ${p.id} | Brand: ${p.brand} | Name: ${p.name} | Cat: ${p.category} | Img: ${p.image} | Price: ${p.price}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

findCandidates();
