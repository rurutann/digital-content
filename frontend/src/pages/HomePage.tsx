import { Link } from 'react-router-dom'

export default function HomePage() {
  return <main className="page page--center">
    <section className="card welcome">
      <p className="eyebrow">CHIE</p>
      <h1>アルバムを作る</h1>
      <p className="muted">写真を共有するためのアルバムを作成します。</p>
      <Link className="button button--primary" to="/rooms/sample/invite">はじめる</Link>
    </section>
  </main>
}
