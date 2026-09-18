#!/usr/bin/env node
// serve.mjs <dir> [preferredPort] — serve a directory statically on the first free port.
// Prints "SERVING <url>" so callers can capture the URL. Ctrl-C to stop.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const dir = process.argv[2] || '.';
const pref = parseInt(process.argv[3] || '8900', 10);
const TYPES = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.mjs':'text/javascript',
  '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg',
  '.webp':'image/webp', '.woff2':'font/woff2', '.glb':'model/gltf-binary', '.gltf':'model/gltf+json' };

const server = http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const file = join(dir, normalize(p).replace(/^(\.\.[/\\])+/, ''));
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end('not found'); }
});

function listen(port, tries = 20) {
  server.once('error', e => {
    if (e.code === 'EADDRINUSE' && tries > 0) listen(port + 1, tries - 1);
    else { console.error(e); process.exit(1); }
  });
  server.listen(port, '127.0.0.1', () => console.log(`SERVING http://localhost:${port}/`)); // loopback only
}
listen(pref);
