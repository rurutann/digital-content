# API仕様（ICHIE MVP）

担当：志鳥（T01） ／ 最終更新：2026-11-20

画面（フロントエンド）とサーバー（Supabase）のやり取りの約束をまとめたものです。
テーブルの中身は [database.md](database.md) を見てください。

**このファイルの変更は志鳥に依頼してください。** 項目に「（案）」「保留」とあるものは、まだ確定していません。

---

## 1. 共通ルール

### 1.1 やり取りの方法

| 種類 | 方法 | 守る仕組み |
|---|---|---|
| **読む**（部屋の情報・写真の一覧） | supabase-js でDBを直接読む | RLS（参加者だけ読める） |
| **書く**（作成・参加・写真の登録・削除・保存用URLの発行） | Edge Function を呼ぶ（`supabase.functions.invoke`） | 関数の中で確認する |
| **写真ファイルを送る** | supabase-js でStorageへ直接送る | Storageのポリシー（K02） |

### 1.2 認証

- 画面を開いたとき、セッションがなければ `supabase.auth.signInAnonymously()` で匿名ユーザーになります（T03）。
- `supabase.functions.invoke` を使うと、ログイン中のトークンが自動で付きます。
- 匿名ユーザーは**ブラウザごとに別人**です。SafariとChromeでは別の投稿者になります。

### 1.3 データの書き方

- 項目名は `snake_case`（例：`room_id`）。画面側のコードでも同じ名前を使います。
- 日時は ISO 8601（UTC）の文字列です（例：`"2026-11-21T04:00:00.000Z"`）。
- サイズはバイト単位の整数です。
- ID（部屋・写真）は UUID の文字列です。

### 1.4 期限の判定

**`現在時刻 > expires_at` なら期限切れ**です（閉まる時刻ちょうどまでは使える）。判定は必ずサーバーの時刻で行います。

---

## 2. エラー

### 2.1 形

Edge Function が失敗したときは、次の形で返します。

```json
{
  "error": {
    "code": "ROOM_EXPIRED",
    "message": "このルームは期限切れです"
  }
}
```

- 画面の出し分けには **`code` を使ってください。** `message` は確認用で、文言が変わることがあります。

### 2.2 エラーコード一覧

| code | HTTP | どんなとき | 画面での扱い（例） |
|---|---|---|---|
| `UNAUTHENTICATED` | 401 | ログイン（匿名サインイン）できていない | サインインし直して再試行 |
| `NOT_MEMBER` | 403 | 部屋に参加していない | 参加処理をしてから再試行 |
| `FORBIDDEN` | 403 | 他人の写真を削除しようとした | 「自分の写真だけ削除できます」 |
| `ROOM_NOT_FOUND` | 404 | 部屋がない。**部屋IDの形がおかしい場合もこれ** | 期限切れ画面へ |
| `PHOTO_NOT_FOUND` | 404 | 写真がない（削除済みなど） | 一覧を再読み込み |
| `ROOM_EXPIRED` | 410 | 部屋の期限が切れている | 期限切れ画面へ |
| `PHOTO_LIMIT_EXCEEDED` | 409 | 部屋の写真が100枚を超える | 「これ以上投稿できません（100枚まで）」 |
| `STORAGE_LIMIT_EXCEEDED` | 409 | 部屋の合計が500,000,000バイトを超える | 「容量の上限に達しました」 |
| `FILE_TOO_LARGE` | 413 | 1枚が20,000,000バイトを超える | 「20MBまでの写真を選んでください」 |
| `UNSUPPORTED_FORMAT` | 415 | 対応していない形式 | 「JPEG・PNGの写真を選んでください」 |
| `INTERNAL_ERROR` | 500 | 予期しないエラー（DBにつながらない、プログラムの不具合など） | 「時間をおいて再試行してください」 |

- `ROOM_NOT_FOUND` と `ROOM_EXPIRED` は、画面ではどちらも**期限切れ画面**に移動します（自動削除の後は、期限切れの部屋も「ない」扱いになるため）。
---

## 3. 画面のURL

| 画面 | URL |
|---|---|
| トップ | `/` |
| 招待 | `/rooms/:roomId/invite` |
| アルバム | `/rooms/:roomId` |
| 写真詳細 | `/rooms/:roomId/photos/:photoId` |
| 期限切れ | `/expired` |

- `:roomId`・`:photoId` には、部屋・写真のID（UUID）がそのまま入ります。
- **QRコードに入れるURL：アルバム画面の完全なURL**（例：`https://<公開URLのドメイン>/rooms/:roomId`）。企画書の画面設計どおりです。`localhost` で作ったQRはスマホで開けないので、動作確認は公開URLで行ってください。
- **期限切れのとき：** 部屋が期限切れ（`ROOM_EXPIRED`）または見つからない（`ROOM_NOT_FOUND`）場合は、期限切れ画面（`/expired`）へ移動します。
- 佐藤さんと確認済み（S01の実装と一致）。

---

## 4. 機能ごとのAPI

### 4.1 部屋を作る（create-room）— T03（志鳥）

```ts
const { data, error } = await supabase.functions.invoke('create-room', { method: 'POST' })
```

**入力：** なし（ボタン1つで作るため）

**戻り値（201）：**

```json
{
  "room_id": "3f9a2c1e-7b4d-4e8a-9c1f-2b3d4e5f6a7b",
  "expires_at": "2026-11-21T04:00:00.000Z"
}
```

**処理：** 部屋を作り（`expires_at` は作成時刻＋24時間）、作った人を入室名簿に登録します。

- 入力・戻り値は佐藤さんと確認済み（S02の画面で使う形と一致）。

**エラー：** `UNAUTHENTICATED`、`INTERNAL_ERROR`

### 4.2 部屋に参加する（join-room）— T03（志鳥）

```ts
const { data, error } = await supabase.functions.invoke('join-room', {
  body: { room_id: '3f9a2c1e-...' },
})
```

**入力：**

| 項目 | 型 | 説明 |
|---|---|---|
| `room_id` | string（UUID） | URLの `:roomId` |

**戻り値（200）：**

```json
{
  "room_id": "3f9a2c1e-7b4d-4e8a-9c1f-2b3d4e5f6a7b",
  "expires_at": "2026-11-21T04:00:00.000Z"
}
```

**処理：** 入室名簿に登録します。**すでに参加済みなら何もせず、同じ戻り値を返します**（何度呼んでもよい）。

**エラー：** `UNAUTHENTICATED`、`ROOM_NOT_FOUND`、`ROOM_EXPIRED`

- 戻り値は `room_id`・`expires_at` で確定です。画面で追加の情報が必要になったら、志鳥に依頼してください。
- 参加処理は**アルバム画面を開いたとき**に呼びます。結果が `ROOM_EXPIRED`・`ROOM_NOT_FOUND` なら `/expired` へ移動します。
- 注意：招待画面・詳細画面では呼びません。そのため、**参加していない人が詳細画面のURLを直接開くと、写真が見えません**（例：LINEで詳細画面のURLが送られてきた場合）。必要になったら、詳細画面からアルバム画面へ移動させるなどで対応します。

### 4.3 部屋の情報を読む（DBを直接）— T03・T04（志鳥）

```ts
const { data, error } = await supabase
  .from('rooms')
  .select('id, created_at, expires_at')
  .eq('id', roomId)
  .maybeSingle()
```

- 参加者だけが読めます。参加していない・部屋がない場合は `data` が `null` になります（区別できません）。**状態の判定には join-room の結果を使ってください。**

### 4.4 写真の一覧を読む（DBを直接）— A02（雨谷）・T04（志鳥）

```ts
const { data, error } = await supabase
  .from('photos')
  .select('id, room_id, uploader_id, storage_path, thumbnail_path, mime_type, size_bytes, created_at')
  .eq('room_id', roomId)
  .order('created_at', { ascending: true })
```

**戻り値（1件の例）：**

```json
{
  "id": "8b1e4d2a-5c6f-4a7b-8c9d-0e1f2a3b4c5d",
  "room_id": "3f9a2c1e-7b4d-4e8a-9c1f-2b3d4e5f6a7b",
  "uploader_id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
  "storage_path": "3f9a2c1e-7b4d-4e8a-9c1f-2b3d4e5f6a7b/8b1e4d2a-5c6f-4a7b-8c9d-0e1f2a3b4c5d.jpg",
  "thumbnail_path": "3f9a2c1e-7b4d-4e8a-9c1f-2b3d4e5f6a7b/8b1e4d2a-5c6f-4a7b-8c9d-0e1f2a3b4c5d_thumb.jpg",
  "mime_type": "image/jpeg",
  "size_bytes": 3245781,
  "created_at": "2026-11-20T05:12:34.000Z"
}
```

- **自分の写真か：** `uploader_id` と、ログイン中のユーザーID（`(await supabase.auth.getUser()).data.user.id`）が同じなら自分の写真です。削除ボタンの表示に使います（最終的な判定はサーバー）。
#### 表示用の画像URL

Storageは非公開なので、表示には**期限付きURL（署名付きURL）**を使います。**画面側（A02の `usePhotos`）が supabase-js でまとめて作ります。**

```ts
// 有効時間：1時間と部屋の残り時間の短いほう（部屋の期限を超えない）
const ttl = Math.min(3600, Math.floor((new Date(expires_at).getTime() - Date.now()) / 1000))

// 一覧用：縮小画像（なければ元の写真）のURLを1回でまとめて作る
const paths = photos.map((p) => p.thumbnail_path ?? p.storage_path)
const { data, error } = await supabase.storage.from('<バケット名>').createSignedUrls(paths, ttl)
```

| 用途 | 使う画像 | 作るタイミング |
|---|---|---|
| 一覧 | `thumbnail_path`（null なら `storage_path`） | 一覧を読み込んだとき、全員分をまとめて |
| 詳細 | `storage_path`（元の写真） | 開いた写真（＋前後1枚） |

- **期限が切れたら：** 画像の読み込みに失敗したとき、または一覧を読み込み直したときに作り直します。
- **守る仕組み：** Storageのポリシーで、参加者かつ期限内の人だけがURLを作れるようにします（K02。判定はT04・T05の関数）。
- 保存用のURL（4.7）とは別物です。保存用は、ファイル名を付けて期限を厳密に守るため、窓口（download-photos）で作ります。
- `<バケット名>` は K02（斎藤）で決まり次第、置き換えます。

### 4.5 写真を投稿する（2段階）— K02・K05（斎藤）、A02（雨谷）

1枚ずつ、次の順で行います。

```
① 写真IDを作る          photo_id = crypto.randomUUID()
② Storageへ直接送る     パス：{room_id}/{photo_id}.jpg（または .png）
③ 登録を頼む（upload-photo）
     サーバーが確認：参加者か・期限内か・ファイルがあるか・送った本人か・サイズと形式・部屋の上限
     → OK：一覧用の縮小画像を作り、写真の台帳に登録し、部屋の枚数・容量を増やして返す
     → NG：送られたファイルを消して、エラーを返す
```

**③の呼び方（案）：**

```ts
const { data, error } = await supabase.functions.invoke('upload-photo', {
  body: { room_id, photo_id, storage_path },
})
```

**戻り値（201）：** 登録した写真（4.4の1件と同じ形）

**エラー：** `UNAUTHENTICATED`、`NOT_MEMBER`、`ROOM_NOT_FOUND`、`ROOM_EXPIRED`、`PHOTO_LIMIT_EXCEEDED`、`STORAGE_LIMIT_EXCEEDED`、`FILE_TOO_LARGE`、`UNSUPPORTED_FORMAT`

- **再試行：** ②で失敗したら②から、③で失敗したら③だけやり直します（同じ `photo_id` を使う）。
- ②の前に、端末側でも20MB・形式を確認すると、早めにエラーを出せます（補助）。
- ②だけ成功して③が呼ばれなかったファイルは、部屋の自動削除（K06）で一緒に消えます。
- **HEICは、①の前に端末側でJPEGへ変換してから送ります**（A02）。サーバーが受け付けるのはJPEG・PNGだけです。20MBの確認は変換後のファイルで行います。
- ②は、**端末から supabase-js で Storage へ直接送ります。** Storageのポリシーで、参加者だけが自分の部屋のフォルダに送れるようにします（K02）。
- 縮小画像を作れなかった場合も登録は成功させ、`thumbnail_path` を null にします（一覧では元の写真を表示）。
- 保留：バケット名と②のコード例は K02（斎藤）で追記します。

### 4.6 写真を削除する（delete-photo）— K04（斎藤）、A05（雨谷）

```ts
const { data, error } = await supabase.functions.invoke('delete-photo', {
  body: { photo_id },
})
```

**戻り値（200）：** `{ "photo_id": "8b1e4d2a-..." }`

**処理：** 投稿者本人か確認し、元の写真・縮小画像のファイルと台帳の行を消し、部屋の枚数・容量を減らします。

**エラー：** `UNAUTHENTICATED`、`NOT_MEMBER`、`FORBIDDEN`、`PHOTO_NOT_FOUND`、`ROOM_EXPIRED`

### 4.7 保存用のURLをもらう（download-photos）— K03（斎藤）、A04（雨谷）

```ts
const { data, error } = await supabase.functions.invoke('download-photos', {
  body: { room_id, photo_ids: ['8b1e4d2a-...', '...'] },
})
```

**戻り値（200）：**

```json
{
  "items": [
    {
      "photo_id": "8b1e4d2a-5c6f-4a7b-8c9d-0e1f2a3b4c5d",
      "url": "https://...（期限付きURL）",
      "file_name": "ichie_20261120_001.jpg",
      "expires_at": "2026-11-20T06:12:34.000Z"
    }
  ]
}
```

- **写真ごとの期限付きURLのリストを返します。サーバーではZIPを作りません。** まとめ方（共有機能・ZIPなど）は端末側（A04）で決めます。
- URLの期限は、部屋の `expires_at` を超えません。
- 保留：`file_name` の付け方と、1回で受け付ける枚数の上限は A01・K03 で決めます。

**エラー：** `UNAUTHENTICATED`、`NOT_MEMBER`、`ROOM_NOT_FOUND`、`ROOM_EXPIRED`、`PHOTO_NOT_FOUND`

### 4.8 自動削除（cleanup-expired）— K06（斎藤）

Cronから呼ばれる内部処理です。画面からは呼びません。

---

## 5. 保留事項の一覧

| 内容 | 相手 | 関係する節 |
|---|---|---|
| バケット名、縮小画像のファイル名と大きさ | 斎藤 | 4.5、database.md 7 |
| 保存時のファイル名、1回の枚数上限 | 雨谷・斎藤 | 4.7 |

---

## 変更履歴

| 日付 | 内容 |
|---|---|
| 2026-11-20 | 初版（T01） |
