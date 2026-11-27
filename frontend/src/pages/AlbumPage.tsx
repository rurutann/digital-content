import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PhotoGrid from '../features/photos/components/PhotoGrid'
import UploadPanel from '../features/photos/components/UploadPanel'
import { addDemoPhotos } from '../features/photos/demoPhotos'
import { usePhotos } from '../features/photos/hooks/usePhotos'
import type { Photo } from '../features/photos/types'

export default function AlbumPage() {
  const { roomId = 'demo' } = useParams()
  const navigate = useNavigate()
  const { photos, isLoading, error, reload } = usePhotos(roomId)
  const [notice, setNotice] = useState('')

  function handleFilesSelected(files: File[]) {
    const newPhotos = files.map((file): Photo => {
      const url = URL.createObjectURL(file)
      return {
        id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        thumbnailUrl: url,
        displayUrl: url,
        alt: file.name,
        mimeType: file.type,
        createdAt: new Date().toISOString(),
      }
    })
    addDemoPhotos(newPhotos)
    reload()
    setNotice('選んだ写真をこのブラウザー内の一覧に追加しました。共有先にはまだ送信されていません。')
  }

  return <main className="page"><header className="topbar"><Link to="/" className="wordmark" aria-label="トップページへ"><img className="brand-image" src="/ICHiE-logo-page-bg.png" alt="CHIE" /></Link><span className="avatar">A</span></header>
    <section className="album-heading"><p className="eyebrow">みんなのアルバム</p><h1>思い出アルバム</h1><p className="muted">{photos.length}枚の写真</p></section>
    <div className="album-actions">
      <Link className="button button--secondary" to={`/rooms/${encodeURIComponent(roomId)}/invite`}>友だちを招待</Link>
      <UploadPanel onFilesSelected={handleFilesSelected} />
    </div>
    {notice && <p className="demo-upload-notice" role="status">{notice}</p>}
    <PhotoGrid
      photos={photos}
      isLoading={isLoading}
      error={error}
      onRetry={reload}
      onPhotoClick={(photoId) => navigate(`/rooms/${encodeURIComponent(roomId)}/photos/${encodeURIComponent(photoId)}`)}
    />
  </main>
}
