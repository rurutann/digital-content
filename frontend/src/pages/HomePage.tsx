import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import LoadingIndicator from '../components/LoadingIndicator'
import { createRoom } from '../features/rooms/api'

export default function HomePage() {
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  async function handleCreateRoom() {
    setCreating(true)
    setError('')
    try {
      const room = await createRoom()
      navigate(`/rooms/${encodeURIComponent(room.roomId)}/invite`)
    } catch {
      setError('ルームを作成できませんでした。通信を確認して、もう一度お試しください。')
    } finally {
      setCreating(false)
    }
  }

  return <main className="page page--center"><section className="card welcome">
    <img className="brand-image brand-image--hero" src="/ICHiE-logo-cropped.png" alt="CHIE" />
    <p className="muted">写真を持ち寄って、かんたんに共有。</p>
    <Button onClick={handleCreateRoom} disabled={creating}>
      {creating ? 'アルバムを作成中…' : 'アルバムを作る'}
    </Button>
    {creating && <LoadingIndicator label="招待画面を準備しています" />}
    {error && <p className="form-error" role="alert">{error}</p>}
    <p className="demo-note">現在は画面確認用の仮ルームです</p>
  </section></main>
}
