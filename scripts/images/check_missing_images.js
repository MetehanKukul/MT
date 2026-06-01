const sql = require('mssql/msnodesqlv8');

const config = {
  server: 'DESKTOP-HO38PT5\\SQLEXPRESS',
  database: 'ParlayanKozmetik.com',
  driver: 'ODBC Driver 17 for SQL Server',
  options: {
    trustedConnection: true,
    trustServerCertificate: true
  }
};

(async () => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT UrunID, UrunAd, ResimUrl 
      FROM Urunler 
      WHERE ResimUrl IS NULL 
         OR LTRIM(RTRIM(ResimUrl)) = '' 
         OR ResimUrl = 'null' 
         OR ResimUrl LIKE '%placeholder%'
         OR ResimUrl LIKE '%default.png%'
    `);
    console.log(JSON.stringify(result.recordset, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
