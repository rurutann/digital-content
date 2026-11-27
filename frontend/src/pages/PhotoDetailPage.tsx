import { useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PhotoViewer from '../features/photos/components/PhotoViewer'
import { getDemoPhotos } from '../features/photos/demoPhotos'

export default function PhotoDetailPage() {
  const { roomId = 'demo', photoId = 'demo-photo' } = useParams()
  const navigate = useNavigate()
  const photos = getDemoPhotos()
  const albumPath = `/rooms/${encodeURIComponent(roomId)}`
  const handleClose = useCallback(() => navigate(albumPath), [albumPath, navigate])
  const handleNavigate = useCallback((nextPhotoId: string) => {
    navigate(`${albumPath}/photos/${encodeURIComponent(nextPhotoId)}`, { replace: true })
  }, [albumPath, navigate])

  return <main className="photo-detail-page">
    <PhotoViewer key={photoId} photos={photos} photoId={photoId} onClose={handleClose} onNavigate={handleNavigate} />
  </main>
}
