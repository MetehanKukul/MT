const sql = require('mssql/msnodesqlv8');
const dbConfig = {
  server: 'DESKTOP-HO38PT5\\SQLEXPRESS',
  database: 'ParlayanKozmetik.com',
  driver: 'ODBC Driver 17 for SQL Server',
  options: {
    trustedConnection: true,
    trustServerCertificate: true,
  },
};

(async () => {
  const pool = await sql.connect(dbConfig);
  // Clear all the old search-icon URLs
  await pool.request().query("UPDATE dbo.Urunler SET ResimUrl = NULL WHERE ResimUrl LIKE '%search-icon%'");
  const result = await pool.request().query("SELECT COUNT(*) AS cnt FROM dbo.Urunler WHERE ResimUrl IS NULL OR ResimUrl = ''");
  console.log('Total products needing images:', result.recordset[0].cnt);
  await pool.close();
})();
