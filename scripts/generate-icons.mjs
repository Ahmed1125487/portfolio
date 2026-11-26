import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const svg = await readFile(path.join(root, 'public/favicon.svg'), 'utf8');
const browser = process.env.ICON_CDP_URL
  ? await chromium.connectOverCDP(process.env.ICON_CDP_URL)
  : await chromium.launch();

try {
  const context = await browser.newContext({ viewport: { width: 512, height: 512 }, deviceScaleFactor: 1 });
  const page = await context.newPage();

  async function render(markup, size, filename, transparent) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(
      `<!doctype html><html><head><style>html,body{margin:0;width:100%;height:100%;background:transparent;overflow:hidden}svg{display:block;width:${size}px;height:${size}px}</style></head><body>${markup}</body></html>`,
      { waitUntil: 'load' },
    );
    await page.screenshot({
      path: path.join(root, 'public', filename),
      omitBackground: transparent,
      clip: { x: 0, y: 0, width: size, height: size },
    });
  }

  await render(svg, 192, 'icon-192.png', true);
  await render(svg, 512, 'icon-512.png', true);

  const fullBleed = svg
    .replace('rx="14"', 'rx="0"')
    .replace(/\s+stroke="#fff"\s+stroke-opacity="\.12"/, '');

  await render(fullBleed, 180, 'apple-touch-icon.png', false);

  console.log('Generated icon-192.png, icon-512.png, apple-touch-icon.png');
} finally {
  await browser.close();
}
