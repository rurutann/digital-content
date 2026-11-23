import { Link } from 'react-router-dom'

export default function ExpiredRoomPage() {
  return <main className="page page--center">
    <section className="card expired-card">
      <p className="eyebrow">アルバム</p>
      <h1>公開期限が終了しました</h1>
      <p className="muted">このアルバムは公開期限が終了しています。</p>
      <Link className="button button--secondary" to="/">トップへ戻る</Link>
    </section>
  </main>
}
