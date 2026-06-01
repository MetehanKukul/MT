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

async function list() {
  try {
    const pool = await sql.connect(dbConfig);
    const categories = await pool.request().query('SELECT KategoriAd FROM dbo.Kategoriler');
    const brands = await pool.request().query('SELECT MarkaAd FROM dbo.Markalar');
    
    console.log("--- Kategoriler ---");
    categories.recordset.forEach(c => console.log("- " + c.KategoriAd));
    
    console.log("\n--- Markalar ---");
    brands.recordset.forEach(b => console.log("- " + b.MarkaAd));
    
    process.exit(0);
  } catch (err) {
    console.error("Veritabanı hatası:", err.message);
    process.exit(1);
  }
}

list();