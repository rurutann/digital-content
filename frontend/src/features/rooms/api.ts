// ルームAPI（docs/api.md 4.1・4.2）
//
// ※ T01の仮実装：固定の値を返します。画面（S02）を先に作るためのものです。
//   本物（supabase.functions.invoke）への差し替えは T03 で行います。
//   関数名・引数・戻り値・エラーは本物と同じにしてあるので、画面側の変更は不要です。

import { ApiError } from './types'
import type { CreateRoomResponse, JoinRoomResponse } from './types'

/** 仮実装で使う固定の部屋ID */
export const MOCK_ROOM_ID = '00000000-0000-4000-8000-000000000001'

/** 仮実装で「期限切れ」を確かめるための部屋ID */
export const MOCK_EXPIRED_ROOM_ID = '00000000-0000-4000-8000-0000000000ee'

const MOCK_DELAY_MS = 500
const ROOM_LIFETIME_MS = 24 * 60 * 60 * 1000
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function mockExpiresAt(): string {
  return new Date(Date.now() + ROOM_LIFETIME_MS).toISOString()
}

/** 部屋を作る。作った人は参加者として登録される */
export async function createRoom(): Promise<CreateRoomResponse> {
  await wait(MOCK_DELAY_MS)
  return { room_id: MOCK_ROOM_ID, expires_at: mockExpiresAt() }
}

/**
 * 部屋に参加する。参加済みでも同じ結果を返す（何度呼んでもよい）。
 * @throws {ApiError} ROOM_NOT_FOUND（形がおかしいIDも含む）、ROOM_EXPIRED
 */
export async function joinRoom(roomId: string): Promise<JoinRoomResponse> {
  await wait(MOCK_DELAY_MS)

  if (!UUID_PATTERN.test(roomId)) {
    throw new ApiError('ROOM_NOT_FOUND', 'ルームが見つかりません')
  }
  if (roomId === MOCK_EXPIRED_ROOM_ID) {
    throw new ApiError('ROOM_EXPIRED', 'このルームは期限切れです')
  }
  return { room_id: roomId, expires_at: mockExpiresAt() }
}
