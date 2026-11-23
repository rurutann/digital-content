import { createBrowserRouter } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import InvitePage from '../pages/InvitePage'
import AlbumPage from '../pages/AlbumPage'
import PhotoDetailPage from '../pages/PhotoDetailPage'
import ExpiredRoomPage from '../pages/ExpiredRoomPage'

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/rooms/:roomId/invite', element: <InvitePage /> },
  { path: '/rooms/:roomId', element: <AlbumPage /> },
  { path: '/rooms/:roomId/photos/:photoId', element: <PhotoDetailPage /> },
  { path: '/expired', element: <ExpiredRoomPage /> },
  { path: '*', element: <main className="page"><h1>ページが見つかりません</h1><a href="/">トップへ戻る</a></main> },
])
