import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const sitemap = await readFile('dist/sitemap.xml', 'utf8');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
assert.equal(urls.length, 8, 'Expected homepage, FAQ and six guides');
assert.equal(new Set(urls).size, urls.length, 'Sitemap URLs must be unique');
const titles = new Set();
const descriptions = new Set();
const config = JSON.parse(await readFile('vercel.json', 'utf8'));
for (const url of urls) {
  const pathname = new URL(url).pathname;
  const html = await readFile(path.join('dist', pathname, 'index.html'), 'utf8');
  assert.equal([...html.matchAll(/<h1(?:\s|>)/g)].length, 1, `${pathname}: one H1`);
  assert.equal([...html.matchAll(/rel="canonical"/g)].length, 1, `${pathname}: one canonical`);
  assert.ok(html.includes(`rel="canonical" href="${url}"`), `${pathname}: self canonical`);
  const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
  const description = html.match(/name="description" content="([^"]*)"/)?.[1];
  assert.ok(title && description, `${pathname}: metadata present`);
  assert.ok(!titles.has(title) && !descriptions.has(description), `${pathname}: unique metadata`);
  titles.add(title);
  descriptions.add(description);
  assert.ok(html.includes(`property="og:url" content="${url}"`), `${pathname}: social URL`);
  assert.ok(html.includes('type="module"'), `${pathname}: interactive app entry retained`);
  assert.ok(!html.includes('SearchAction'), `${pathname}: no nonexistent search feature`);
  assert.ok(!html.includes('Đang tải nội dung…'), `${pathname}: lazy content fully rendered`);
  assert.ok(!html.includes('input để crawler'), `${pathname}: reader-facing content`);
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)]
    .flatMap((match) => { const value = JSON.parse(match[1]); return Array.isArray(value) ? value : [value]; });
  assert.equal(schemas.filter((item) => item['@type'] === 'WebSite').length, 1, `${pathname}: no duplicate website schema`);
  if (pathname.startsWith('/huong-dan/')) {
    const article = schemas.find((item) => item['@type'] === 'TechArticle');
    assert.equal(article?.url, url, `${pathname}: article schema URL`);
    assert.ok(html.includes('Hướng dẫn liên quan'), `${pathname}: related links`);
  }
  if (pathname === '/faq') assert.ok(schemas.some((item) => item['@type'] === 'FAQPage'));
  for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    const href = match[1];
    if (href.startsWith('/') && !href.startsWith('//')) {
      assert.ok(urls.includes(new URL(href, url).href), `${pathname}: broken internal link ${href}`);
    }
  }
  if (pathname !== '/') {
    assert.ok(config.rewrites.some((rewrite) => rewrite.source === pathname && rewrite.destination === `${pathname}/index.html`), `${pathname}: server route matches static output`);
    assert.ok(config.redirects.some((redirect) => redirect.source === `${pathname}/index.html` && redirect.destination === pathname && redirect.permanent), `${pathname}: index.html alias redirects to canonical`);
  } else {
    for (const destination of urls.slice(1)) {
      assert.ok(html.includes(`href="${new URL(destination).pathname}"`), `Homepage links to ${destination}`);
    }
    assert.ok(html.includes('<form'), 'Homepage includes real calculator form');
  }
}
assert.ok(config.rewrites.every((rewrite) => urls.includes(new URL(rewrite.source, urls[0]).href)), 'No catch-all rewrite for missing URLs');
assert.ok(config.redirects.some((redirect) => redirect.source === '/index.html' && redirect.destination === '/'), 'Homepage alias redirects to canonical');
const missing = await readFile('dist/404.html', 'utf8');
assert.ok(missing.includes('content="noindex"') && !missing.includes('id="root"'), 'Real 404 does not mount homepage');
console.log(`SEO checks passed for ${urls.length} pages: static content, metadata, schemas, links and routing.`);
