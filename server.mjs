// Optional development preview. Run: node server.mjs
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root = path.dirname(fileURLToPath(import.meta.url));
const files = new Map([['/','index.html'],['/index.html','index.html'],['/styles.css','styles.css'],['/world.css','world.css'],['/app.js','app.js'],['/world.js','world.js'],['/globe.js','globe.js'],['/motion.js','motion.js']]);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp'};
for (const name of ['hero.webp','worlds.webp','rabbit-holes.webp','culture-worlds.webp','earth-red.webp','patek-nautilus.webp','f1-hero.webp','f1-stories.webp']) files.set(`/assets/${name}`,`assets/${name}`);
const server = http.createServer(async (request,response) => {
  const pathname = new URL(request.url,'http://localhost').pathname;
  const file = files.get(pathname);
  if (!file) {response.writeHead(404);response.end('Not found');return;}
  try {
    const data = await readFile(path.join(root,file));
    response.writeHead(200,{'Content-Type':types[path.extname(file)],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"});
    response.end(data);
  } catch {response.writeHead(500);response.end('Unable to load preview');}
});
server.on('error',error => {console.error(`Preview could not start: ${error.code}`);process.exitCode=1;});
server.listen(4173,'127.0.0.1',()=>console.log('HobbyQuest preview: http://127.0.0.1:4173'));

