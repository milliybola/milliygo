/** Sayt manzili (kanonik URL, sitemap va og:url uchun). Domen o'zgarsa NEXT_PUBLIC_SITE_URL ni o'rnating */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.milliyapp.uz').replace(
  /\/$/,
  ''
)
export const SITE_NAME = 'MilliyGo'
export const DEFAULT_TITLE = 'MilliyGo — taomlar va mahsulotlarni tez yetkazib berish'
export const DEFAULT_DESCRIPTION =
  "MilliyGo: G'allaorolda restoranlardan taom va do'konlardan oziq-ovqat mahsulotlarini tez yetkazib berish yoki o'zingiz olib ketish. Qulay narxlar, kuryerni xaritada kuzatish."
export const OG_IMAGE = `${SITE_URL}/og-image.png`
