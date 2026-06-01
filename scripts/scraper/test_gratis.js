async function search() {
    try {
        const query = encodeURIComponent("Beautify It BB Krem - 130 Porcelain gratis");
        const res = await fetch('https://www.google.com/search?tbm=isch&q=' + query, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        });
        const text = await res.text();
        const urls = text.match(/https:\/\/encrypted-tbn0\.gstatic\.com\/images\?q=tbn:[^&"']+/g);
        console.log(urls ? urls.slice(0, 5) : 'None');
    } catch(e) { console.error(e); }
}
search();
