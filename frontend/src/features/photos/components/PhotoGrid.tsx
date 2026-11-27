import { useState } from 'react'
import type { Photo } from '../types'

type PhotoGridProps = {
  photos: Photo[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  onPhotoClick: (photoId: string) => void
  // Keep the agreed M3 selection contract without implementing selection here.
  selectedIds?: ReadonlySet<string>
  isSelecting?: boolean
  onToggleSelect?: (photoId: string) => void
  onLongPress?: (photoId: string) => void
}

function PhotoTile({ photo, onPhotoClick }: { photo: Photo; onPhotoClick: (photoId: string) => void }) {
  const [imageFailed, setImageFailed] = useState(false)

  return <button
    className="photo-tile"
    type="button"
    aria-label={photo.alt}
    onClick={() => onPhotoClick(photo.id)}
  >
    {imageFailed
      ? <span className="photo-tile__unavailable">この写真は表示できません</span>
      : <img src={photo.thumbnailUrl} alt="" loading="lazy" decoding="async" onError={() => setImageFailed(true)} />}
    <span className="photo-tile__caption">{photo.alt}</span>
  </button>
}

export default function PhotoGrid({ photos, isLoading = false, error = null, onRetry, onPhotoClick }: PhotoGridProps) {
  if (isLoading) {
    return <div className="photo-grid photo-grid--skeleton" aria-label="写真を読み込み中">
      {Array.from({ length: 6 }, (_, index) => <div className="photo-skeleton" key={index} />)}
    </div>
  }

  if (error) {
    return <div className="photo-state photo-state--error" role="alert">
      <p>{error}</p>
      {onRetry && <button className="button button--secondary" type="button" onClick={onRetry}>再読み込み</button>}
    </div>
  }

  if (photos.length === 0) {
    return <div className="photo-state"><h2>まだ写真はありません</h2><p>最初の写真を追加すると、ここに表示されます。</p></div>
  }

  return <div className="photo-grid" aria-label="アルバムの写真">
    {photos.map((photo) => <PhotoTile key={photo.id} photo={photo} onPhotoClick={onPhotoClick} />)}
  </div>
}
