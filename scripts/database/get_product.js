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

async function check() {
  try {
    const pool = await sql.connect(dbConfig);
    console.log("--- Grouping Products by Brand ---");
    const resBrands = await pool.request().query(`
      SELECT M.MarkaAd, COUNT(*) as count 
      FROM dbo.Urunler U 
      LEFT JOIN dbo.Markalar M ON U.MarkaID = M.MarkaID 
      GROUP BY M.MarkaAd 
      ORDER BY count DESC
    `);
    console.log(resBrands.recordset);

    console.log("\n--- Sample product name length and patterns ---");
    const resSamples = await pool.request().query(`
      SELECT TOP 10 U.UrunID, M.MarkaAd, U.UrunAd, U.Fiyat 
      FROM dbo.Urunler U 
      LEFT JOIN dbo.Markalar M ON U.MarkaID = M.MarkaID 
      ORDER BY U.UrunID ASC
    `);
    console.log(resSamples.recordset);

    process.exit(0);
  } catch (err) {
    console.error("Database error:", err.message);
    process.exit(1);
  }
}

check();
