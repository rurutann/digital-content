import { Link, useParams } from 'react-router-dom'
import Button from '../components/Button'

export default function AlbumPage() {
  const { roomId = 'demo' } = useParams()
  return <main className="page"><header className="topbar"><Link to="/" className="wordmark" aria-label="トップページへ"><img className="brand-image" src="/ICHiE-logo-page-bg.png" alt="CHIE" /></Link><span className="avatar">A</span></header>
    <section className="album-heading"><p className="eyebrow">みんなのアルバム</p><h1>思い出アルバム</h1><p className="muted">まだ写真はありません</p></section>
    <div className="album-actions"><Link className="button button--secondary" to={`/rooms/${encodeURIComponent(roomId)}/invite`}>友だちを招待</Link><Button disabled>写真を追加</Button></div>
    <section className="empty-state"><h2>最初の写真を追加しよう</h2><p className="muted">みんなの写真がここに並びます。</p></section>
  </main>
}
