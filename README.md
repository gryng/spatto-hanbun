# スパッと半分

投げ上げられた◯をスワイプ（PCはドラッグ）で斬って、だいたい半分なら成功。
切り口は小数点まで計測され、半分に近いほど高得点。3回ミスするまでに何回斬れるかに挑戦するブラウザゲーム。

- 判定は PERFECT / EXCELLENT / GREAT / GOOD / OK / BAD。30:70 より偏ると BAD でミス
- 連続成功でコンボ倍率アップ（最大×2.0）
- ゲームが終わるとナカバ博士が今回のランを講評し、切り口と誤差の記録を表示

## ファイル

- `index.html` … ゲーム本体（GitHub Pages で公開するページ）
- `src.html` … 本体のソース（`<head>` なしの形）。`build.py` で `index.html` を組み立てる
- `build.py` … `python3 build.py src.html [RANK_URL]` で `index.html` を生成
- `gas/Code.gs` … オンラインランキング用の Google Apps Script

## オンラインランキング

`gas/Code.gs` を Google スプレッドシートの Apps Script に貼り付け、ウェブアプリ（実行ユーザー: 自分 / アクセス: 全員）としてデプロイする。
発行された `…/exec` のURLを `python3 build.py src.html <URL>` で `index.html` に設定すると、タイトルとリザルトにランキングのボタンが出る。
URLが空のときはランキング機能ごと非表示になる。

更新時は `python3 build.py src.html https://script.google.com/macros/s/AKfycbxShmrHzQ0qXB2xj8D_g6iNdlPFXMc8PKQAgxXRaTaFSKtx_J6lryU2Lm1mv822WKeQDw/exec` で組み立てる。

## バージョン

タイトル画面に表示。更新のたびに上げる。

- 機能の追加・仕様の変更: 1.x.0
- 小さな修正・微調整: 1.0.x

© Fuch.io
