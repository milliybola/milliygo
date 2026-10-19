import Head from 'next/head'
import FavoritesPage from '@/features/go/pages/FavoritesPage'

export default function Favorites() {
  return (
    <>
      <Head>
        <title>Sevimlilar — MilliyGo</title>
      </Head>
      <FavoritesPage />
    </>
  )
}
