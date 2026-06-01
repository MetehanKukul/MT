const fs = require('fs');
let code = fs.readFileSync('index.js', 'utf8');

const routeStr = `
  } else if (requestUrl.pathname === '/api/users/update' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const pool = await sql.connect(dbConfig);
        const request = pool.request();
        let updateQuery = 'UPDATE dbo.Kullanicilar SET Eposta = @email';
        
        if (payload.name) {
            const parts = payload.name.trim().split(' ');
            let ad = parts[0];
            let soyad = parts.length > 1 ? parts.slice(1).join(' ') : 'Soyad Yok';
            updateQuery += ', Ad = @ad, Soyad = @soyad';
            request.input('ad', sql.NVarChar, ad);
            request.input('soyad', sql.NVarChar, soyad);
        }
        
        // Check if Telefon column exists
        const checkCol = await pool.request().query("SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.Kullanicilar') AND name = 'Telefon'");
        if (checkCol.recordset.length > 0 && payload.phone !== undefined) {
             updateQuery += ', Telefon = @phone';
             request.input('phone', sql.NVarChar, payload.phone);
        }
        
        if (payload.password && payload.password.trim() !== '') {
            updateQuery += ', Sifre = @password';
            request.input('password', sql.NVarChar, payload.password);
        }
        
        updateQuery += ' WHERE KullaniciID = @id';
        request.input('email', sql.NVarChar, payload.email);
        request.input('id', sql.Int, payload.id);
        
        await request.query(updateQuery);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Bilgileriniz başarıyla güncellendi' }));
      } catch (err) {
        console.error('Update hatası:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: 'Sunucu hatası: ' + err.message }));
      }
    });
`;

if (!code.includes('/api/users/update')) {
    const target = "} else if (requestUrl.pathname === '/api/register' && req.method === 'POST') {";
    code = code.replace(target, routeStr + "\n  " + target);
    fs.writeFileSync('index.js', code);
    console.log('Update route added to index.js');
} else {
    console.log('Update route already exists');
}

// Now adding fetch to app.js
let appjs = fs.readFileSync('public/app.js', 'utf8');
const oldSubmitLogic = `          saveState();
          updateUI();
          
          showToast('Bilgileriniz başarıyla güncellendi!');
          
          // Eger sql'e göndermek isterseniz burada bir fetch('/api/users/update', {...}) yazabilirsiniz.`;

const fetchLogic = `          saveState();
          updateUI();
          
          // API request to trigger backend SQL UPDATE
          fetch('/api/users/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  id: currentUser.id,
                  name: currentUser.name,
                  email: currentUser.email,
                  phone: currentUser.phone,
                  password: newPassword
              })
          }).then(res => res.json()).then(data => {
              if (data.success) {
                  showToast('Bilgileriniz başarıyla güncellendi!');
              } else {
                  showToast('Hata: ' + data.message);
              }
          }).catch(err => {
              console.error(err);
              showToast('Sunucu bağlantı hatası oluştu!');
          });`;

if (appjs.includes(oldSubmitLogic)) {
    appjs = appjs.replace(oldSubmitLogic, fetchLogic);
    fs.writeFileSync('public/app.js', appjs);
    console.log('Fetch logic added to app.js');
} else {
    console.log('Fetch logic maybe already added or old pattern not found.');
}
