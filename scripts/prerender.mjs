import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'vite';

const escapeHtml = (value) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const template = await readFile('dist/index.html', 'utf8');
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { renderPages } = await server.ssrLoadModule('/scripts/render-pages.tsx');
  const pages = await renderPages();
  for (const page of pages) {
    let html = template.replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(page.title)}</title>`)
      .replace(/(<link rel="canonical" href=")[^"]+/, `$1${page.canonicalUrl}`)
      .replace('<div id="root"></div>', `<div id="root">${page.body}</div>`);
    const values = {
      'name="description"': page.description,
      'property="og:title"': page.title,
      'property="og:description"': page.description,
      'property="og:url"': page.canonicalUrl,
      'property="og:type"': page.type === 'article' ? 'article' : 'website',
      'name="twitter:title"': page.title,
      'name="twitter:description"': page.description,
      'name="twitter:url"': page.canonicalUrl,
      'property="zalo:title"': page.title,
      'property="zalo:description"': page.description,
      'property="zalo:url"': page.canonicalUrl,
    };
    for (const [selector, value] of Object.entries(values)) {
      html = html.replace(new RegExp(`(<meta ${selector} content=")[^"]*`), `$1${escapeHtml(value)}`);
    }
    const directory = path.join('dist', page.path);
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, 'index.html'), html);
  }
  // Do not invent modification dates for pages whose publication history is unknown.
  const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    pages.map((page) => `  <url><loc>${escapeHtml(page.canonicalUrl)}</loc>${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}</url>`).join('\n') +
    '\n</urlset>\n';
  await writeFile('dist/sitemap.xml', sitemap);
  await writeFile('dist/404.html', '<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Không tìm thấy trang | Kỹ Thuật Vàng</title></head><body><h1>Không tìm thấy trang</h1><p>Đường dẫn này không có nội dung.</p><a href="/">Mở công cụ tính toán dầm cầu trục</a></body></html>');
  console.log(`Prerendered ${pages.length} SEO pages and generated sitemap.xml / 404.html.`);
} finally {
  await server.close();
}
