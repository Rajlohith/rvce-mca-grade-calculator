#!/usr/bin/env node
/* ==========================================================================
   scripts/build-css.mjs — regenerates css/app.css from the four source
   files (variables.css, base.css, layout.css, components.css).

   Run this after editing any of those four files:
     node scripts/build-css.mjs

   This project intentionally has no bundler/build step for JS (see the
   CACHE_VERSION comment at the top of sw.js for why), but a plain,
   deterministic text-minifier for the one generated CSS file doesn't
   carry that risk — it's a pure function of the four source files, still
   committed and reviewed as source, and this script is the only thing
   that ever writes css/app.css. Re-run it and commit the result whenever
   a source file changes; remember to also bump the ?v= query string on
   every <link rel="stylesheet" href="css/app.css?v=..."> across the HTML
   pages, and CACHE_VERSION in sw.js, per the project's existing
   cache-busting convention (there are no content-hashed filenames here).

   The minifier below is deliberately conservative: it strips comments
   and collapses whitespace only. It does NOT touch calc() (this project
   doesn't use it), reorder rules, merge selectors, or rename anything —
   so a diff of the source files still tells you exactly what changed.
   ========================================================================== */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCES = ['variables.css', 'base.css', 'layout.css', 'components.css'];

const banner = `/* ==========================================================================
   app.css — generated bundle (variables.css + base.css + layout.css +
   components.css, concatenated and minified). DO NOT EDIT DIRECTLY.

   Source of truth is the four files above; after changing any of them,
   regenerate this bundle with:
     node scripts/build-css.mjs
   ========================================================================== */
`;

function minifyCss(css) {
  return css
    // Strip /* ... */ comments (this file has none inside string values).
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Collapse all runs of whitespace (including newlines) to one space.
    .replace(/\s+/g, ' ')
    // Drop the space on either side of punctuation that never needs it
    // in plain selectors/declarations. '+' is deliberately excluded:
    // this file's journey-track rules now use calc(50% + Npx + Mpx), and
    // calc() requires whitespace around a binary + or - or the whole
    // declaration is invalid CSS (and silently dropped by the browser).
    // Tightening " + " is only ever cosmetic outside calc(), so leaving
    // it alone costs nothing.
    .replace(/\s*([{}:;,>~])\s*/g, '$1')
    // A trailing semicolon right before a closing brace is redundant.
    .replace(/;}/g, '}')
    .trim();
}

const combinedSource = SOURCES
  .map(name => readFileSync(join(ROOT, 'css', name), 'utf8'))
  .join('\n');

const minified = minifyCss(combinedSource);
writeFileSync(join(ROOT, 'css', 'app.css'), banner + minified + '\n');

console.log(`css/app.css regenerated (${minified.length.toLocaleString()} bytes minified, from ${combinedSource.length.toLocaleString()} bytes source).`);
