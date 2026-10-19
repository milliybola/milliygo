import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  CartLine,
  OrderMode,
  Partner,
  PartnerCart,
  PartnerType,
  Product,
  ProductSet,
} from './types'
import { lineSaving, lineTotal } from './utils'

/**
 * Savatlar — har bir hamkor uchun alohida (superapp CartController kabi).
 * Restoranlar va do'konlar savatlari alohida ko'rsatiladi (partner_type bo'yicha).
 * Do'konda olib ketish yo'q — rejim har doim DELIVERY.
 */
interface CartState {
  carts: Record<string, PartnerCart>
  /** Savat hali bo'lmasa ham restoran qaysi rejimda ochilgan */
  preferredMode: Record<string, OrderMode>
  setQty: (partner: Partner, line: Omit<CartLine, 'quantity'>, qty: number) => void
  setMode: (partner: Partner, mode: OrderMode) => void
  setComment: (partnerUuid: string, comment: string) => void
  setCutlery: (partnerUuid: string, n: number | null) => void
  clear: (partnerUuid: string) => void
  refreshPartner: (partner: Partner) => void
}

export const productLine = (p: Product): Omit<CartLine, 'quantity'> => ({
  key: `p:${p.uuid}`,
  kind: 'product',
  uuid: p.uuid,
  name: p.name,
  image: p.image,
  price: p.final_price,
  old_price: p.final_price < p.price ? p.price : null,
  promotion: p.promotion ?? null,
})

export const setLine = (s: ProductSet): Omit<CartLine, 'quantity'> => ({
  key: `s:${s.uuid}`,
  kind: 'set',
  uuid: s.uuid,
  name: s.name,
  image: s.image,
  price: s.price,
  old_price: s.old_price && s.old_price > s.price ? s.old_price : null,
  set_items: s.items,
})

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      carts: {},
      preferredMode: {},

      setQty: (partner, line, qty) => {
        const carts = { ...get().carts }
        const existing = carts[partner.uuid]
        const lines = [...(existing?.lines || [])]
        const idx = lines.findIndex((l) => l.key === line.key)
        if (qty <= 0) {
          if (idx >= 0) lines.splice(idx, 1)
        } else if (idx >= 0) {
          lines[idx] = { ...lines[idx], ...line, quantity: qty }
        } else {
          lines.push({ ...line, quantity: qty })
        }
        if (!lines.length) {
          delete carts[partner.uuid]
        } else {
          const mode =
            partner.partner_type === 'SHOP'
              ? 'DELIVERY'
              : existing?.mode || get().preferredMode[partner.uuid] || 'DELIVERY'
          carts[partner.uuid] = {
            ...(existing || {}),
            partner,
            lines,
            mode,
            updatedAt: Date.now(),
          }
        }
        set({ carts })
      },

      setMode: (partner, mode) => {
        const m: OrderMode = partner.partner_type === 'SHOP' ? 'DELIVERY' : mode
        const preferredMode = { ...get().preferredMode, [partner.uuid]: m }
        const cart = get().carts[partner.uuid]
        if (!cart) return set({ preferredMode })
        set({ preferredMode, carts: { ...get().carts, [partner.uuid]: { ...cart, mode: m } } })
      },

      setComment: (id, comment) => {
        const cart = get().carts[id]
        if (!cart) return
        set({ carts: { ...get().carts, [id]: { ...cart, comment } } })
      },

      setCutlery: (id, n) => {
        const cart = get().carts[id]
        if (!cart) return
        set({ carts: { ...get().carts, [id]: { ...cart, cutlery: n } } })
      },

      clear: (id) => {
        const carts = { ...get().carts }
        delete carts[id]
        set({ carts })
      },

      /** Hamkor ma'lumoti yangilanganda (ish vaqti, zonalar) savatdagi nusxani yangilaymiz */
      refreshPartner: (partner) => {
        const cart = get().carts[partner.uuid]
        if (!cart) return
        set({ carts: { ...get().carts, [partner.uuid]: { ...cart, partner } } })
      },
    }),
    { name: 'milliygo-carts-v1', version: 1 }
  )
)

export function cartSubtotal(c?: PartnerCart | null) {
  return (c?.lines || []).reduce((s, l) => s + lineTotal(l), 0)
}

export function cartSaving(c?: PartnerCart | null) {
  return (c?.lines || []).reduce((s, l) => s + lineSaving(l), 0)
}

export function cartCount(c?: PartnerCart | null) {
  return (c?.lines || []).reduce((s, l) => s + l.quantity, 0)
}

export function cartsOfType(carts: Record<string, PartnerCart>, type: PartnerType) {
  return Object.values(carts)
    .filter((c) => c.partner.partner_type === type && c.lines.length)
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

export function useLineQty(partnerUuid: string | undefined, key: string) {
  return useCart((s) =>
    partnerUuid ? s.carts[partnerUuid]?.lines.find((l) => l.key === key)?.quantity || 0 : 0
  )
}
