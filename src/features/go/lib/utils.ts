import type { CartLine, DeliveryZone, OpeningHours, Partner, PromotionShort } from './types'

export { API_BASE } from '@/constants/env'
import { API_BASE as _API } from '@/constants/env'

/** 12345 → "12 345" */
export function formatSum(value: number | null | undefined): string {
  const n = Math.round(Number(value) || 0)
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export const som = (v: number | null | undefined) => `${formatSum(v)} so'm`

export function toNum(v: any, fallback = 0): number {
  if (v === null || v === undefined || v === '') return fallback
  const n = typeof v === 'number' ? v : parseFloat(String(v))
  return Number.isFinite(n) ? n : fallback
}

export function toNumOrNull(v: any): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = typeof v === 'number' ? v : parseFloat(String(v))
  return Number.isFinite(n) ? n : null
}

export function cleanText(v: any): string | null {
  const s = v === null || v === undefined ? '' : String(v).trim()
  if (!s || s === 'null' || s === "Manzil ko'rsatilmagan") return null
  // "." yoki faqat tinish belgilari — ko'rsatishga yaroqsiz
  return /[A-Za-zЀ-ӿ0-9]/.test(s) ? s : null
}

export function absUrl(u: any): string | null {
  const s = cleanText(u)
  if (!s) return null
  // Mixed-content uchun http → https, lekin lokal backend (localhost) HTTPS'ni bilmaydi
  if (s.startsWith('http://') && !/^http:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(s))
    return s.replace('http://', 'https://')
  if (s.startsWith('http')) return s
  return `${_API}${s.startsWith('/') ? '' : '/'}${s}`
}

/**
 * Backend sanasi: "dd-MM-yyyy[ HH:mm[:ss]]" yoki ISO.
 * `new Date("19-10-2026 12:00:00")` brauzerda Invalid Date beradi — shu sabab qo'lda o'qiymiz.
 */
export function parseApiDate(raw: any): Date | null {
  if (!raw) return null
  const s = String(raw).trim()
  if (!s) return null
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const d = new Date(s.includes('T') ? s : s.replace(' ', 'T'))
    return Number.isNaN(d.getTime()) ? null : d
  }
  const m = s.match(/^(\d{1,2})[-./](\d{1,2})[-./](\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/)
  if (m) {
    return new Date(+m[3], +m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0))
  }
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d
}

/** Maskan yaqinda qo'shilganmi ("Yangi" belgisi): created_at dan beri `days` kundan oshmagan */
export function isNewPartner(p: { created_at?: string | null }, days = 14): boolean {
  const d = parseApiDate(p.created_at)
  if (!d) return false
  const age = Date.now() - d.getTime()
  return age >= 0 && age <= days * 86_400_000
}

/** "Fastfud, Pitsa, Amerika" */
export function cuisineLabel(p: { cuisines?: { name: string }[] }, max = 3): string {
  return (p.cuisines || [])
    .slice(0, max)
    .map((c) => c.name)
    .join(', ')
}

/** Aksiya/banner sana oralig'ida amaldami (end_date — kun oxirigacha) */
export function isLiveBetween(start: any, end: any, now = new Date()): boolean {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const s = parseApiDate(start)
  if (s && today < new Date(s.getFullYear(), s.getMonth(), s.getDate()).getTime()) return false
  const e = parseApiDate(end)
  if (e && today > new Date(e.getFullYear(), e.getMonth(), e.getDate()).getTime()) return false
  return true
}

const pad = (n: number) => String(n).padStart(2, '0')

export function formatTime(d: Date | null): string {
  if (!d) return ''
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const MONTHS = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentabr',
  'oktabr',
  'noyabr',
  'dekabr',
]

export function formatDateTime(d: Date | null): string {
  if (!d) return ''
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) return `bugun ${formatTime(d)}`
  return `${d.getDate()}-${MONTHS[d.getMonth()]}, ${d.getFullYear()} • ${formatTime(d)}`
}

// ── Ish vaqti ────────────────────────────────────────────────────────────
const DAY_KEYS: (keyof OpeningHours)[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

const hm = (t?: string | null) => (t ? t.split(':').slice(0, 2).join(':') : '')

export function workingHoursLabel(p: Partner): string | null {
  const oh = p.opening_hours
  if (!oh?.from_hour || !oh?.to_hour) return null
  return `${hm(oh.from_hour)} - ${hm(oh.to_hour)}`
}

export function opensAtLabel(p: Partner): string | null {
  return hm(p.opening_hours?.from_hour) || null
}

/** Superapp `isCurrentlyOpen` bilan bir xil: is_open + ish kuni + soat oralig'i */
export function isOpenNow(p: Partner, now = new Date()): boolean {
  if (!p.is_open) return false
  const oh = p.opening_hours
  if (!oh) return true
  const dayKey = DAY_KEYS[now.getDay()]
  if (oh[dayKey] === false) return false
  if (!oh.from_hour || !oh.to_hour) return true
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map((x) => parseInt(x, 10))
    return (h || 0) * 60 + (m || 0)
  }
  const start = toMin(oh.from_hour)
  const end = toMin(oh.to_hour)
  const cur = now.getHours() * 60 + now.getMinutes()
  if (end === start) return true
  if (end < start) return cur >= start || cur < end // tungi smena
  return cur >= start && cur < end
}

// ── Geo ──────────────────────────────────────────────────────────────────
export function pointInRing(lat: number, lng: number, ring: number[][]): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0]
    const yi = ring[i][1]
    const xj = ring[j][0]
    const yj = ring[j][1]
    const hit = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    if (hit) inside = !inside
  }
  return inside
}

export function zoneFor(p: Partner, lat?: number | null, lng?: number | null): DeliveryZone | null {
  if (lat == null || lng == null) return null
  for (const z of p.delivery_zones) {
    const ring = z.coordinates?.[0]
    if (ring && ring.length >= 3 && pointInRing(lat, lng, ring)) return z
  }
  return null
}

/** Manzil ma'lum, zonalar ma'lum va hech biriga tushmaydi */
export function isOutOfZone(p: Partner, lat?: number | null, lng?: number | null): boolean {
  if (lat == null || lng == null) return false
  if (!p.delivery_zones.length) return false
  return zoneFor(p, lat, lng) === null
}

/** Superapp formulasi: zona vaqti ±5, 10 daqiqalik oraliq. Faqat API bergan vaqtdan. */
export function etaRange(minutes: number | null | undefined): string | null {
  if (!minutes || minutes <= 0) return null
  const lower = Math.min(Math.max(minutes - 5, 10), 20)
  return `${lower}–${lower + 10} daq`
}

export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

export function distanceLabel(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
}

/** Yetkazish narxi: zona narxi → restoran narxi; bepul chegaradan oshsa 0 */
export function deliveryFeeFor(p: Partner, subtotal: number, zone: DeliveryZone | null): number {
  if (p.free_delivery_threshold > 0 && subtotal >= p.free_delivery_threshold) return 0
  const fee = zone?.delivery_fee ?? p.delivery_fee
  return fee && fee > 0 ? fee : 0
}

// ── 1+1 / 2+1 (kontrakt §3) ──────────────────────────────────────────────
export function dealLabel(p?: PromotionShort | null): string | null {
  if (!p || p.buy_quantity <= 0 || p.get_quantity <= 0) return null
  return p.label || `${p.buy_quantity}+${p.get_quantity}`
}

/** free = floor(qty / (buy+get)) * get */
export function freeCount(qty: number, p?: PromotionShort | null): number {
  if (!p || p.buy_quantity <= 0 || p.get_quantity <= 0) return 0
  return Math.floor(qty / (p.buy_quantity + p.get_quantity)) * p.get_quantity
}

/** Kasr miqdorlar (0.1 + 0.2) suzuvchi nuqta xatosiz: 3 xonagacha yaxlitlanadi */
export function roundQty(n: number): number {
  return Math.round(n * 1000) / 1000
}

/** Miqdor matni: dona — "3", kg — "1.5 kg" */
export function formatQty(qty: number, unit?: 'PIECE' | 'KG'): string {
  const text = String(roundQty(qty))
  return unit === 'KG' ? `${text} kg` : text
}

/** Savat/buyurtma qatoridagi miqdor: "1.5 kg", "2 × Quti", "3" */
export function qtyLabel(q: {
  quantity: number
  unit?: 'PIECE' | 'KG'
  packaging_name?: string | null
}): string {
  if (q.packaging_name) return `${roundQty(q.quantity)} × ${q.packaging_name}`
  return formatQty(q.quantity, q.unit)
}

/** Qator summasi so'mgacha yaxlitlanadi (server ham shunday: kg kabi kasr miqdorlar uchun) */
export function lineTotal(l: CartLine): number {
  return Math.round((l.quantity - freeCount(l.quantity, l.promotion)) * l.price)
}

export function lineSaving(l: CartLine): number {
  const free = freeCount(l.quantity, l.promotion) * l.price
  const sale = l.old_price && l.old_price > l.price ? (l.old_price - l.price) * l.quantity : 0
  return Math.round(free + sale)
}

/** Savat qatori ostidagi izoh: "1+1 aksiya · 2 tasi bepul" */
export function dealNote(l: CartLine): string | null {
  const p = l.promotion
  const label = dealLabel(p)
  if (!p || !label) return null
  const free = freeCount(l.quantity, p)
  if (free > 0) return `${label} aksiya · ${free} tasi bepul`
  const rest = l.quantity % (p.buy_quantity + p.get_quantity)
  const needPaid = rest < p.buy_quantity ? p.buy_quantity - rest : 0
  return needPaid > 0
    ? `${label} aksiya · yana ${needPaid} ta qo'shing`
    : `${label} aksiya · yana 1 ta qo'shing — bepul`
}

/** Qaytim: jamidan katta yaxlit kupyuralar (superapp bilan bir xil) */
export function changeOptions(total: number): number[] {
  const out = new Set<number>()
  for (const step of [10000, 50000, 100000, 200000]) {
    const v = (Math.floor(total / step) + 1) * step
    if (v > total) out.add(v)
  }
  return Array.from(out).sort((a, b) => a - b)
}

export function digits(s: string | null | undefined) {
  return (s || '').replace(/\D/g, '')
}

export function cx(...a: (string | false | null | undefined)[]) {
  return a.filter(Boolean).join(' ')
}

/** "hozir", "5 daqiqa oldin", "2 soat oldin", "kecha", "3 kun oldin", aks holda sana */
export function timeAgo(date: Date | null | undefined, now: Date = new Date()): string {
  if (!date) return ''
  const sec = Math.max(0, Math.round((now.getTime() - date.getTime()) / 1000))
  if (sec < 60) return 'hozir'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} daqiqa oldin`
  const hours = Math.floor(min / 60)
  if (hours < 24) return `${hours} soat oldin`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'kecha'
  if (days < 7) return `${days} kun oldin`
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`
}
