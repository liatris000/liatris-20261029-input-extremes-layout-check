# input-extremes-layout-check

極端な入力(タイトルの文字数・本文の行数・画像の高さ)を 1 項目ずつ流し込み、レイアウトが崩れ始める値を二分探索で測る Playwright スクリプト。

記事: https://zenn.dev/liatris/articles/20261029-input-extremes-layout-check

## 前提

- Node.js(22.22.0 と 24.22.1 で確認)
- Playwright 1.56.1(`package-lock.json` で固定)と、Playwright 用の Chromium

## 動かし方

```bash
git clone https://github.com/liatris000/liatris-20261029-input-extremes-layout-check.git
cd liatris-20261029-input-extremes-layout-check
npm ci
npx playwright install chromium   # 初回だけ。Playwright 用のブラウザを取得する
node probe.mjs
```

手元の Chromium を使う場合は `CHROMIUM=/path/to/chrome node probe.mjs`(このときは `npx playwright install chromium` は不要)。

## 期待される出力

```text
title: 18文字で崩れ始める (clip:title)
body: 6行で崩れ始める (clip:body)
image: 199高さpxで崩れ始める (overflow-y:meta)
```

値は `sample.html` の CSS と、表示に使われたフォントで決まる。タイトルの文字数はフォントで 1 文字ずれることがある(記事を書いた環境では 17 文字、この README を書いた環境では 18 文字だった)。

## 確かめていない範囲

- 1 項目ずつしか動かしていない。長いタイトルと多い行数が重なったときの相互作用は見ていない
- タイトルの文字数が環境で 1 文字ずれる原因(フォントの違いと思われる)は、確かめていない

## ライセンス

MIT
