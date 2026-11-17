import { useState } from 'react'
import { queryClient } from '@/config/queryClient'
import { normalizeMenu, normalizePartner, unwrap } from '../lib/normalize'
import type { PartnerStaticProps } from '../lib/seoBuild'
import RestaurantPage from '../pages/RestaurantPage'
import StorePage from '../pages/StorePage'
import PartnerSeo from './PartnerSeo'

/**
 * Build vaqtida yaratilgan hamkor sahifasi (/restaurant/<slug>/, /store/<slug>/).
 * Statik HTML'da to'liq SEO (title, description, kanonik havola, schema.org menyu) bo'ladi;
 * build ma'lumotlari keshga "eskirgan" deb yoziladi — sahifa darhol ko'rinadi va
 * yangi narx / ochiq-yopiqlik holati API'dan qayta olinadi.
 */
export default function PrerenderedPartner({
  uuid,
  partnerRaw,
  menuRaw,
  type,
}: PartnerStaticProps & { type: 'RESTAURANT' | 'SHOP' }) {
  const [seed] = useState(() => {
    const partner = normalizePartner(unwrap(partnerRaw))
    const menu = menuRaw ? normalizeMenu(menuRaw) : null
    if (!queryClient.getQueryData(['go', 'partner', uuid])) {
      queryClient.setQueryData(['go', 'partner', uuid], partner, { updatedAt: 0 })
    }
    if (menu && !queryClient.getQueryData(['go', 'menu', uuid])) {
      queryClient.setQueryData(['go', 'menu', uuid], menu, { updatedAt: 0 })
    }
    return { partner, menu }
  })
  return (
    <>
      <PartnerSeo partner={seed.partner} menu={seed.menu?.categories} />
      {type === 'SHOP' ? <StorePage partnerId={uuid} /> : <RestaurantPage partnerId={uuid} />}
    </>
  )
}
