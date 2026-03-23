export async function searchQRZ(callsign: string) {
  if (!callsign) return null;
  callsign = callsign.toUpperCase().trim();

  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent('https://www.qrz.com/db/' + callsign)}`;
    const response = await fetch(proxyUrl);
    const data = await response.json();

    if (data.contents) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, 'text/html');

      // 1. Extract from Title (EA2XXX - Name - ...)
      const chunks = (doc.title || "").split('-').map(c => c.trim());
      if (chunks.length > 1 && !chunks[1].toLowerCase().includes('lookup') && !chunks[1].toLowerCase().includes('qrz')) {
        return chunks[1];
      }

      // 2. Extract from Meta Og:Title
      const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || "";
      if (ogTitle.includes('-')) {
        const p = ogTitle.split('-').map(x => x.trim());
        if (p[1] && !p[1].toLowerCase().includes('lookup') && !p[1].toLowerCase().includes('qrz')) return p[1];
      }

      // 3. Fallback to IDs (ds_name, etc)
      const dsName = (doc.querySelector('#ds_name') as HTMLElement)?.innerText || "";
      const dsCity = (doc.querySelector('#ds_addr2') as HTMLElement)?.innerText || "";
      const dsCountry = (doc.querySelector('#ds_country') as HTMLElement)?.innerText || "";

      if (dsName) {
        return `${dsName}${dsCity ? ' | ' + dsCity : ''}${dsCountry ? ' | ' + dsCountry : ''}`.trim();
      }
    }
  } catch (err) {
    console.error("QRZ Search Error:", err);
  }
  return null;
}
