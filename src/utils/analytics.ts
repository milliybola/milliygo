/**
 * Yandex Metrica (Webvisor, bosish xaritasi, voronka). Hisoblagich raqami NEXT_PUBLIC_YM_ID da;
 * bo'sh bo'lsa hamma funksiya hech narsa qilmaydi.
 */
export const YM_ID = Number(process.env.NEXT_PUBLIC_YM_ID) || 0

type YmFn = (id: number, method: string, ...args: unknown[]) => void

const ym = (): YmFn | null => {
  if (!YM_ID || typeof window === 'undefined') return null
  const fn = (window as unknown as { ym?: YmFn }).ym
  return typeof fn === 'function' ? fn : null
}

/** Sahifa ko'rish (SPA o'tishlarida qo'lda yuboriladi) */
export const trackPageView = (url: string) => ym()?.(YM_ID, 'hit', url)

/** Maqsad (goal): masalan add_to_cart, checkout_start, order_created */
export const trackGoal = (name: string, params?: Record<string, unknown>) =>
  ym()?.(YM_ID, 'reachGoal', name, params)

/** Foydalanuvchi parametrlari: tizimga kirgan mijozni sessiyalarda ajratish uchun */
export const identifyUser = (
  id: string | number | null | undefined,
  params?: Record<string, unknown>
) => {
  const f = ym()
  if (!f) return
  if (id) f(YM_ID, 'setUserID', String(id))
  if (params) f(YM_ID, 'userParams', params)
}
