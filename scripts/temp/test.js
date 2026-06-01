async function run() {
    const r = await fetch('https://www.gratis.com/arama?q=Benri', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const text = await r.text();
    const jsonMatch = text.match(/<script id=\"__NEXT_DATA__\" type=\"application\/json\">(.+?)<\/script>/);
    if(jsonMatch) {
        const data = JSON.parse(jsonMatch[1]);
        console.log(Object.keys(data));
        console.log(data.props.pageProps?.initialState?.search);
    } else {
        console.log("No NEXT_DATA");
        // write to file to inspect
        require('fs').writeFileSync('gratis_out.html', text);
    }
}
run();