import type {
  BaseCategory,
  Courier,
  DeliveryZone,
  MenuCategory,
  NotificationsPage,
  Order,
  OrderItem,
  Partner,
  Product,
  ProductOption,
  ProductOptionGroup,
  ProductPackaging,
  ProductSet,
  ProductUnit,
  PromoBanner,
  Promotion,
  PromotionShort,
  UserAddress,
  UserNotification,
  UserProfile,
} from './types'
import { absUrl, cleanText, parseApiDate, toNum, toNumOrNull } from './utils'

/** `{ success, data }` konvertini ochadi (superapp ApiService bilan bir xil) */
export function unwrap<T = any>(body: any): T {
  if (body && typeof body === 'object' && !Array.isArray(body) && 'data' in body) return body.data
  return body
}

/** Ro'yxat: massiv yoki { results } yoki { <key>: [] } */
export function listOf(body: any, ...keys: string[]): any[] {
  const d = unwrap(body)
  if (Array.isArray(d)) return d
  if (d && typeof d === 'object') {
    for (const k of [...keys, 'results', 'items']) if (Array.isArray(d[k])) return d[k]
  }
  return []
}

function coord(v: any): number | null {
  const n = toNumOrNull(v)
  if (n === null) return null
  if (Math.abs(n) <= 180) return n
  // Ba'zan butun son ko'rinishida saqlangan (400266374 → 40.0266374)
  for (const div of [1e4, 1e5, 1e6, 1e7]) {
    const x = n / div
    if (Math.abs(x) <= 180 && Math.abs(x) >= 30) return x
  }
  return null
}

export function normalizeZone(z: any): DeliveryZone | null {
  if (!z || !Array.isArray(z.coordinates)) return null
  return {
    uuid: String(z.uuid ?? ''),
    name: String(z.name ?? ''),
    district: z.district ?? undefined,
    delivery_fee: toNumOrNull(z.delivery_fee),
    estimated_minutes: toNumOrNull(z.estimated_minutes),
    center: Array.isArray(z.center) ? z.center : undefined,
    coordinates: z.coordinates,
  }
}

export function normalizePartner(j: any): Partner {
  let lat = coord(j?.location_lat ?? j?.latitude ?? j?.lat)
  let lng = coord(j?.location_long ?? j?.longitude ?? j?.lng)
  // O'zbekiston: kenglik 37…46, uzunlik 55…74 — joylari almashgan bo'lsa tuzatamiz
  if (lat !== null && lng !== null && lat >= 55 && lat <= 74 && lng >= 37 && lng <= 46) {
    const t = lat
    lat = lng
    lng = t
  }
  const type = String(j?.partner_type || 'RESTAURANT').toUpperCase()
  return {
    uuid: String(j?.uuid ?? j?.id ?? ''),
    id: j?.id,
    name: String(j?.name ?? ''),
    description: cleanText(j?.description) ?? undefined,
    address: cleanText(j?.address),
    logo: absUrl(j?.logo),
    banner: absUrl(j?.banner),
    phone: cleanText(j?.phone),
    slug: j?.slug,
    lat,
    lng,
    rating: toNum(j?.rating),
    is_open: j?.is_open === true,
    partner_type: type === 'SHOP' ? 'SHOP' : 'RESTAURANT',
    opening_hours: j?.opening_hours && typeof j.opening_hours === 'object' ? j.opening_hours : null,
    min_order_amount: toNum(j?.min_order_amount),
    free_delivery_threshold: toNum(j?.free_delivery_threshold),
    delivery_fee: toNum(j?.delivery_fee),
    delivery_time_minutes: toNumOrNull(j?.delivery_time_minutes),
    delivery_zones: (Array.isArray(j?.delivery_zones) ? j.delivery_zones : [])
      .map(normalizeZone)
      .filter(Boolean) as DeliveryZone[],
    cuisines: (Array.isArray(j?.cuisines) ? j.cuisines : [])
      .map((c: any) => ({ uuid: String(c?.uuid ?? ''), name: cleanText(c?.name) ?? '' }))
      .filter((c: { name: string }) => c.name),
    created_at: j?.created_at ? String(j.created_at) : null,
  }
}

export function normalizePromotionShort(p: any): PromotionShort | null {
  if (!p || typeof p !== 'object') return null
  if (p.type && p.type !== 'BUY_X_GET_Y') return null
  const buy = parseInt(p.buy_quantity, 10)
  const get = parseInt(p.get_quantity, 10)
  if (!(buy > 0) || !(get > 0)) return null
  return {
    uuid: p.uuid,
    type: 'BUY_X_GET_Y',
    buy_quantity: buy,
    get_quantity: get,
    label: p.label || undefined,
  }
}

export function normalizePromotion(p: any): Promotion | null {
  const s = normalizePromotionShort(p)
  if (!s) return null
  return {
    ...s,
    uuid: String(p.uuid ?? ''),
    partner: p.partner,
    products: Array.isArray(p.products) ? p.products.map(String) : [],
    same_product: p.same_product !== false,
    is_active: p.is_active !== false,
    start_date: p.start_date ?? null,
    end_date: p.end_date ?? null,
  }
}

export function normalizeOptionGroups(raw: any): ProductOptionGroup[] {
  return (Array.isArray(raw) ? raw : [])
    .map((g: any): ProductOptionGroup | null => {
      const options: ProductOption[] = (Array.isArray(g?.options) ? g.options : [])
        .filter((o: any) => o && o.uuid)
        .map((o: any) => ({
          uuid: String(o.uuid),
          name: String(o.name ?? ''),
          price_delta: Math.max(0, toNum(o.price_delta)),
          is_available: o.is_available !== false,
        }))
      if (!g?.uuid || !options.length) return null
      const max = Math.max(1, parseInt(g.max_select, 10) || 1)
      return {
        uuid: String(g.uuid),
        name: String(g.name ?? ''),
        min_select: Math.min(max, Math.max(0, parseInt(g.min_select, 10) || 0)),
        max_select: max,
        options,
      }
    })
    .filter(Boolean) as ProductOptionGroup[]
}

export function normalizeProduct(j: any, categoryUuid?: string): Product {
  const price = toNum(j?.price)
  const discount = Math.max(0, Math.round(toNum(j?.discount)))
  const sale = toNumOrNull(j?.sale_price)
  const serverFinal = toNumOrNull(j?.final_price)
  let final = price
  // Server hisoblagan yakuniy narx (filial narxi hisobga olingan) ustun; yo'q bo'lsa superapp `finalPrice`:
  // sale_price > 0 → u; aks holda discount %
  if (serverFinal !== null && serverFinal > 0) final = Math.round(serverFinal)
  else if (sale !== null && sale > 0) final = sale
  else if (discount > 0) final = Math.round((price * (100 - discount)) / 100)
  const images: string[] = (Array.isArray(j?.images) ? j.images : [])
    .filter((im: any) => im && im.is_active !== false)
    .map((im: any) => absUrl(im?.image))
    .filter(Boolean)
  const main = absUrl(j?.main_image) || images[0] || null
  const unit: ProductUnit = j?.unit === 'KG' ? 'KG' : 'PIECE'
  const step = toNum(j?.step) > 0 ? toNum(j?.step) : 1
  return {
    uuid: String(j?.uuid ?? j?.id ?? ''),
    id: j?.id,
    name: String(j?.name ?? ''),
    description: cleanText(j?.description) ?? '',
    price,
    final_price: final,
    discount: final < price ? discount || Math.round(((price - final) / price) * 100) : 0,
    image: main,
    images: images.length ? images : main ? [main] : [],
    is_available: j?.is_available !== false && j?.is_active !== false,
    category_uuid: categoryUuid,
    promotion: normalizePromotionShort(j?.promotion),
    kind: j?.kind === 'SET' ? 'SET' : 'SINGLE',
    option_groups: normalizeOptionGroups(j?.option_groups),
    unit,
    step,
    min_quantity: Math.max(step, toNum(j?.min_quantity) || step),
    barcode: cleanText(j?.barcode) ?? undefined,
    brand: cleanText(j?.brand) ?? undefined,
    packagings: normalizePackagings(j?.packagings),
    stock_quantity: toNumOrNull(j?.stock_quantity),
  }
}

export function normalizePackagings(raw: any): ProductPackaging[] {
  return (Array.isArray(raw) ? raw : [])
    .filter((p: any) => p && p.uuid && toNum(p.multiplier) > 0)
    .map((p: any) => ({
      uuid: String(p.uuid),
      name: String(p.name ?? 'Quti'),
      multiplier: toNum(p.multiplier),
      price: Math.round(toNum(p.price)),
    }))
}

export function normalizeSet(j: any): ProductSet | null {
  if (!j || !j.uuid) return null
  return {
    uuid: String(j.uuid),
    partner: j.partner,
    name: String(j.name ?? 'Set'),
    description: cleanText(j.description) ?? undefined,
    image: absUrl(j.image),
    price: toNum(j.price),
    old_price: toNumOrNull(j.old_price),
    items: (Array.isArray(j.items) ? j.items : [])
      .filter((x: any) => x && (x.name || x.product))
      .map((x: any) => ({
        product: String(x.product ?? ''),
        name: String(x.name ?? ''),
        image: absUrl(x.image),
        quantity: Math.max(1, parseInt(x.quantity, 10) || 1),
      })),
    option_groups: normalizeOptionGroups(j.option_groups),
    is_active: j.is_active !== false,
    start_date: j.start_date ?? null,
    end_date: j.end_date ?? null,
  }
}

/** GET /partner/category/?partner=<uuid> — kategoriyalar mahsulotlari bilan */
export function normalizeMenu(body: any): { categories: MenuCategory[]; meta: any } {
  const d = unwrap(body)
  const raw: any[] = Array.isArray(d) ? d : d?.categories || d?.base_categories || []
  const categories = raw
    .filter((c) => c && c.is_active !== false)
    .map((c) => {
      const det = c.category_details || c.category || c
      const uuid = String(c.uuid ?? det.uuid ?? '')
      return {
        uuid,
        base_uuid: det.uuid,
        name: String(det.name ?? ''),
        logo: absUrl(det.logo),
        category_type: det.category_type,
        products: (Array.isArray(c.products) ? c.products : [])
          .filter((p: any) => p && p.is_active !== false)
          .map((p: any) => normalizeProduct(p, uuid)),
      } as MenuCategory
    })
  return { categories, meta: Array.isArray(d) ? {} : d || {} }
}

export function normalizeBaseCategory(c: any): BaseCategory {
  return {
    uuid: String(c?.uuid ?? ''),
    name: String(c?.name ?? ''),
    logo: absUrl(c?.logo),
    category_type: c?.category_type,
    partner_uuids: (Array.isArray(c?.partners) ? c.partners : []).map((p: any) =>
      String(p?.uuid ?? p)
    ),
  }
}

export function normalizeBanner(b: any): PromoBanner {
  return {
    id: b?.id,
    title: cleanText(b?.title) ?? '',
    description: cleanText(b?.description) ?? '',
    image: absUrl(b?.image) ?? '',
    is_active: b?.is_active !== false,
    start_date: b?.start_date ?? null,
    end_date: b?.end_date ?? null,
    partner: b?.partner_details ? normalizePartner(b.partner_details) : null,
  }
}

// ── Buyurtma ─────────────────────────────────────────────────────────────
const str = (v: any): string | null => {
  const s = v === null || v === undefined ? '' : String(v).trim()
  return s && s !== 'null' ? s : null
}

export function normalizeCourier(src: any): Courier | null {
  if (!src || typeof src !== 'object') return null
  let nested: any = null
  for (const k of ['courier', 'courier_details', 'courier_info', 'assigned_courier', 'driver']) {
    if (src[k] && typeof src[k] === 'object') {
      nested = src[k]
      break
    }
  }
  const user = nested?.user && typeof nested.user === 'object' ? nested.user : null
  const vehicle = nested?.vehicle && typeof nested.vehicle === 'object' ? nested.vehicle : null
  const fullName = (m: any) => {
    if (!m) return null
    const joined = [str(m.first_name), str(m.last_name)].filter(Boolean).join(' ')
    return str(m.full_name) || str(m.name) || joined || null
  }
  const name =
    fullName(nested) ||
    fullName(user) ||
    str(src.courier_name) ||
    str(src.courier_full_name) ||
    (typeof src.courier === 'string' ? str(src.courier) : null)
  const phone =
    str(nested?.phone) ||
    str(nested?.phone_number) ||
    str(user?.phone_number) ||
    str(src.courier_phone)
  const plate =
    str(vehicle?.license_plate) ||
    str(nested?.vehicle_number) ||
    str(nested?.plate_number) ||
    str(src.courier_vehicle_number)
  const desc = [str(vehicle?.color), str(vehicle?.brand), str(vehicle?.model)]
    .filter(Boolean)
    .join(' ')
  const avatar =
    str(nested?.avatar) || str(nested?.photo) || str(user?.avatar) || str(src.courier_avatar)
  const rating = toNumOrNull(nested?.rating ?? nested?.avg_rating ?? src.courier_rating)
  if (!name && !phone && !plate) return null
  return {
    full_name: name,
    phone,
    avatar: absUrl(avatar),
    rating: rating && rating > 0 ? rating : null,
    vehicle_type:
      str(vehicle?.transport_type) || str(nested?.vehicle_type) || str(src.courier_vehicle_type),
    vehicle_desc: desc || null,
    license_plate: plate,
  }
}

export function normalizeOrder(j: any): Order {
  const items: OrderItem[] = (Array.isArray(j?.items) ? j.items : []).map((i: any) => {
    const p = i?.product && typeof i.product === 'object' ? i.product : {}
    const img =
      Array.isArray(p.images) && p.images[0] ? absUrl(p.images[0].image) : absUrl(p.main_image)
    return {
      uuid: String(i?.uuid ?? p.uuid ?? Math.random()),
      name: str(p.name) || str(i?.name) || str(i?.product_name) || (i?.set ? 'Set' : 'Mahsulot'),
      image: img,
      // kg uchun kasr (1.5), shuning uchun parseFloat
      quantity: toNum(i?.quantity) || 1,
      unit: (p.unit === 'KG' || i?.unit === 'KG' ? 'KG' : 'PIECE') as ProductUnit,
      packaging_name: str(i?.packaging_name) || '',
      packaging_uuid: str(i?.packaging_uuid),
      pack_multiplier: toNum(i?.pack_multiplier) || 1,
      price: toNum(i?.price_at_time_of_order ?? p.price),
      free_quantity: toNumOrNull(i?.free_quantity),
      line_total:
        toNumOrNull(i?.line_total) ??
        Math.round(
          toNum(i?.price_at_time_of_order ?? p.price) *
            Math.max(0, (toNum(i?.quantity) || 1) - (toNumOrNull(i?.free_quantity) || 0))
        ),
      options: (Array.isArray(i?.options) ? i.options : []).map((o: any) => ({
        uuid: String(o?.option_uuid ?? ''),
        group_name: String(o?.group_name ?? ''),
        name: String(o?.name ?? ''),
        price_delta: toNum(o?.price_delta),
      })),
    }
  })
  // Hamkor turi: mahsulot → partner → partner_type
  let partnerType: 'RESTAURANT' | 'SHOP' = 'RESTAURANT'
  const partnerObj =
    j?.partner && typeof j.partner === 'object' ? j.partner : j?.partner_details || null
  const pt =
    str(j?.partner_type) ||
    str(partnerObj?.partner_type) ||
    (Array.isArray(j?.items)
      ? j.items.map((i: any) => i?.product?.partner?.partner_type).find(Boolean)
      : null)
  if (pt && String(pt).toUpperCase() === 'SHOP') partnerType = 'SHOP'
  const rLat = coord(j?.restaurant_latitude ?? partnerObj?.location_lat ?? partnerObj?.latitude)
  const rLng = coord(j?.restaurant_longitude ?? partnerObj?.location_long ?? partnerObj?.longitude)
  const dt = String(j?.delivery_type || 'DELIVERY').toUpperCase()
  return {
    id: typeof j?.id === 'number' ? j.id : null,
    uuid: String(j?.uuid ?? j?.id ?? ''),
    order_number: str(j?.order_number),
    status: String(j?.status || 'PENDING').toUpperCase(),
    delivery_type: dt === 'PICKUP' ? 'PICKUP' : 'DELIVERY',
    partner_type: partnerType,
    partner_name: str(j?.partner_name) || str(partnerObj?.name),
    partner_uuid: str(j?.partner_uuid) || str(partnerObj?.uuid),
    partner_address: cleanText(partnerObj?.address ?? j?.partner_address ?? j?.restaurant_address),
    partner_phone: str(partnerObj?.phone) || str(j?.partner_phone),
    restaurant_lat: rLat,
    restaurant_lng: rLng,
    address: cleanText(j?.address),
    lat: coord(j?.latitude),
    lng: coord(j?.longitude),
    contact_phone: str(j?.contact_phone),
    description: str(j?.description),
    total_price: toNum(j?.total_price),
    delivery_fee: toNum(j?.delivery_fee),
    discount_amount: toNumOrNull(j?.discount_amount ?? j?.discount),
    created_at: parseApiDate(j?.created_at),
    updated_at: parseApiDate(j?.updated_at),
    evaluation:
      typeof j?.evaluation === 'boolean'
        ? j.evaluation
        : typeof j?.evaluation === 'string'
          ? j.evaluation.toLowerCase() === 'true'
          : null,
    items,
    courier: normalizeCourier(j),
    raw: j,
  }
}

export function normalizeProfile(j: any): UserProfile | null {
  const d = unwrap(j)
  if (!d || typeof d !== 'object') return null
  const joined = [str(d.first_name), str(d.last_name)].filter(Boolean).join(' ')
  return {
    id: d.id,
    uuid: d.uuid,
    full_name: str(d.full_name) || joined || '',
    phone_number: str(d.phone_number) || str(d.phone) || '',
    email: str(d.email) || undefined,
    avatar: absUrl(d.avatar),
    telegram_id: str(d.telegram_id),
  }
}

export function normalizeAddress(a: any): UserAddress {
  return {
    id: String(a?.uuid ?? a?.id ?? ''),
    name: str(a?.name) || str(a?.title) || str(a?.address_type) || 'Manzil',
    address: str(a?.address) || str(a?.full_address) || str(a?.street) || '',
    lat: coord(a?.latitude ?? a?.lat),
    lng: coord(a?.longitude ?? a?.lng),
    is_default: a?.is_default === true || a?.is_primary === true,
    raw: a,
  }
}

export function normalizeSearchProduct(p: any) {
  return {
    uuid: String(p?.uuid ?? ''),
    name: String(p?.name ?? ''),
    price: toNum(p?.price),
    discount: Math.round(toNum(p?.discount)),
    image: absUrl(p?.main_image),
    partner_uuid: String(p?.partner_uuid ?? ''),
    partner_name: String(p?.partner_name ?? ''),
    partner_type: (String(p?.partner_type || '').toUpperCase() === 'SHOP'
      ? 'SHOP'
      : 'RESTAURANT') as 'SHOP' | 'RESTAURANT',
    partner_logo: absUrl(p?.partner_logo),
  }
}

export function normalizeNotification(j: any): UserNotification {
  const type = ['ORDER_STATUS', 'PROMO', 'SYSTEM'].includes(j?.type) ? j.type : 'SYSTEM'
  return {
    uuid: String(j?.uuid ?? ''),
    type,
    title: String(j?.title ?? ''),
    body: String(j?.body ?? ''),
    data: j?.data && typeof j.data === 'object' ? j.data : {},
    is_read: j?.is_read === true,
    created_at: parseApiDate(j?.created_at),
  }
}

export function normalizeNotificationsPage(body: any): NotificationsPage {
  const d = unwrap<any>(body) || {}
  return {
    count: toNum(d.count),
    unread_count: toNum(d.unread_count),
    next_offset: typeof d.next_offset === 'number' ? d.next_offset : null,
    results: (Array.isArray(d.results) ? d.results : []).map(normalizeNotification),
  }
}
