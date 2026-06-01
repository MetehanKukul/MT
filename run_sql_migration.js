const fs = require('fs');
const sql = require('mssql');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const sqlConfig = {
    user: 'sa',
    password: 'SuperSecret123!',
    server: 'localhost',
    database: 'master',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

const createTablesSql = `
CREATE DATABASE [ParlayanKozmetik];
`;

const createSchemaSql = `
USE [ParlayanKozmetik];

CREATE TABLE [dbo].[Markalar](
	[MarkaID] [int] NOT NULL PRIMARY KEY,
	[MarkaAd] [nvarchar](255) NULL
);

CREATE TABLE [dbo].[Kategoriler](
	[KategoriID] [int] NOT NULL PRIMARY KEY,
	[KategoriAd] [nvarchar](255) NULL,
	[UstKategoriID] [int] NULL
);

CREATE TABLE [dbo].[Urunler](
	[UrunID] [int] NOT NULL PRIMARY KEY,
	[UrunAd] [nvarchar](500) NULL,
	[MarkaID] [int] NULL,
	[Fiyat] [decimal](18, 2) NULL,
	[StokAdet] [int] NULL,
	[Aciklama] [nvarchar](max) NULL,
	[KategoriID] [int] NULL,
	[ana_kategori] [nvarchar](255) NULL,
	[ResimUrl] [nvarchar](max) NULL
);

CREATE TABLE [dbo].[Kullanicilar](
	[KullaniciID] [int] NOT NULL PRIMARY KEY,
	[Ad] [nvarchar](255) NULL,
	[Soyad] [nvarchar](255) NULL,
	[Eposta] [nvarchar](255) NULL,
	[Sifre] [nvarchar](255) NULL,
	[Telefon] [nvarchar](50) NULL,
	[KayitTarihi] [datetime] NULL
);
`;

async function main() {
    let pool;
    try {
        console.log('SQL Server (Docker) bağlanılıyor...');
        pool = await sql.connect(sqlConfig);

        try {
            await pool.request().query('DROP DATABASE IF EXISTS [ParlayanKozmetik]');
        } catch (e) { }

        console.log('Veritabanı oluşturuluyor...');
        await pool.request().query(createTablesSql);

        console.log('Tablolar oluşturuluyor...');
        await pool.request().query(createSchemaSql);

        console.log('IPYNB dosyasından veriler çekiliyor ve SQL e yazılıyor...');
        const raw = fs.readFileSync('./database/parlayankozmetik.ipynb', 'utf8').replace(/^\uFEFF/, '');
        const nb = JSON.parse(raw);

        let batch = [];
        let batchCount = 0;

        for (const cell of nb.cells) {
            if (cell.cell_type === 'code') {
                for (let line of cell.source) {
                    line = line.trim();
                    if (!line.startsWith('INSERT')) continue;

                    // Replace db name
                    line = line.replace('[ParlayanKozmetik.com]', '[ParlayanKozmetik]');
                    batch.push(line);

                    if (batch.length >= 100) {
                        const query = 'USE [ParlayanKozmetik];\n' + batch.join('\n');
                        await pool.request().query(query);
                        batchCount += batch.length;
                        console.log(`${batchCount} satır eklendi...`);
                        batch = [];
                    }
                }
            }
        }

        if (batch.length > 0) {
            const query = 'USE [ParlayanKozmetik];\n' + batch.join('\n');
            await pool.request().query(query);
            batchCount += batch.length;
        }

        console.log(`Toplam ${batchCount} satır başarıyla yerel SQL e eklendi!`);

        // NOW MIGRATE TO MONGODB
        console.log('Yerel SQL den veriler alınıyor...');
        await pool.request().query('USE [ParlayanKozmetik];');

        const brandsRes = await pool.request().query('SELECT * FROM Markalar');
        const catsRes = await pool.request().query('SELECT * FROM Kategoriler');
        const prodsRes = await pool.request().query('SELECT * FROM Urunler');

        const brands = brandsRes.recordset.map(b => ({ id: b.MarkaID, name: b.MarkaAd }));
        const cats = catsRes.recordset.map(c => ({ id: c.KategoriID, name: c.KategoriAd, parentId: c.UstKategoriID }));

        const brandMap = {}; brands.forEach(b => brandMap[b.id] = b.name);
        const catMap = {}; cats.forEach(c => catMap[c.id] = c.name);

        const products = prodsRes.recordset.map(p => ({
            id: p.UrunID,
            name: p.UrunAd,
            brandId: p.MarkaID,
            brand: brandMap[p.MarkaID] || 'Bilinmiyor',
            price: p.Fiyat,
            stock: p.StokAdet,
            description: p.Aciklama,
            categoryId: p.KategoriID,
            category: catMap[p.KategoriID] || 'Tümü',
            mainCategory: p.ana_kategori,
            image: p.ResimUrl
        }));

        console.log(`SQL den çekilen veriler: ${brands.length} Marka, ${cats.length} Kategori, ${products.length} Ürün`);

        // Connect to Mongo
        console.log('MongoDB Atlas a bağlanılıyor...');
        const mongoClient = new MongoClient(process.env.MONGODB_URI);
        await mongoClient.connect();
        const db = mongoClient.db();

        console.log('Atlas veritabanı temizleniyor...');
        await db.collection('brands').deleteMany({});
        await db.collection('categories').deleteMany({});
        await db.collection('products').deleteMany({});

        console.log('Atlas veritabanına aktarılıyor...');
        if (brands.length) await db.collection('brands').insertMany(brands);
        if (cats.length) await db.collection('categories').insertMany(cats);
        if (products.length) await db.collection('products').insertMany(products);

        await mongoClient.close();
        console.log('Mükemmel! Tüm aktarım başarıyla tamamlandı!');

    } catch (err) {
        console.error('Hata:', err);
    } finally {
        if (pool) await pool.close();
    }
}

main();
