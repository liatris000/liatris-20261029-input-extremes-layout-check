import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const url = pathToFileURL(resolve('sample.html')).href;

// 画像は data URI の SVG で縦横比だけを変える(幅 320 固定、高さを指定)
const svg = (w, h) =>
  'data:image/svg+xml,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#9cf"/></svg>`);

// 1 項目だけ動かす。set(page, n) が入力を流し込む
const axes = {
  title: { unit: '文字', max: 200, set: (p, n) => p.evaluate(n => { document.getElementById('title').textContent = 'あ'.repeat(n); }, n) },
  body: { unit: '行', max: 100, set: (p, n) => p.evaluate(n => { document.getElementById('body').innerHTML = Array(n).fill('行').join('<br>'); }, n) },
  image: { unit: '高さpx', max: 4000, set: (p, n) => p.evaluate(src => { document.getElementById('thumb').src = src; }, svg(320, n)) },
};

// 崩れ判定: 子要素が親の矩形からはみ出す / 兄弟同士が重なる
const measure = (page) => page.evaluate(() => {
  const card = document.getElementById('card').getBoundingClientRect();
  const kids = [...document.getElementById('card').children];
  const rects = kids.map(k => k.getBoundingClientRect());
  const issues = [];
  kids.forEach((k, i) => {
    const r = rects[i];
    if (r.right > card.right + 0.5) issues.push(`overflow-x:${k.id}`);
    if (r.bottom > card.bottom + 0.5) issues.push(`overflow-y:${k.id}`);
    // 本文: テキストが箱より長い
    if (k.scrollHeight > k.clientHeight + 1 && k.id === 'body') issues.push('clip:body');
    if (k.scrollWidth > k.clientWidth + 1 && k.id === 'title') issues.push('clip:title');
  });
  for (let i = 0; i < rects.length; i++)
    for (let j = i + 1; j < rects.length; j++)
      if (rects[i].bottom > rects[j].top + 0.5 && rects[i].top < rects[j].bottom - 0.5
          && rects[i].right > rects[j].left && rects[i].left < rects[j].right
          && rects[i].height > 0 && rects[j].height > 0)
        issues.push(`overlap:${kids[i].id}/${kids[j].id}`);
  return issues;
});

const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const page = await browser.newPage({ viewport: { width: 400, height: 800 } });
await page.goto(url);

const broken = async (axis, n) => {
  await page.goto(url);
  await axes[axis].set(page, n);
  await page.waitForTimeout(50);
  return (await measure(page)).length > 0;
};

for (const [axis, def] of Object.entries(axes)) {
  // 二分探索で「最初に崩れる値」を探す(単調と仮定。1 は OK 前提)
  if (!(await broken(axis, def.max))) { console.log(`${axis}: ${def.max}${def.unit}まででは崩れない`); continue; }
  let lo = 1, hi = def.max;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    (await broken(axis, mid)) ? (hi = mid) : (lo = mid);
  }
  await page.goto(url); await axes[axis].set(page, hi); await page.waitForTimeout(50);
  console.log(`${axis}: ${hi}${def.unit}で崩れ始める (${(await measure(page)).join(', ')})`);
}
await browser.close();
