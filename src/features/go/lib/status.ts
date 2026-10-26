import type { Order } from './types'

export type StatusTone = 'pending' | 'progress' | 'delivering' | 'done' | 'cancelled'

export interface StatusInfo {
  label: string
  /** 0 — qabul, 1 — tayyorlash, 2 — yo'lda/tayyor, 3 — yakun */
  stage: number
  progress: number
  tone: StatusTone
  hint?: string
}

/** Superapp `OrderStatusInfo.of` bilan bir xil (yagona tarjima manbai) */
export function statusInfo(raw: string, pickup = false): StatusInfo {
  const key = (raw || '').trim().toUpperCase()
  if (pickup) {
    switch (key) {
      case 'READY':
      case 'READY_FOR_PICKUP':
        return {
          label: 'Olib ketishga tayyor',
          stage: 2,
          progress: 0.85,
          tone: 'delivering',
          hint: 'Restoranga borib oling',
        }
      case 'DELIVERED':
      case 'COMPLETED':
      case 'PICKED_UP':
        return { label: 'Olib ketildi', stage: 3, progress: 1, tone: 'done' }
    }
  }
  switch (key) {
    case 'VERIFYING':
      return {
        label: 'Tasdiqlanmoqda',
        stage: 0,
        progress: 0.03,
        tone: 'pending',
        hint: "Operator tez orada sizga qo'ng'iroq qiladi",
      }
    case 'AWAITING_PAYMENT':
      return {
        label: "To'lov kutilmoqda",
        stage: 0,
        progress: 0.05,
        tone: 'pending',
        hint: "To'lovni yakunlang",
      }
    case 'PENDING':
    case 'CREATED':
    case 'NEW':
      return {
        label: 'Tasdiqlanishi kutilmoqda',
        stage: 0,
        progress: 0.1,
        tone: 'pending',
        hint: 'Restoran tasdiqlashini kutyapmiz',
      }
    case 'ACCEPTED':
    case 'CONFIRMED':
      return {
        label: 'Buyurtma qabul qilindi',
        stage: 0,
        progress: 0.25,
        tone: 'progress',
        hint: 'Tez orada tayyorlanadi',
      }
    case 'SEARCHING_COURIER':
      return {
        label: 'Buyurtma qabul qilindi',
        stage: 0,
        progress: 0.25,
        tone: 'progress',
        hint: 'Yaqin atrofdagi kuryerni topyapmiz',
      }
    case 'PREPARING':
    case 'COOKING':
      return {
        label: 'Tayyorlanmoqda',
        stage: 1,
        progress: 0.4,
        tone: 'progress',
        hint: 'Oshpazlar ishga kirishdi',
      }
    case 'ASSIGNED':
    case 'COURIER_ACCEPTED':
      return {
        label: 'Kuryer biriktirildi',
        stage: 1,
        progress: 0.6,
        tone: 'progress',
        hint: "Kuryer restoranga yo'lda",
      }
    case 'READY':
    case 'READY_FOR_PICKUP':
      return {
        label: 'Buyurtma tayyor',
        stage: 1,
        progress: 0.65,
        tone: 'progress',
        hint: 'Kuryer olib ketishini kutmoqda',
      }
    case 'PICKUP_IN_PROGRESS':
      return {
        label: 'Kuryer buyurtmani olmoqda',
        stage: 1,
        progress: 0.7,
        tone: 'progress',
        hint: 'Kuryer restoranda',
      }
    case 'PICKED_UP':
    case 'DELIVERING':
    case 'ON_THE_WAY':
      return {
        label: "Kuryer yo'lda",
        stage: 2,
        progress: 0.85,
        tone: 'delivering',
        hint: 'Kuryer yaqinlashmoqda',
      }
    case 'DELIVERED':
    case 'COMPLETED':
      return { label: 'Yetkazildi', stage: 3, progress: 1, tone: 'done' }
    case 'CANCELLED':
    case 'CANCELED':
      return { label: 'Bekor qilindi', stage: 0, progress: 0, tone: 'cancelled' }
    case 'REJECTED':
      return { label: 'Rad etildi', stage: 0, progress: 0, tone: 'cancelled' }
    default:
      return { label: 'Jarayonda', stage: 1, progress: 0.3, tone: 'progress' }
  }
}

export const orderStatus = (o: Order) => statusInfo(o.status, o.delivery_type === 'PICKUP')

export const isOrderActive = (o: Order) => {
  const t = orderStatus(o).tone
  return t !== 'done' && t !== 'cancelled'
}

export const orderNumber = (o: Order) =>
  o.order_number || `#${(o.uuid || '').slice(0, 8).toUpperCase()}`

export const stepsFor = (pickup: boolean) =>
  pickup
    ? ['Qabul qilindi', 'Tayyorlanmoqda', 'Tayyor', 'Olib ketildi']
    : ['Qabul qilindi', 'Tayyorlanmoqda', "Yo'lda", 'Yetkazildi']

export function sortByNewest(list: Order[]) {
  return [...list].sort((a, b) => {
    const t = (b.created_at?.getTime() || 0) - (a.created_at?.getTime() || 0)
    return t !== 0 ? t : (b.id || 0) - (a.id || 0)
  })
}
