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

async function checkProduct() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query("SELECT DISTINCT ResimUrl FROM Urunler WHERE ResimUrl IS NOT NULL");
    console.log(result.recordset);
    process.exit(0);
  } catch (err) {
    console.error("Veritabanı hatası:", err.message);
    process.exit(1);
  }
}

checkProduct();