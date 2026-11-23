import { Link, useParams } from 'react-router-dom'

export default function AlbumPage() {
  const { roomId = 'sample' } = useParams()
  const encodedRoomId = encodeURIComponent(roomId)

  return <main className="page">
    <header className="topbar"><Link className="wordmark" to="/">CHIE</Link></header>
    <section className="album-heading">
      <p className="eyebrow">アルバム</p>
      <h1>思い出アルバム</h1>
      <p className="muted">アルバム画面の準備ができました。</p>
    </section>
    <nav className="album-actions" aria-label="アルバム画面の移動">
      <Link className="button button--secondary" to={`/rooms/${encodedRoomId}/invite`}>招待画面へ</Link>
      <Link className="button button--primary" to={`/rooms/${encodedRoomId}/photos/sample-photo`}>写真詳細へ</Link>
    </nav>
  </main>
}
