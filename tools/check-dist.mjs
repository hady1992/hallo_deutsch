import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const distDir = resolve(projectRoot, 'dist');
const assetsDir = resolve(distDir, 'assets');
const indexPath = resolve(distDir, 'index.html');
const htaccessPath = resolve(distDir, '.htaccess');

const fail = (message) => {
  throw new Error(`[check:dist] ${message}`);
};

if (!existsSync(indexPath)) fail('dist/index.html is missing.');
if (!existsSync(assetsDir)) fail('dist/assets is missing.');
if (!existsSync(htaccessPath)) fail('dist/.htaccess is missing.');

const assetFiles = readdirSync(assetsDir, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name);
const jsFiles = assetFiles.filter((file) => /\.(?:js|mjs)$/i.test(file));
const cssFiles = assetFiles.filter((file) => /\.css$/i.test(file));

if (jsFiles.length === 0) fail('dist/assets does not contain a JavaScript file.');
if (cssFiles.length === 0) fail('dist/assets does not contain a CSS file.');

const html = readFileSync(indexPath, 'utf8');
if (/src\s*=\s*["']\/src\//i.test(html)) {
  fail('dist/index.html still points to a source module under /src/.');
}

const referencedAssets = [...html.matchAll(/["'](\/assets\/[^"'#?]+(?:\?[^"'#]*)?)["']/g)]
  .map((match) => match[1].split('?')[0]);

if (referencedAssets.length === 0) fail('dist/index.html does not reference any /assets/ files.');

for (const assetUrl of new Set(referencedAssets)) {
  const relativePath = decodeURIComponent(assetUrl.replace(/^\//, '')).replaceAll('/', sep);
  const assetPath = resolve(distDir, relativePath);
  if (!assetPath.startsWith(`${assetsDir}${sep}`) || !existsSync(assetPath)) {
    fail(`Referenced asset is missing: ${assetUrl}`);
  }
}

const htaccess = readFileSync(htaccessPath, 'utf8');
if (!htaccess.includes('AddType application/javascript .js .mjs')) {
  fail('dist/.htaccess does not define the JavaScript MIME type.');
}
if (!htaccess.includes('RewriteCond %{REQUEST_URI} ^/assets/')) {
  fail('dist/.htaccess does not protect missing assets from the SPA fallback.');
}

console.log('[check:dist] OK');
console.log(`JavaScript: ${jsFiles.join(', ')}`);
console.log(`CSS: ${cssFiles.join(', ')}`);
console.log(`Referenced assets: ${[...new Set(referencedAssets)].join(', ')}`);
