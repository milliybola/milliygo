import axios from 'axios'
import request from '@/utils/axios'
import {
  listOf,
  normalizeAddress,
  normalizeBanner,
  normalizeBaseCategory,
  normalizeMenu,
  normalizeNotificationsPage,
  normalizeOrder,
  normalizePartner,
  normalizeSearchProduct,
  normalizeProfile,
  normalizePromotion,
  normalizeSet,
  unwrap,
} from './normalize'
import type {
  NotificationsPage,
  BaseCategory,
  MenuCategory,
  Order,
  Partner,
  PartnerFilters,
  PartnerType,
  ProductSet,
  PublicOrderResult,
  PromoBanner,
  Promotion,
  SearchResult,
  UserAddress,
  UserProfile,
} from './types'
import { API_BASE, isLiveBetween, toNum } from './utils'

/**
 * "Jim" klient — ixtiyoriy (hali mavjud bo'lmagan) endpointlar uchun:
 * 404 bo'lsa global xatolik bildirishnomasi chiqmasin.
 */
const quiet = axios.create({ baseURL: API_BASE, timeout: 15000 })
quiet.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const t = localStorage.getItem('access_token')
    if (t && t !== 'undefined') config.headers.Authorization = `Bearer ${t}`
  }
  config.headers['Accept-Language'] = 'uz'
  return config
})

export type Optional<T> = { available: boolean; data: T }

async function optionalGet<T>(url: string, map: (body: any) => T, empty: T): Promise<Optional<T>> {
  try {
    const res = await quiet.get(url)
    return { available: true, data: map(res.data) }
  } catch {
    return { available: false, data: empty }
  }
}

// ── Hamkorlar ────────────────────────────────────────────────────────────
export async function fetchPartners(
  params: {
    partner_type?: PartnerType
    category?: string
  } & PartnerFilters
): Promise<Partner[]> {
  // Faqat yoqilgan filtrlar yuboriladi (?fast=true), o'chirilganlari so'rovga kirmaydi
  const query = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== false))
  const res = await request({ url: '/partner/', method: 'get', params: query })
  return listOf(res, 'partners', 'restaurants').map(normalizePartner)
}

export async function fetchPartner(uuid: string): Promise<Partner> {
  const res = await request({ url: `/partner/${uuid}/`, method: 'get' })
  return normalizePartner(unwrap(res))
}

/** Menyu: kategoriyalar mahsulotlari bilan bitta so'rovda keladi */
export async function fetchMenu(
  partnerUuid: string
): Promise<{ categories: MenuCategory[]; meta: any }> {
  const res = await request({
    url: '/partner/category/',
    method: 'get',
    params: { partner: partnerUuid },
  })
  return normalizeMenu(res)
}

export async function fetchBaseCategories(partner_type: PartnerType): Promise<BaseCategory[]> {
  const res = await request({ url: '/base-categories/', method: 'get', params: { partner_type } })
  return listOf(res, 'categories', 'base_categories')
    .filter(
      (c: any) => c && c.is_active !== false && (!c.category_type || c.category_type === 'main')
    )
    .map(normalizeBaseCategory)
}

/** Faqat amaldagi bannerlar: is_active va start_date ≤ bugun ≤ end_date ("dd-MM-yyyy") */
export async function fetchBanners(partner_type?: PartnerType): Promise<PromoBanner[]> {
  const res = await request({
    url: '/promotions/promos/',
    method: 'get',
    params: partner_type ? { partner_type } : undefined,
  })
  return listOf(res)
    .map(normalizeBanner)
    .filter((b) => b.is_active && b.image && isLiveBetween(b.start_date, b.end_date))
}

// ── Setlar va 1+1 / 2+1 (kontrakt: API_CONTRACT_SETS_PROMOS.md, backendda hali yo'q) ──
export function fetchSets(partnerUuid: string): Promise<Optional<ProductSet[]>> {
  return optionalGet(
    `/partner/sets/?partner=${encodeURIComponent(partnerUuid)}`,
    (b) =>
      listOf(b, 'sets')
        .map(normalizeSet)
        .filter(
          (s): s is ProductSet =>
            !!s && s.is_active !== false && isLiveBetween(s.start_date, s.end_date)
        ),
    []
  )
}

export function fetchPromotions(partnerUuid: string): Promise<Optional<Promotion[]>> {
  return optionalGet(
    `/partner/promotions/?partner=${encodeURIComponent(partnerUuid)}`,
    (b) =>
      listOf(b, 'promotions')
        .map(normalizePromotion)
        .filter(
          (p): p is Promotion =>
            !!p && p.is_active !== false && isLiveBetween(p.start_date, p.end_date)
        ),
    []
  )
}

// ── Qidiruv ──────────────────────────────────────────────────────────────
export async function search(q: string, partner_type?: PartnerType): Promise<SearchResult> {
  const res = await request({ url: '/search/', method: 'get', params: { q, partner_type } })
  const d = unwrap<any>(res) || {}
  return {
    partners: (Array.isArray(d.partners) ? d.partners : []).map(normalizePartner),
    products: (Array.isArray(d.products) ? d.products : []).map(normalizeSearchProduct),
  }
}

// ── Buyurtmalar ──────────────────────────────────────────────────────────
export async function fetchOrders(): Promise<Order[]> {
  const res = await request({ url: '/orders/', method: 'get' })
  return listOf(res, 'orders').map(normalizeOrder)
}

export async function fetchOrder(uuid: string): Promise<Order> {
  const res = await request({ url: `/orders/${uuid}/`, method: 'get' })
  return normalizeOrder(unwrap(res))
}

/** Tokensiz klient: ulashilgan havola kirishsiz ochiladi, eskirgan token 401 bermasin */
const anonymous = axios.create({ baseURL: API_BASE, timeout: 15000 })

/** Ochiq kuzatuv — faqat faol buyurtmalar (yakunlangan bo'lsa backend 410 qaytaradi) */
export async function fetchPublicOrder(uuid: string): Promise<PublicOrderResult> {
  try {
    const res = await anonymous.get(`/orders/track/${encodeURIComponent(uuid)}/`, {
      headers: { 'Accept-Language': 'uz' },
    })
    return { state: 'ok', order: { ...normalizeOrder(unwrap(res.data)), is_public: true } }
  } catch (e) {
    if (axios.isAxiosError(e)) {
      if (e.response?.status === 410)
        return { state: 'finished', status: String(e.response.data?.status || '') }
      if (e.response?.status === 404) return { state: 'missing' }
    }
    throw e
  }
}

export interface CreateOrderPayload {
  description: string
  address: string
  contact_phone: string
  contact_name?: string
  delivery_type: 'DELIVERY' | 'PICKUP'
  payment_method: 'CASH'
  latitude: string
  longitude: string
  /** Narxni server hisoblaydi; `options` — tanlangan opsiya uuid'lari */
  items: (
    | { product_uuid: string; quantity: number; options?: string[] }
    | { set: string; quantity: number; options?: string[] }
  )[]
}

export async function createOrder(payload: CreateOrderPayload): Promise<any> {
  const res = await request({ url: '/orders/', method: 'post', data: payload })
  return unwrap(res)
}

export async function rateCourier(orderUuid: string, data: { score: number; comment: string }) {
  return request({ url: `/orders/${orderUuid}/rate-courier/`, method: 'post', data })
}

// ── Profil ───────────────────────────────────────────────────────────────
export async function fetchMe(): Promise<UserProfile | null> {
  const res = await request({ url: '/auth/user/me/', method: 'get' })
  return normalizeProfile(res)
}

export async function updateMe(data: { full_name: string; phone_number: string; email?: string }) {
  const res = await request({ url: '/auth/user/me/', method: 'put', data })
  return normalizeProfile(res)
}

/** Profilni saqlash (superapp `updateProfile`): avatar bo'lsa multipart — PUT, bo'lmasa PATCH, keyin POST+override */
export async function updateProfile(a: {
  full_name: string
  phone_number: string
  email?: string
  avatar?: File | null
}) {
  const fd = new FormData()
  fd.append('full_name', a.full_name)
  fd.append('phone_number', a.phone_number)
  if (a.email?.trim()) fd.append('email', a.email.trim())
  if (a.avatar) fd.append('avatar', a.avatar)
  const attempts: (() => Promise<any>)[] = [
    () => request({ url: '/auth/user/me/', method: 'put', data: fd }),
    () => request({ url: '/auth/user/me/', method: 'patch', data: fd }),
    () =>
      request({
        url: '/auth/user/me/',
        method: 'post',
        data: fd,
        headers: { 'X-HTTP-Method-Override': 'PUT' },
      }),
  ]
  let last: any
  for (const run of attempts) {
    try {
      return normalizeProfile(await run())
    } catch (e) {
      last = e
      if (!a.avatar) break
    }
  }
  throw last
}
export async function fetchAddresses(): Promise<UserAddress[]> {
  const res = await request({ url: '/auth/user/addresses/', method: 'get' })
  const list = listOf(res).map(normalizeAddress)
  return [...list.filter((a) => a.is_default), ...list.filter((a) => !a.is_default)]
}

export async function addAddress(a: {
  name: string
  address: string
  lat: number
  lng: number
  is_default?: boolean
  label?: 'home' | 'work' | 'other'
}) {
  return request({
    url: '/auth/user/addresses/',
    method: 'post',
    data: {
      label: a.label || 'other',
      name: a.name.slice(0, 100),
      address: a.address,
      latitude: a.lat.toFixed(6),
      longitude: a.lng.toFixed(6),
      is_default: !!a.is_default,
    },
  })
}

export async function deleteAddress(id: string) {
  return request({ url: `/auth/user/addresses/${id}/delete/`, method: 'post', data: {} })
}

export async function setDefaultAddress(id: string) {
  return request({ url: `/auth/user/addresses/${id}/set_default/`, method: 'post', data: {} })
}

// ── Auth ─────────────────────────────────────────────────────────────────
export function extractTokens(res: any): {
  access: string | null
  refresh: string | null
  user: any
} {
  const d = unwrap<any>(res) || {}
  return {
    access: d.access || d.token || res?.access || res?.token || null,
    refresh: d.refresh || res?.refresh || null,
    user: d.user || res?.user || null,
  }
}

export async function loginWithPassword(phone_number: string, password: string, deviceId?: string) {
  const res = await request({
    url: '/auth/user/login/',
    method: 'post',
    data: { phone_number, password },
    headers: deviceId ? { 'X-Device-Id': deviceId } : undefined,
  })
  return extractTokens(res)
}

export async function loginWithTelegramCode(code: string, deviceId?: string) {
  const res = await request({
    url: '/auth/user/verify-telegram-code/',
    method: 'post',
    data: { code },
    headers: deviceId ? { 'X-Device-Id': deviceId } : undefined,
  })
  return extractTokens(res)
}

// ── Bildirishnomalar (headerdagi qo'ng'iroqcha) ────────────────────────────────
export async function fetchNotifications(
  params: { unread?: boolean; limit?: number; offset?: number } = {}
): Promise<NotificationsPage> {
  const res = await request({
    url: '/notifications/',
    method: 'get',
    params: { ...params, unread: params.unread ? 'true' : undefined },
  })
  return normalizeNotificationsPage(res)
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await request({ url: '/notifications/unread-count/', method: 'get' })
  return toNum(unwrap<any>(res)?.unread_count)
}

export async function markNotificationRead(uuid: string): Promise<void> {
  await request({ url: `/notifications/${uuid}/read/`, method: 'post', data: {} })
}

export async function markAllNotificationsRead(): Promise<void> {
  await request({ url: '/notifications/read-all/', method: 'post', data: {} })
}

export async function deleteNotification(uuid: string): Promise<void> {
  await request({ url: `/notifications/${uuid}/`, method: 'delete' })
}

/** Qurilma (brauzer) FCM tokenini ro'yxatdan o'tkazish — ilova yopiq bo'lsa ham push borishi uchun */
export async function registerPushDevice(registration_id: string): Promise<void> {
  await request({
    url: '/notifications/devices/register/',
    method: 'post',
    data: { registration_id, device_type: 'WEB' },
  })
}

/** SMS orqali kirish: kod O'zbekiston raqamiga yuboriladi; raqam bazada bo'lmasa tasdiqlangach hisob ochiladi */
export async function sendSmsCode(phone: string) {
  return request({
    url: '/auth/user/send-otp/',
    method: 'post',
    data: { phone_number: phone, channel: 'sms' },
  })
}

export async function loginWithSmsCode(phone: string, code: string, deviceId?: string) {
  const res = await request({
    url: '/auth/user/verify-otp/',
    method: 'post',
    data: { phone_number: phone, otp_code: code },
    headers: deviceId ? { 'X-Device-Id': deviceId } : undefined,
  })
  return extractTokens(res)
}

/** Serverdan kelgan xato matni (DRF `message`/`detail`/maydon xatosi) yoki zaxira matn */
export function apiErrorMessage(e: unknown, fallback: string): string {
  const d = (e as any)?.response?.data
  const v = d?.message || d?.detail || d?.phone_number?.[0] || d?.otp_code?.[0]
  return typeof v === 'string' ? v : fallback
}
