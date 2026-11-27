import type { Photo } from './types'

const localPhotos: Photo[] = []

export function getDemoPhotos(): Photo[] {
  return [...localPhotos]
}

export function addDemoPhotos(photos: Photo[]): Photo[] {
  localPhotos.unshift(...photos)
  return getDemoPhotos()
}
