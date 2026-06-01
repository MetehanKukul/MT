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
  await pool.request().query("UPDATE dbo.Urunler SET ResimUrl = NULL");
  const result = await pool.request().query("SELECT COUNT(*) AS cnt FROM dbo.Urunler WHERE ResimUrl IS NULL OR ResimUrl = ''");
  console.log('✓ All images removed. Products without images:', result.recordset[0].cnt);
  await pool.close();
})();
