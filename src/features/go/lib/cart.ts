import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  CartLine,
  OrderMode,
  Partner,
  PartnerCart,
  PartnerType,
  Product,
  ProductOptionGroup,
  ProductPackaging,
  ProductSet,
  SelectedOption,
} from './types'
import { lineSaving, lineTotal, roundQty } from './utils'

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

/** Bir xil mahsulot turli opsiyalar bilan alohida qator bo'ladi: `p:<uuid>|<opsiya uuid'lari>` */
const lineKey = (prefix: 'p' | 's', uuid: string, options: SelectedOption[]) =>
  options.length
    ? `${prefix}:${uuid}|${options
        .map((o) => o.uuid)
        .sort()
        .join(',')}`
    : `${prefix}:${uuid}`

const optionsPrice = (options: SelectedOption[]) =>
  options.reduce((sum, o) => sum + o.price_delta, 0)

/** Tanlov guruhi bor mahsulot/set savatga tanlovsiz qo'shilmaydi — mahsulot oynasi ochiladi */
export const hasOptionGroups = (x: { option_groups?: ProductOptionGroup[] }) =>
  (x.option_groups || []).some((g) => g.options.some((o) => o.is_available))

/** Qadoq (quti) narxi: mahsulotda chegirma bo'lsa, server qadoq narxiga ham shu nisbatda qo'llaydi */
const packagingPrice = (p: Product, pk: ProductPackaging) =>
  p.final_price < p.price && p.price > 0
    ? Math.round((pk.price * p.final_price) / p.price)
    : pk.price

export const productLine = (
  p: Product,
  options: SelectedOption[] = [],
  packaging?: ProductPackaging | null
): Omit<CartLine, 'quantity'> => {
  const extra = optionsPrice(options)
  const discounted = p.final_price < p.price
  const base = packaging ? packagingPrice(p, packaging) : p.final_price
  const old = packaging ? packaging.price : p.price
  return {
    // Qadoq alohida qator: "dona" va "quti" bir mahsulotning ikki xil qatori
    key: lineKey('p', p.uuid, options) + (packaging ? `|k:${packaging.uuid}` : ''),
    kind: 'product',
    uuid: p.uuid,
    name: packaging ? `${p.name} (${packaging.name})` : p.name,
    image: p.image,
    price: base + extra,
    old_price: discounted ? old + extra : null,
    // 1+1 / 2+1 faqat butun donali, qadoqsiz qatorlarda
    promotion: packaging || p.unit === 'KG' ? null : (p.promotion ?? null),
    options,
    unit: p.unit,
    step: packaging ? 1 : p.step,
    min_quantity: packaging ? 1 : p.min_quantity,
    packaging: packaging
      ? { uuid: packaging.uuid, name: packaging.name, multiplier: packaging.multiplier }
      : undefined,
    // Qoldiq cheklovi: qadoqda — nechta to'liq qadoq sig'adi
    max_quantity:
      p.stock_quantity == null
        ? null
        : packaging
          ? Math.floor(p.stock_quantity / packaging.multiplier)
          : p.stock_quantity,
  }
}

/** Bir bosishda qo'shiladigan/ayiriladigan miqdor: qadoq — 1, dona — 1, kg — mahsulot qadami */
export const lineStep = (l: Pick<CartLine, 'step' | 'packaging'>) => (l.packaging ? 1 : l.step || 1)

/**
 * Qadam bilan keyingi miqdor. "+" nol bo'lsa eng kam miqdordan boshlaydi; "−" eng kamdan pastga tushsa 0
 * (qator o'chadi). Qoldiqdan oshib ketsa — null (qo'shib bo'lmaydi).
 */
export function nextQty(
  l: Pick<CartLine, 'step' | 'packaging' | 'min_quantity' | 'max_quantity'>,
  current: number,
  dir: 1 | -1
): number | null {
  const step = lineStep(l)
  const min = l.packaging ? 1 : l.min_quantity || step
  if (dir > 0) {
    const n = current <= 0 ? min : roundQty(current + step)
    return l.max_quantity != null && n > l.max_quantity ? null : n
  }
  const n = roundQty(current - step)
  return n < min ? 0 : n
}

export const setLine = (
  s: ProductSet,
  options: SelectedOption[] = []
): Omit<CartLine, 'quantity'> => {
  const extra = optionsPrice(options)
  return {
    key: lineKey('s', s.uuid, options),
    kind: 'set',
    uuid: s.uuid,
    name: s.name,
    image: s.image,
    price: s.price + extra,
    old_price: s.old_price && s.old_price > s.price ? s.old_price + extra : null,
    set_items: s.items,
    options,
  }
}

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

/** Savatdagi "pozitsiyalar" soni (belgi uchun): kg qatori 1 ta, qolganlari donasi bilan */
export function cartCount(c?: PartnerCart | null) {
  return (c?.lines || []).reduce(
    (s, l) => s + (l.unit === 'KG' && !l.packaging ? 1 : Math.ceil(l.quantity)),
    0
  )
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

/** Mahsulotning savatdagi jami soni (barcha opsiya variantlari yig'indisi) */
export function useProductQty(partnerUuid: string | undefined, uuid: string) {
  return useCart((s) =>
    partnerUuid
      ? (s.carts[partnerUuid]?.lines || [])
          .filter((l) => l.uuid === uuid)
          .reduce((sum, l) => sum + l.quantity, 0)
      : 0
  )
}

/** Opsiyali mahsulotda "−": oxirgi qo'shilgan variantdan bittasini ayiradi */
export function decreaseProduct(partner: Partner, uuid: string) {
  const { carts, setQty } = useCart.getState()
  const lines = (carts[partner.uuid]?.lines || []).filter((l) => l.uuid === uuid)
  const last = lines[lines.length - 1]
  if (!last) return
  const { quantity, ...base } = last
  // kg qatorida qadam bo'yicha (0.1), qolganlarida 1
  setQty(partner, base, nextQty(base, quantity, -1) ?? quantity)
}
