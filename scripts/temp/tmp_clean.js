const sql = require('mssql/msnodesqlv8');
const dbConfig = { 
  server: 'DESKTOP-HO38PT5\\SQLEXPRESS', 
  database: 'ParlayanKozmetik.com', 
  driver: 'ODBC Driver 17 for SQL Server', 
  options: { trustedConnection: true, trustServerCertificate: true } 
}; 

sql.connect(dbConfig).then(pool => {
  return pool.request().query("UPDATE dbo.Urunler SET ResimUrl = NULL WHERE ResimUrl LIKE '%/Image/get/%' OR ResimUrl LIKE '%HfvJ7lMkPR%' OR ResimUrl LIKE '%dPEIbU6AmL%' OR ResimUrl LIKE '%QhKaehav1x%'");
}).then(res => { 
  console.log('Temizlendi: ' + res.rowsAffected); 
  process.exit(0); 
});
