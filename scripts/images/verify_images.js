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
    `);
    
    const records = result.recordset;
    console.log("Total records:", records.length);
    
    // Check for bad formats
    const badFormats = records.filter(r => !r.ResimUrl || (!r.ResimUrl.startsWith('http') && !r.ResimUrl.startsWith('/')));
    if (badFormats.length > 0) {
      console.log("Bad format URLs:", badFormats.length);
      console.log(badFormats.slice(0, 5));
    }
    
    // Check some specific URLs that might be defaults from gratis
    const gratisBanned = records.filter(r => r.ResimUrl && (
      r.ResimUrl.includes('R352rYFRGO') || 
      r.ResimUrl.includes('QhKaehav1x') || 
      r.ResimUrl.includes('dPEIbU6AmL') || 
      r.ResimUrl.includes('HfvJ7lMkPR') ||
      r.ResimUrl.includes('/Image/get/')
    ));
    
    if (gratisBanned.length > 0) {
      console.log("Still contain gratis banned snippets:", gratisBanned.length);
      console.log(gratisBanned.slice(0, 5));
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
