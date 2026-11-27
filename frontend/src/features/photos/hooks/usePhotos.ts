import { useCallback, useState } from 'react'
import { getDemoPhotos } from '../demoPhotos'
import type { Photo } from '../types'

/** Local demo hook. Replace its data source with A02's photo API when available. */
export function usePhotos(_roomId: string) {
  void _roomId
  const [photos, setPhotos] = useState<Photo[]>(getDemoPhotos)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(() => {
    setIsLoading(true)
    try {
      setPhotos(getDemoPhotos())
      setError(null)
    } catch {
      setError('写真を読み込めませんでした。')
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { photos, isLoading, error, reload }
}
