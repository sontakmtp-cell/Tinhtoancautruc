import React from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { PassThrough } from 'node:stream';
import App from '../App';
import '../src/i18n';
import { routeMetadata } from '../src/geo/seo';
import { guideArticles } from '../src/geo/guideContent';

export async function renderPages() {
  const pages = [];
  for (const route of routeMetadata) {
    const body = await new Promise<string>((resolve, reject) => {
      const output = new PassThrough();
      let html = '';
      output.on('data', (chunk) => { html += chunk.toString(); });
      output.on('end', () => resolve(html));
      output.on('error', reject);
      const stream = renderToPipeableStream(<App initialPath={route.path} />, {
        onAllReady() { stream.pipe(output); },
        onError: reject,
      });
    });
    const article = guideArticles.find((item) => item.slug === route.path);
    pages.push({ ...route, body, lastmod: article?.updatedAt });
  }
  return pages;
}
