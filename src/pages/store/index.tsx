import Head from 'next/head'
import PartnersListPage from '@/features/go/pages/PartnersListPage'
import StorePage from '@/features/go/pages/StorePage'
import { useRouteId } from '@/features/go/lib/route'

/** /store/ — do'konlar ro'yxati; /store/?id=<uuid> — do'kon sahifasi */
export default function StoreRoute() {
  const id = useRouteId('store')
  if (id) return <StorePage />
  return (
    <>
      <Head>
        <title>Do&apos;konlar — MilliyGo</title>
      </Head>
      <PartnersListPage type="SHOP" />
    </>
  )
}
