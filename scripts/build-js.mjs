// Minifies every browser script in js/ and js/pages/ into a sibling "<name>.min.js".
// The pages load the .min.js files; the readable sources stay the files you edit.
//
//   npm run build        (CSS + JS)       or       node scripts/build-js.mjs
//
// After editing any js/**/*.js: run the build, then bump the ?v= query string on
// the matching <script> tags (same rule as css/app.css). Output is deterministic.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { minify } from 'terser';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dirs = ['js', 'js/pages'];
let before = 0, after = 0, n = 0;

for (const dir of dirs) {
  for (const name of readdirSync(join(root, dir))) {
    if (!name.endsWith('.js') || name.endsWith('.min.js')) continue;
    const src = readFileSync(join(root, dir, name), 'utf8');
    const out = await minify(src, {
      compress: { passes: 2 },
      mangle: true,
      format: { comments: false },
    });
    const dest = join(root, dir, name.replace(/\.js$/, '.min.js'));
    writeFileSync(dest, out.code + '\n');
    before += Buffer.byteLength(src); after += Buffer.byteLength(out.code); n++;
  }
}
console.log(`${n} scripts minified: ${before.toLocaleString()} -> ${after.toLocaleString()} bytes`);
