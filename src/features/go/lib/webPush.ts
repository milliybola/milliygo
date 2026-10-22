import { registerPushDevice } from './api'

/**
 * Brauzer push (FCM web): ilova/sayt yopiq bo'lsa ham bildirishnoma keladi.
 * Sozlash uchun MilliyGo Firebase loyihasining Web app ma'lumotlari kerak (`.env`):
 *   NEXT_PUBLIC_FCM_API_KEY, NEXT_PUBLIC_FCM_PROJECT_ID, NEXT_PUBLIC_FCM_SENDER_ID,
 *   NEXT_PUBLIC_FCM_APP_ID, NEXT_PUBLIC_FCM_VAPID_KEY
 * Ular berilmagan bo'lsa push tugmasi ko'rinmaydi, headerdagi ro'yxat esa baribir ishlaydi.
 * (`src/config/firebaseNotification.ts` — boshqa mahsulot loyihasi, MilliyGo backend uchun mos emas.)
 */
const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FCM_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FCM_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FCM_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FCM_APP_ID,
}
const VAPID_KEY = process.env.NEXT_PUBLIC_FCM_VAPID_KEY
const TOKEN_KEY = 'go-web-push-token'

export type WebPushResult = 'enabled' | 'denied' | 'unsupported' | 'unconfigured' | 'error'

export const webPushConfigured = () =>
  !!(cfg.apiKey && cfg.projectId && cfg.messagingSenderId && cfg.appId && VAPID_KEY)

export const webPushSupported = () =>
  typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator

/** Push yoqish mumkinmi va foydalanuvchi hali qaror qilmaganmi (tugma ko'rsatish uchun) */
export const canOfferWebPush = () =>
  webPushConfigured() && webPushSupported() && Notification.permission === 'default'

/** Ruxsat so'raydi (faqat foydalanuvchi bosganda!), tokenni olib backendga ro'yxatdan o'tkazadi */
export async function enableWebPush(): Promise<WebPushResult> {
  if (!webPushConfigured()) return 'unconfigured'
  if (!webPushSupported()) return 'unsupported'
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return 'denied'
    return await syncWebPushToken()
  } catch (e) {
    console.error('Web push yoqilmadi:', e)
    return 'error'
  }
}

/**
 * Ruxsat allaqachon berilgan bo'lsa, tokenni (yangilangan bo'lishi mumkin) backend bilan sinxronlaydi.
 * Kirgandan keyin chaqiriladi: token foydalanuvchiga bog'lanadi.
 */
export async function syncWebPushToken(): Promise<WebPushResult> {
  if (!webPushConfigured()) return 'unconfigured'
  if (!webPushSupported()) return 'unsupported'
  if (Notification.permission !== 'granted') return 'denied'
  try {
    const [{ getApp, getApps, initializeApp }, { getMessaging, getToken, isSupported }] =
      await Promise.all([import('firebase/app'), import('firebase/messaging')])
    if (!(await isSupported())) return 'unsupported'

    // Alohida nomli ilova: loyihadagi boshqa Firebase sozlamasi (default app) bilan to'qnashmaydi
    const name = 'milliygo-web-push'
    const app = getApps().some((a) => a.name === name)
      ? getApp(name)
      : initializeApp(cfg as Record<string, string>, name)

    // Service worker sozlamani URL parametrlari orqali oladi (build vaqtida kalit yozilmaydi)
    const params = new URLSearchParams(cfg as Record<string, string>).toString()
    const registration = await navigator.serviceWorker.register(
      `/firebase-messaging-sw.js?${params}`
    )
    const token = await getToken(getMessaging(app), {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    })
    if (!token) return 'error'
    if (localStorage.getItem(TOKEN_KEY) !== token) {
      await registerPushDevice(token)
      localStorage.setItem(TOKEN_KEY, token)
    }
    return 'enabled'
  } catch (e) {
    console.error('Web push tokenini sinxronlashda xato:', e)
    return 'error'
  }
}
