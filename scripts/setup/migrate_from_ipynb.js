const fs = require('fs');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

function parseNotebook() {
    const raw = fs.readFileSync('./database/parlayankozmetik.ipynb', 'utf8');
    const nb = JSON.parse(raw);
    
    const dbData = {
        brands: [],
        categories: [],
        products: []
    };

    let currentTable = '';

    for (const cell of nb.cells) {
        if (cell.cell_type === 'markdown') {
            const src = cell.source.join('');
            if (src.includes('[Markalar]')) currentTable = 'Markalar';
            else if (src.includes('[Kategoriler]')) currentTable = 'Kategoriler';
            else if (src.includes('[Urunler]')) currentTable = 'Urunler';
            else currentTable = '';
        } else if (cell.cell_type === 'code') {
            for (let line of cell.source) {
                line = line.trim();
                if (!line.startsWith('INSERT')) continue;
                
                try {
                    if (currentTable === 'Markalar') {
                        // INSERT [dbo].[Markalar] ([MarkaID], [MarkaAd]) VALUES (1, N'Beaulis')
                        const match = line.match(/VALUES\s*\(\s*(\d+)\s*,\s*N'(.*?)'\s*\)/);
                        if (match) {
                            dbData.brands.push({ id: parseInt(match[1]), name: match[2].replace(/''/g, "'") });
                        }
                    } else if (currentTable === 'Kategoriler') {
                        // INSERT [dbo].[Kategoriler] ([KategoriID], [KategoriAd], [UstKategoriID]) VALUES (1, N'Ev Temizlik / Hijyen Ürünleri', NULL)
                        const match = line.match(/VALUES\s*\(\s*(\d+)\s*,\s*N'(.*?)'\s*,\s*(NULL|\d+)\s*\)/);
                        if (match) {
                            dbData.categories.push({
                                id: parseInt(match[1]),
                                name: match[2].replace(/''/g, "'"),
                                parentId: match[3] === 'NULL' ? null : parseInt(match[3])
                            });
                        }
                    } else if (currentTable === 'Urunler') {
                        // VALUES (1, N'Beautify It...', 1, CAST(273.28 AS Decimal(18, 2)), 100, N'Beaulis...', 24, N'makyaj', N'https...')
                        
                        // Because description can have commas and N'', we use a regex that handles it carefully or string splitting.
                        // We can extract everything between VALUES ( and )
                        const valsStr = line.substring(line.indexOf('VALUES (') + 8, line.lastIndexOf(')'));
                        
                        // Parse values. This is a bit tricky, let's use eval but safely, or custom split.
                        // To make it easy to parse, let's remove CAST(... AS Decimal(18, 2)) and just keep the number.
                        let cleanVals = valsStr.replace(/CAST\(([\d.]+)\s+AS\s+Decimal\(\d+,\s*\d+\)\)/g, '$1');
                        // remove N prefix for strings
                        cleanVals = cleanVals.replace(/,\s*N'/g, ", '");
                        if (cleanVals.startsWith("N'")) cleanVals = cleanVals.substring(1);
                        
                        // Use a trick to parse comma-separated values with quotes
                        // Evaluate as JS array (we wrap in brackets)
                        // Wait, single quotes in SQL are escaped as '' (two single quotes). In JS, we need \'.
                        cleanVals = cleanVals.replace(/''/g, "\\'");
                        
                        // wrap in []
                        let parsedArray = [];
                        try {
                            // Function constructor is safer than eval, though still executed in same context. But we only have our own data here.
                            parsedArray = new Function(`return [${cleanVals}];`)();
                        } catch (e) {
                            console.error('Line failed parsing:', cleanVals);
                            continue;
                        }
                        
                        if (parsedArray.length >= 9) {
                            dbData.products.push({
                                id: parsedArray[0],
                                name: parsedArray[1],
                                brandId: parsedArray[2],
                                price: parsedArray[3],
                                stock: parsedArray[4],
                                description: parsedArray[5],
                                categoryId: parsedArray[6],
                                mainCategory: parsedArray[7],
                                image: parsedArray[8]
                            });
                        }
                    }
                } catch(e) {
                    console.error('Error processing line', e);
                }
            }
        }
    }
    
    return dbData;
}

async function migrate() {
    console.log('Notebook dosyası okunuyor ve veriler çıkarılıyor...');
    const data = parseNotebook();
    console.log(`Çıkarılan veriler: ${data.brands.length} Marka, ${data.categories.length} Kategori, ${data.products.length} Ürün`);
    
    if (!uri || uri.includes('<db_password>')) {
        console.error('HATA: MONGODB_URI geçersiz veya şifre girilmemiş.');
        return;
    }

    const client = new MongoClient(uri);
    try {
        console.log('MongoDB Atlas\'a bağlanılıyor...');
        await client.connect();
        const db = client.db();

        console.log('Eski veriler temizleniyor...');
        await db.collection('brands').deleteMany({});
        await db.collection('categories').deleteMany({});
        await db.collection('products').deleteMany({});
        
        console.log('Yeni veriler yükleniyor...');
        
        // Markalar
        if (data.brands.length > 0) {
            await db.collection('brands').insertMany(data.brands);
        }
        
        // Kategoriler
        if (data.categories.length > 0) {
            await db.collection('categories').insertMany(data.categories);
        }
        
        // Urunler
        // We want to map brandId and categoryId to their names so the frontend works easily like before.
        // Or the frontend can use the object as is since we rewrote index.js to use what's there.
        // Actually, in index.js we map p.brand, p.category. Let's add them.
        const brandMap = {};
        data.brands.forEach(b => brandMap[b.id] = b.name);
        
        const catMap = {};
        data.categories.forEach(c => catMap[c.id] = c.name);
        
        const enrichedProducts = data.products.map(p => ({
            ...p,
            brand: brandMap[p.brandId] || 'Bilinmiyor',
            category: catMap[p.categoryId] || 'Tümü'
        }));
        
        if (enrichedProducts.length > 0) {
            await db.collection('products').insertMany(enrichedProducts);
        }
        
        console.log('BAŞARILI: Tüm veriler Atlas veritabanına aktarıldı!');

    } catch (err) {
        console.error('Aktarım sırasında hata:', err);
    } finally {
        await client.close();
    }
}

migrate();
