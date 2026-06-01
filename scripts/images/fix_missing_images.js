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

const updates = [
  {id: 179, url: 'https://cdn.dsmcdn.com/mnresize/1200/1800/ty1570/product/media/images/prod/SPM/ty1568/20241011/17/fe0c6569-faea-3482-a7d0-112354c4ff55/1_org_zoom.jpg'},
  {id: 465, url: 'https://cdn.dsmcdn.com/mnresize/1200/1800/ty97/product/media/images/20210404/00/ceca9c80/60451559/1/1_org_zoom.jpg'},
  {id: 596, url: 'https://cdn.dsmcdn.com/mnresize/1200/1800/ty97/product/media/images/20210404/00/ceca9c80/60451559/1/1_org_zoom.jpg'},
  {id: 1049, url: 'https://cdn.dsmcdn.com/mnresize/1200/1800/ty1113/product/media/images/prod/SPM/ty1113/20231227/15/34ad3557-9dbd-3382-b258-2eb7eb372e61/1_org_zoom.jpg'},
  {id: 1055, url: 'https://cdn.dsmcdn.com/mnresize/1200/1800/ty1115/product/media/images/prod/SPM/ty1114/20231229/11/ad3918a3-9975-39a0-93ae-cff4e1834275/1_org_zoom.jpg'},
  {id: 1067, url: 'https://cdn.dsmcdn.com/mnresize/1200/1800/ty1100/product/media/images/prod/SPM/ty1100/20231215/15/d5b5b9bf-5f93-39d0-bfd1-4cb50c7db2d3/1_org_zoom.jpg'}
];

(async () => {
  try {
    const pool = await sql.connect(config);
    for (const u of updates) {
      await pool.request()
        .input('UrunID', sql.Int, u.id)
        .input('ResimUrl', sql.VarChar(500), u.url)
        .query('UPDATE Urunler SET ResimUrl = @ResimUrl WHERE UrunID = @UrunID');
      console.log('Updated UrunID ' + u.id);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
