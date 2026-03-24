import { DOMParser } from 'npm:@xmldom/xmldom@0.8.5';

// Simple XML -> JSON converter
function xmlToJson(node: any): any {
  // element
  if (node.nodeType === 1) {
    const obj: any = {};
    // attributes
    if (node.attributes && node.attributes.length > 0) {
      obj['@attributes'] = {};
      for (let i = 0; i < node.attributes.length; i++) {
        const attribute = node.attributes.item(i);
        obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
      }
    }
    // child nodes
    if (node.childNodes && node.childNodes.length > 0) {
      for (let i = 0; i < node.childNodes.length; i++) {
        const item = node.childNodes.item(i);
        if (item.nodeType === 3) { // text
          const text = item.nodeValue.trim();
          if (text) return text;
        } else {
          const nodeName = item.nodeName;
          const child = xmlToJson(item);
          if (obj[nodeName] === undefined) {
            obj[nodeName] = child;
          } else {
            if (!Array.isArray(obj[nodeName])) obj[nodeName] = [obj[nodeName]];
            obj[nodeName].push(child);
          }
        }
      }
    }
    return obj;
  }
  // text
  if (node.nodeType === 3) return node.nodeValue;
  return null;
}

const TARGET = 'https://www.hamqsl.com/solarxml.php';

Deno.serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    // forward query params
    const params = url.searchParams.toString();
    const fetchUrl = params ? `${TARGET}?${params}` : TARGET;

    const cacheControl = 'public, max-age=60'; // 1 minute

    const r = await fetch(fetchUrl, { method: 'GET', headers: { 'Accept': 'application/xml' } });
    if (!r.ok) {
      return new Response(JSON.stringify({ error: 'Upstream fetch failed', status: r.status }), { status: 502, headers: { 'Content-Type': 'application/json' } });
    }

    const text = await r.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'application/xml');
    const json = xmlToJson(doc);

    return new Response(JSON.stringify(json), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': cacheControl,
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
