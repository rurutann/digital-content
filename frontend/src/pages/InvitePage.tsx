import { Link, useParams } from 'react-router-dom'

export default function InvitePage() {
  const { roomId = 'sample' } = useParams()

  return <main className="page">
    <header className="topbar"><Link className="wordmark" to="/">CHIE</Link></header>
    <section className="card invite-card">
      <p className="eyebrow">招待</p>
      <h1>アルバムに招待する</h1>
      <p className="muted">ここに招待URLとQRコードが表示されます。</p>
      <p className="empty-state__label">ルームID: {roomId}</p>
      <Link className="button button--primary" to={`/rooms/${encodeURIComponent(roomId)}`}>アルバムへ進む</Link>
    </section>
  </main>
}
