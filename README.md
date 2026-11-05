# 私の商品のタネ診断（by haru7_contents）

6つの質問に答えると、経験から生まれる「商品のタネ」と「私の商品カルテ（ミニ版）」が見られる無料の診断アプリです。
結果は画像（PNG・1080×1350）で保存できます。

- 外部のAI・API・データベース・ログインは使っていません
- 回答はブラウザの中だけで処理され、外には送られません
- 収入や適性を保証するものではありません

## 使う技術
Vite + React + TypeScript / Zen Maru Gothic

## 動かし方（パソコンで確認する）
```bash
npm install
npm run dev
```
表示されたアドレス（例: http://localhost:5173）をブラウザで開きます。
`?sample=1` 〜 `?sample=4` を付けると、回答済みのサンプル結果がすぐ見られます。

## 公開用にまとめる
```bash
npm run build
```
`dist` フォルダができます。中身がそのまま公開用のファイルです。

## 公開のしかた（GitHub + Cloudflare Pages）
1. このフォルダをGitHubのリポジトリにアップロードする
2. Cloudflare Pages で「Gitに接続」を選び、そのリポジトリを選ぶ
3. ビルドコマンド `npm run build` / 出力フォルダ `dist` を指定して保存する

## 文章・デザインを変えたいとき
- 質問と選択肢: `src/questions.ts`
- 結果の文章の組み立て: `src/generate.ts`
- 背景画像に文字を載せる位置: `src/layout.ts`
- 背景画像（差し替えない）: `public/images/future-map-background.png`
