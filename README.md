# input-extremes-layout-check

極端な入力(タイトルの文字数・本文の行数・画像の高さ)を 1 項目ずつ流し込み、
レイアウトが崩れ始める値を二分探索で測る Playwright スクリプト。

```bash
npm i playwright@1.56.1
node probe.mjs
```

Chromium を指定する場合は `CHROMIUM=/path/to/chrome node probe.mjs`。
