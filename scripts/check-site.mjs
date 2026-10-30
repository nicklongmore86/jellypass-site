#!/usr/bin/env node
// Checks the promises the pages share, since every page is hand-written HTML with no build step:
// - no script, no inline style or event handler, and nothing loaded from another host (the privacy policy and _headers' CSP);
// - every page has the same footer (TMDB's logo and exact notice, JustWatch's credit, the only contact address)
//   and the same site navigation, apart from which entry is marked current;
// - every docs page has the same sidebar, apart from which entry is marked current, and an "Edit this page" link to its own file;
// - every link to this site points at a file that exists;
// - no deployment's real details appear.
// Run: node scripts/check-site.mjs (Node 18 or later, no dependencies).
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SITE_REPO = 'https://github.com/nicklongmore86/jellypass-site';
const NOTICE = 'This product uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.';
const FORBIDDEN = [/starrgroup/i, /\b10\.172\./, /farmhouse/i, /fearing/i, /davilla/i];

const pages = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.') || name === 'node_modules') continue;
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walk(full);
    else if (name.endsWith('.html')) pages.push(path.relative(ROOT, full));
  }
})(ROOT);

const problems = [];
const fail = (page, message) => problems.push(`${page}: ${message}`);
const block = (html, pattern) => html.match(pattern)?.[0];
const uncurrent = (text) => text?.replace(/ aria-current="page"/g, '');

const reference = readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const footer = block(reference, /<footer class="site-footer">[\s\S]*?<\/footer>/);
const siteNav = uncurrent(block(reference, /<nav class="site-nav"[\s\S]*?<\/nav>/));
const docsReference = readFileSync(path.join(ROOT, 'docs/index.html'), 'utf8');
const docsNav = uncurrent(block(docsReference, /<nav class="docs-nav"[\s\S]*?<\/nav>/));
if (!footer?.includes(NOTICE) || !footer.includes('/tmdb-logo.svg') || !footer.includes('https://www.justwatch.com/')) {
  fail('index.html', 'the footer lacks TMDB\'s notice or logo, or the JustWatch credit');
}

for (const page of pages.sort()) {
  const html = readFileSync(path.join(ROOT, page), 'utf8');
  if (/<script\b/i.test(html)) fail(page, 'has a <script>');
  if (/\sstyle=|\son[a-z]+=/i.test(html)) fail(page, 'has an inline style or event handler');
  if (/<style\b/i.test(html)) fail(page, 'has a <style> element');
  if (/<(form|iframe|object|embed)\b/i.test(html)) fail(page, 'has a form, frame or embed');
  for (const [, attribute, url] of html.matchAll(/<(?:img|link|source|video|audio)\b[^>]*?\s(src|href|srcset)="([^"]*)"/gi)) {
    if (!url.startsWith('/') || url.startsWith('//')) fail(page, `loads ${attribute}="${url}" from outside the site`);
  }
  if (block(html, /<footer class="site-footer">[\s\S]*?<\/footer>/) !== footer) fail(page, 'footer differs from index.html');
  if (uncurrent(block(html, /<nav class="site-nav"[\s\S]*?<\/nav>/)) !== siteNav) fail(page, 'site navigation differs from index.html');
  const mailto = [...html.matchAll(/mailto:([^"?]+)/g)].map((m) => m[1]);
  if (mailto.some((address) => address !== 'support@jellypass.app')) fail(page, `has another contact address: ${mailto.join(', ')}`);
  for (const pattern of FORBIDDEN) if (pattern.test(html)) fail(page, `mentions ${pattern}`);
  if (page.startsWith('docs/')) {
    if (uncurrent(block(html, /<nav class="docs-nav"[\s\S]*?<\/nav>/)) !== docsNav) fail(page, 'docs sidebar differs from docs/index.html');
    if (!html.includes(`href="${SITE_REPO}/edit/main/${page}"`)) fail(page, 'has no "Edit this page on GitHub" link to itself');
    const own = '/' + page.replace(/index\.html$/, '');
    if (!html.includes(`<a href="${own}" aria-current="page">`)) fail(page, 'sidebar does not mark this page current');
  }
  for (const [, href, anchor] of html.matchAll(/\shref="(\/[^"#]*)(?:#([^"]*))?"/g)) {
    if (href.startsWith('//')) continue;
    const target = path.join(ROOT, href.endsWith('/') ? `${href}index.html` : href);
    if (!existsSync(target)) fail(page, `links to ${href}, which does not exist`);
    else if (anchor && !readFileSync(target, 'utf8').includes(`id="${anchor}"`)) fail(page, `links to ${href}#${anchor}, which has no such id`);
  }
  for (const [, id] of html.matchAll(/\shref="#([^"]+)"/g)) {
    if (!html.includes(`id="${id}"`)) fail(page, `links to #${id}, which is not on the page`);
  }
}

if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`${pages.length} pages checked`);
