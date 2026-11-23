import { Link, useParams } from 'react-router-dom'

export default function PhotoDetailPage() {
  const { roomId = 'demo', photoId = 'demo-photo' } = useParams()
  return <main className="page"><header className="topbar"><Link to={`/rooms/${roomId}`} className="wordmark">← アルバムへ戻る</Link></header>
    <section className="photo-detail"><div className="photo-placeholder"><span>写真プレビュー</span></div><h1>写真の詳細</h1><p className="muted">写真 ID: {photoId}</p></section>
  </main>
}
