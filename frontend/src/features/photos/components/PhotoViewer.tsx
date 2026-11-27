import { useEffect, useRef, useState, type TouchEvent } from 'react'
import type { Photo } from '../types'

type PhotoViewerProps = {
  photos: Photo[]
  photoId: string
  onClose: () => void
  onNavigate: (photoId: string) => void
}

export default function PhotoViewer({ photos, photoId, onClose, onNavigate }: PhotoViewerProps) {
  const index = photos.findIndex((photo) => photo.id === photoId)
  const photo = photos[index]
  const touchStartX = useRef<number | null>(null)
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft' && index > 0) onNavigate(photos[index - 1].id)
      if (event.key === 'ArrowRight' && index < photos.length - 1) onNavigate(photos[index + 1].id)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [index, onClose, onNavigate, photos])

  if (!photo) {
    return <section className="viewer-missing"><p>この写真は見つかりませんでした。</p><button className="button button--secondary" onClick={onClose}>アルバムへ戻る</button></section>
  }

  const previousPhoto = index > 0 ? photos[index - 1] : null
  const nextPhoto = index < photos.length - 1 ? photos[index + 1] : null

  function handleTouchEnd(event: TouchEvent<HTMLElement>) {
    if (touchStartX.current === null) return
    const deltaX = event.changedTouches[0].clientX - touchStartX.current
    if (deltaX > 60 && previousPhoto) onNavigate(previousPhoto.id)
    if (deltaX < -60 && nextPhoto) onNavigate(nextPhoto.id)
    touchStartX.current = null
  }

  return <section className="photo-viewer" aria-label="写真の詳細">
    <header className="photo-viewer__topbar">
      <button className="viewer-close" type="button" onClick={onClose} aria-label="アルバムへ戻る">×</button>
      <span>{index + 1} / {photos.length}</span>
      <span className="photo-viewer__spacer" />
    </header>
    <div className="photo-viewer__stage" onTouchStart={(event) => { touchStartX.current = event.touches[0].clientX }} onTouchEnd={handleTouchEnd}>
      {imageFailed
        ? <div className="photo-unavailable">この端末ではこの画像を表示できません</div>
        : <img className="photo-viewer__image" src={photo.displayUrl} alt={photo.alt} onError={() => setImageFailed(true)} />}
      <button className="viewer-arrow viewer-arrow--left" type="button" onClick={() => previousPhoto && onNavigate(previousPhoto.id)} disabled={!previousPhoto} aria-label="前の写真">‹</button>
      <button className="viewer-arrow viewer-arrow--right" type="button" onClick={() => nextPhoto && onNavigate(nextPhoto.id)} disabled={!nextPhoto} aria-label="次の写真">›</button>
    </div>
    <footer className="photo-viewer__footer"><strong>{photo.alt}</strong><span>{photo.createdAt ? new Date(photo.createdAt).toLocaleString('ja-JP') : ''}</span></footer>
  </section>
}
