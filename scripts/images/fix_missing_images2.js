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
  {id: 13, url: 'https://cdn.dsmcdn.com/mnresize/1200/1800/ty157/product/media/images/20210815/19/118318287/223700085/1/1_org_zoom.jpg'},
  {id: 60, url: 'https://cdn.dsmcdn.com/mnresize/1200/1800/ty1019/product/media/images/prod/SPM/ty1018/20231016/16/be1541cb-63df-3d60-afb6-0e1ce39fe9d2/1_org_zoom.jpg'},
  {id: 61, url: 'https://cdn.dsmcdn.com/mnresize/1200/1800/ty1019/product/media/images/prod/SPM/ty1018/20231016/16/be1541cb-63df-3d60-afb6-0e1ce39fe9d2/1_org_zoom.jpg'},
  {id: 62, url: 'https://cdn.dsmcdn.com/mnresize/1200/1800/ty1019/product/media/images/prod/SPM/ty1018/20231016/16/be1541cb-63df-3d60-afb6-0e1ce39fe9d2/1_org_zoom.jpg'},
  {id: 63, url: 'https://cdn.dsmcdn.com/mnresize/1200/1800/ty1019/product/media/images/prod/SPM/ty1018/20231016/16/be1541cb-63df-3d60-afb6-0e1ce39fe9d2/1_org_zoom.jpg'},
  {id: 100, url: 'https://cdn.dsmcdn.com/mnresize/1200/1800/ty124/product/media/images/20210603/10/95000570/171545688/1/1_org_zoom.jpg'},
  {id: 167, url: 'https://cdn.dsmcdn.com/mnresize/1200/1800/ty97/product/media/images/20210403/23/fc64f8ca/60076211/1/1_org_zoom.jpg'},
  {id: 168, url: 'https://cdn.dsmcdn.com/mnresize/1200/1800/ty97/product/media/images/20210403/23/fc64f8ca/60076211/1/1_org_zoom.jpg'},
  {id: 171, url: 'https://cdn.dsmcdn.com/mnresize/1200/1800/ty97/product/media/images/20210403/23/fc64f8ca/60076211/1/1_org_zoom.jpg'},
  {id: 172, url: 'https://cdn.dsmcdn.com/mnresize/1200/1800/ty97/product/media/images/20210403/23/fc64f8ca/60076211/1/1_org_zoom.jpg'}
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
