import { getApp, getApps, initializeApp } from 'firebase/app'
import { getMessaging, getToken, isSupported } from 'firebase/messaging'

const notificationConfig = {
  apiKey: 'AIzaSyB90EHd0x7VfsFSVktSzvCJhLKCsyJdC5E',
  authDomain: 'myuzbekistan-34339.firebaseapp.com',
  projectId: 'myuzbekistan-34339',
  messagingSenderId: '598826341312',
  appId: '1:598826341312:web:5aabe88821049183b7ee25',
}

/**
 * FCM token (eski auth oqimi uchun). Hammasi chaqirilganda ishlaydi —
 * modul yuklanganda emas: iPhone'dagi Telegram/Instagram ichki
 * brauzerlarida serviceWorker yo'q, getMessaging modul darajasida
 * chaqirilsa butun sayt ishga tushmay qolardi.
 */
export async function getFcmToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  try {
    if (!(await isSupported())) return null
    const app = !getApps().length ? initializeApp(notificationConfig) : getApp()
    const token = await getToken(getMessaging(app), {
      vapidKey:
        'BELvXYw6d13OKlKHom1krun3ylDx-KNKs8dtO52deWpXB6A2el82Yh-NGNrCXPJzItxTnjWAI09vk9by3cIWSms',
    })
    return token || null
  } catch {
    return null
  }
}
