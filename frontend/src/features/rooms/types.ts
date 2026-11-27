// ルームAPIの型（docs/api.md の 2章・4.1〜4.2 に対応）

/** Edge Function が返すエラーコード（docs/api.md 2.2） */
export type ApiErrorCode =
  | 'UNAUTHENTICATED'
  | 'NOT_MEMBER'
  | 'FORBIDDEN'
  | 'ROOM_NOT_FOUND'
  | 'PHOTO_NOT_FOUND'
  | 'ROOM_EXPIRED'
  | 'PHOTO_LIMIT_EXCEEDED'
  | 'STORAGE_LIMIT_EXCEEDED'
  | 'FILE_TOO_LARGE'
  | 'UNSUPPORTED_FORMAT'
  | 'INTERNAL_ERROR'

/** Edge Function が失敗したときの本文 */
export type ApiErrorBody = {
  error: {
    code: ApiErrorCode
    message: string
  }
}

/** 画面側で受け取るエラー。code で出し分ける */
export class ApiError extends Error {
  readonly code: ApiErrorCode

  constructor(code: ApiErrorCode, message: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

/** create-room の戻り値 */
export type CreateRoomResponse = {
  room_id: string
  /** ISO 8601（UTC） */
  expires_at: string
}

/** join-room の入力 */
export type JoinRoomRequest = {
  room_id: string
}

/** join-room の戻り値 */
export type JoinRoomResponse = {
  room_id: string
  /** ISO 8601（UTC） */
  expires_at: string
}
