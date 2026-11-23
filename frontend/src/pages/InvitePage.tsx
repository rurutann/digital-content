import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'

export default function InvitePage() {
  const { roomId = 'demo' } = useParams()
  const [copyStatus, setCopyStatus] = useState('')
  const inviteUrl = `${window.location.origin}/rooms/${encodeURIComponent(roomId)}/invite`

  async function copyInviteUrl() {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard API is unavailable')
      await navigator.clipboard.writeText(inviteUrl)
      setCopyStatus('招待URLをコピーしました')
    } catch {
      setCopyStatus('コピーできませんでした。URLを長押ししてコピーしてください')
    }
  }

  return <main className="page"><header className="topbar"><Link to="/" className="wordmark" aria-label="トップページへ"><img className="brand-image" src="/ICHiE-logo-page-bg.png" alt="CHIE" /></Link></header>
    <section className="card invite-card"><p className="eyebrow">アルバムへの招待</p><h1>写真を一緒に楽しもう</h1>
      <p className="muted">QRコードを読み取るか、招待URLを共有してください。</p>
      <div className="qr-panel"><QRCodeSVG value={inviteUrl} size={192} level="M" includeMargin /></div>
      <label className="invite-url-label" htmlFor="invite-url">招待URL</label>
      <div className="invite-url-row">
        <button className="copy-icon-button" type="button" onClick={copyInviteUrl} aria-label="招待URLをコピー" title="招待URLをコピー">
          <svg className="copy-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="8" y="8" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
            <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button>
        <input id="invite-url" className="invite-url" value={inviteUrl} readOnly onFocus={(event) => event.currentTarget.select()} />
      </div>
      {copyStatus && <p className="copy-status" role="status">{copyStatus}</p>}
      <Link className="button button--secondary album-link" to={`/rooms/${encodeURIComponent(roomId)}`}>アルバムを開く</Link>
      <p className="url-hint">QRには現在開いているURLが入ります。別のスマホで試すときは、公開URLかWi-Fi用Network URLでこの画面を開いてください。</p>
      <p className="demo-note">画面確認用の仮ルームです。実際のルーム作成・参加にはT03のAPI接続が必要です。</p>
    </section></main>
}
