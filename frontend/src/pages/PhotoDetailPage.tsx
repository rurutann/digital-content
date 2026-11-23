import { Link, useParams } from 'react-router-dom'

export default function PhotoDetailPage() {
  const { roomId = 'sample', photoId = 'sample-photo' } = useParams()

  return <main className="page">
    <header className="topbar"><Link className="wordmark" to="/">CHIE</Link></header>
    <section className="photo-detail">
      <p className="eyebrow">写真詳細</p>
      <h1>写真の詳細画面</h1>
      <div className="photo-placeholder">写真を表示する場所</div>
      <p className="muted">写真ID: {photoId}</p>
      <Link className="button button--secondary" to={`/rooms/${encodeURIComponent(roomId)}`}>アルバムへ戻る</Link>
    </section>
  </main>
}
