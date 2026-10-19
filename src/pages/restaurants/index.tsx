import Head from 'next/head'
import PartnersListPage from '@/features/go/pages/PartnersListPage'

export default function RestaurantsPage() {
  return (
    <>
      <Head>
        <title>Taomlar — MilliyGo</title>
      </Head>
      <PartnersListPage type="RESTAURANT" />
    </>
  )
}
