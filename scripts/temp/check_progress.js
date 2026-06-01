const sql = require('mssql/msnodesqlv8');
const dbConfig = {
  server: 'DESKTOP-HO38PT5\\SQLEXPRESS',
  database: 'ParlayanKozmetik.com',
  driver: 'ODBC Driver 17 for SQL Server',
  options: { trustedConnection: true, trustServerCertificate: true },
};

(async () => {
  const pool = await sql.connect(dbConfig);
  const res = await pool.request().query("SELECT COUNT(*) AS cnt FROM dbo.Urunler WHERE ResimUrl IS NOT NULL AND ResimUrl <> '' AND ResimUrl NOT LIKE '%search-icon%'");
  console.log('Real images found:', res.recordset[0].cnt);
  const samples = await pool.request().query("SELECT TOP 3 UrunID, UrunAd, ResimUrl FROM dbo.Urunler WHERE ResimUrl IS NOT NULL AND ResimUrl <> '' AND ResimUrl NOT LIKE '%search-icon%' ORDER BY UrunID DESC");
  console.log('Latest samples:');
  samples.recordset.forEach(r => console.log(`  ${r.UrunID}: ${r.UrunAd.substring(0, 50)} => ${r.ResimUrl.substring(0, 80)}`));
  await pool.close();
})();
