-- T01: 基本テーブル（rooms・room_members・photos）
-- 設計の説明は docs/database.md を参照。
-- RLSは有効化だけ行う（ポリシーがないため、端末からは読み書きできない）。
-- ポリシーは T04・T05、Storage は K02、上限の判定は K05 の migration で追加する。

-- 部屋
create table public.rooms (
  id         uuid        primary key default gen_random_uuid(),
  created_by uuid        references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  photo_count integer    not null default 0,
  total_bytes bigint     not null default 0,
  constraint rooms_expires_after_created check (expires_at > created_at),
  constraint rooms_photo_count_range check (photo_count between 0 and 100),
  constraint rooms_total_bytes_range check (total_bytes between 0 and 500000000)
);

comment on table public.rooms is '一時ルーム。expires_at を過ぎたら期限切れ（now() > expires_at）';
comment on column public.rooms.id is 'URLに使う部屋ID（推測されにくいUUID）';
comment on column public.rooms.created_by is '部屋を作った匿名ユーザー（MVPでは記録のみ）';
comment on column public.rooms.expires_at is '閉まる時刻。作成時にサーバーが記録する';
comment on column public.rooms.photo_count is '登録済みの写真の枚数（上限100）。登録時に増やし（K05）、削除時に減らす（K04）';
comment on column public.rooms.total_bytes is '登録済みの元の写真の合計バイト数（上限500,000,000）。更新はphoto_countと同じ';

-- 入室名簿
create table public.room_members (
  room_id   uuid        not null references public.rooms (id) on delete cascade,
  user_id   uuid        not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

comment on table public.room_members is '部屋の参加者。同じ人は1行だけ。作成者も作成時に登録する';

create index room_members_user_id_idx on public.room_members (user_id);

-- 写真の台帳（登録が完了した写真だけが入る）
create table public.photos (
  id           uuid        primary key default gen_random_uuid(),
  room_id      uuid        not null references public.rooms (id) on delete cascade,
  uploader_id  uuid        references auth.users (id) on delete set null,
  storage_path text        not null unique,
  thumbnail_path text      unique,
  mime_type    text        not null,
  size_bytes   bigint      not null,
  created_at   timestamptz not null default now(),
  constraint photos_mime_type_allowed check (mime_type in ('image/jpeg', 'image/png')),
  constraint photos_size_bytes_range check (size_bytes > 0 and size_bytes <= 20000000)
);

comment on table public.photos is '写真の台帳。ファイル本体は Storage の {room_id}/{photo_id}.{拡張子}';
comment on column public.photos.id is '投稿する端末が作るUUID。Storageのパスにも使う';
comment on column public.photos.thumbnail_path is '一覧用の縮小画像の置き場所（サーバーが作成。作成前・失敗時はnull）';
comment on column public.photos.uploader_id is '投稿した匿名ユーザー。自分の写真かの判定に使う';
comment on column public.photos.size_bytes is 'バイト数。1枚20,000,000バイトまで';

create index photos_room_id_created_at_idx on public.photos (room_id, created_at);
create index photos_uploader_id_idx on public.photos (uploader_id);

-- RLSを有効化（ポリシーは T04・T05 で追加する）
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.photos enable row level security;
