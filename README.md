# まどアルバム

フロントエンドは `frontend/` を作業ディレクトリとして使います。ルート直下の旧Vite JavaScript構成は残してあり、4人で整理方針を決めるまで変更していません。チームで `frontend/` を正式な構成にすることを確認したら、旧構成の削除と、佐藤さんによる `frontend/package-lock.json` の作成を行ってください。

## 開発環境

- Node.js 20.19+ または 22.12+
- npm

## 初回セットアップ

ロックファイルが用意されたら、各メンバーは次のコマンドで依存関係を再現します。ロックファイルの作成・更新は佐藤さんが担当します。

```sh
cd frontend
npm ci
```

開発サーバーを起動します。`--host 0.0.0.0` を指定しているため、同じWi-Fi内のスマートフォンからも開けます。

```sh
npm run dev
```

ターミナルに表示されるNetwork URLをスマートフォンで開いてください。

## ビルドとlint

```sh
cd frontend
npm run build
npm run lint
```

## Supabase環境変数

`frontend/.env.example` を `frontend/.env.local` にコピーし、SupabaseのProject URLとanon keyを記入してください。フロントエンドとホスティングに設定するのは公開用のanon keyだけです。`service_role` keyは絶対に設定しないでください。`.env.local` はGit管理対象外です。

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Vercelへの公開

1. GitHubのリポジトリをVercelにImportし、Root Directoryを `frontend` に設定します。
2. `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` をPreview / Production環境に登録します。anon keyのみを使い、service_role keyは登録しません。
3. `main` ブランチをProduction Branchに設定します。以降、`main` へのマージで自動デプロイされます。
4. 発行されたHTTPS URLをスマートフォンで開き、各画面間を移動できることを確認します。

`frontend/vercel.json` はReact Routerの各URLをアプリにフォールバックさせます。Vercelプロジェクトへの接続、環境変数の登録、実際の公開URL発行には、チームのVercelアカウントとSupabaseの値が必要です。

## 画面URL

- `/` ホーム
- `/rooms/:roomId/invite` 招待
- `/rooms/:roomId` アルバム
- `/rooms/:roomId/photos/:photoId` 写真詳細
- `/expired` 期限切れ

現在は画面遷移を確認するための空画面です。アルバムから招待・写真詳細へ移動でき、各ページから戻れます。
