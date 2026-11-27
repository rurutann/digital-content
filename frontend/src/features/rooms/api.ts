export type CreatedRoom = {
  roomId: string
  expiresAt: string
}

/** Temporary UI contract until the real room API is implemented in T03. */
export async function createRoom(): Promise<CreatedRoom> {
  return {
    roomId: '00000000-0000-4000-8000-000000000001',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }
}
