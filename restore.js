const sql = require('mssql');

const config = {
  user: 'SA',
  password: 'SuperSecret123!',
  server: 'localhost',
  port: 1433,
  database: 'master',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

async function restoreDB() {
  try {
    await sql.connect(config);
    console.log('SQL Server (Docker) bağlantısı başarılı.');

    // 1. Logical file isimlerini al
    const backupPath = '/var/opt/mssql/backup/ParlayanKozmetik.com.bak';
    console.log(`Dosya okunuyor: ${backupPath}`);
    const fileListResult = await sql.query(`RESTORE FILELISTONLY FROM DISK = '${backupPath}'`);
    
    let dataLogicalName = '';
    let logLogicalName = '';

    fileListResult.recordset.forEach(row => {
      if (row.Type === 'D') dataLogicalName = row.LogicalName;
      if (row.Type === 'L') logLogicalName = row.LogicalName;
    });

    console.log(`Logical Data Name: ${dataLogicalName}`);
    console.log(`Logical Log Name: ${logLogicalName}`);

    if (!dataLogicalName || !logLogicalName) {
      throw new Error('Mantıksal dosya isimleri okunamadı.');
    }

    // 2. Veritabanını geri yükle
    console.log('Veritabanı geri yükleniyor (RESTORE DATABASE)...');
    await sql.query(`
      RESTORE DATABASE ParlayanKozmetik
      FROM DISK = '${backupPath}'
      WITH 
        MOVE '${dataLogicalName}' TO '/var/opt/mssql/data/pk.mdf',
        MOVE '${logLogicalName}' TO '/var/opt/mssql/data/pk_log.ldf',
        REPLACE
    `);
    
    console.log('Veritabanı başarıyla geri yüklendi!');
  } catch (err) {
    console.error('Geri yükleme hatası:', err);
  } finally {
    process.exit();
  }
}

restoreDB();
