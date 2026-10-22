/**
 * Muhit sozlamalari (.env.development / .env.production).
 * Hamma API manzillari shu yerdan olinadi — kodda qattiq yozilmaydi.
 */
export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://mytizim.uz').replace(
  /\/$/,
  ''
)

/** Jonli kuzatish (WebSocket): standart — API manzilidan (https → wss) */
export const WS_BASE = (
  process.env.NEXT_PUBLIC_WS_BASE_URL || API_BASE.replace(/^http/, 'ws')
).replace(/\/$/, '')

/** Token yangilash endpointi */
export const TOKEN_REFRESH_URL = `${API_BASE}/api/token/refresh/`

/** Telegram kirish boti (dev va prod uchun alohida): username @siz, havola t.me */
export const TELEGRAM_BOT_NAME = (
  process.env.NEXT_PUBLIC_TELEGRAM_AUTH_BOT || 'MilliyGoApp_bot'
).replace(/^@/, '')
export const TELEGRAM_BOT_URL = `https://t.me/${TELEGRAM_BOT_NAME}`
