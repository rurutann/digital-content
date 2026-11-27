# ICHIE / digital-content

## 初回セットアップ

Node.jsとnpmを用意し、リポジトリを取得した後、**ルートの`digital-content`フォルダ**で実行してください。`frontend`フォルダ内ではありません。

```powershell
cd C:\Users\masah\Downloads\digital-content
npm run setup
npm run lint
npm test
```

`cd`のパスは自分が保存した場所に置き換えてください。

`npm run setup`は`npm ci --include=dev`を実行し、コミット済みの`package-lock.json`に従ってVitest・ESLintを含む開発用依存関係をインストールします。ネットワーク接続が必要です。既存の`node_modules`は再作成されます。初回・依存関係変更の取り込み後・ツールが見つからない場合に実行してください。

## 開発コマンド

以下はすべてルートで実行します。

| コマンド | 内容 |
|---|---|
| `npm run setup` | 開発用依存関係を含めてインストール |
| `npm run dev` | 開発サーバー起動 |
| `npm run lint` | ESLintでコード確認 |
| `npm test` | Vitestでテスト実行 |
| `npm run build` | ビルド |

現在はルートの`package.json`と`package-lock.json`で依存関係を管理します。`frontend/package.json`は構成移行用の最小設定で、独立したインストール先ではありません。

## Vitest・ESLintが認識されない場合

「内部コマンドまたは外部コマンドとして認識されていません」と出た場合は、ルートで`npm run setup`が正常終了してから、lint・テストを再実行してください。インストールに失敗した場合は、そのエラーを先に解消します。

VitestとESLintは`devDependencies`に含まれます。`--omit=dev`や`--production`でインストールすると利用できません。グローバルインストールは不要です。

PowerShellで`npm.ps1`の実行が拒否される場合は、同じコマンドの`npm`を`npm.cmd`に置き換えてください。例：`npm.cmd run setup`、`npm.cmd run lint`、`npm.cmd test`。
