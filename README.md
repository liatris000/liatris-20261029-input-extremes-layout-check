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

タイトルが崩れたと判定するのは、`scrollWidth` が `clientWidth`(320px)を超えたときで、`scrollWidth` は右の padding を含まない。macOS(フォントは Hiragino Sans)で測ると、「あ」1 文字の幅は 18px ちょうどだった。17 文字(306px)では左の padding 12px と合わせて 318px で、文字は右の padding に入るが 320px は超えない。18 文字(336px)で初めて超える。記事の「中の幅 296px に 16 文字、17 文字目で溢れる」は、文字が右の padding に入り始める位置を数えている。Chromium 149 と 156 のどちらでも同じ値だった。

## 確かめていない範囲

- 1 項目ずつしか動かしていない。長いタイトルと多い行数が重なったときの相互作用は見ていない
- 記事を書いた環境で 17 文字だった理由は確かめていない。1 文字の幅が 18px より少しでも広いフォント(Linux の既定の日本語フォントなど)なら、17 文字で 320px を超える。その環境のフォントと幅は測っていない

## 記事

https://zenn.dev/liatris/articles/20261029-input-extremes-layout-check

## ライセンス

MIT
