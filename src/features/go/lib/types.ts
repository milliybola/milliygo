/**
 * MilliyGo mijoz sayti — yagona tiplar.
 * API: https://mytizim.uz (javoblar ko'pincha `{ success, data }` konvertida keladi).
 * Set / 1+1 / 2+1 kontrakti: D:/Milliy/API_CONTRACT_SETS_PROMOS.md (backendda hali yo'q).
 */

export type PartnerType = 'RESTAURANT' | 'SHOP'
export type OrderMode = 'DELIVERY' | 'PICKUP'

export interface OpeningHours {
  mon?: boolean
  tue?: boolean
  wed?: boolean
  thu?: boolean
  fri?: boolean
  sat?: boolean
  sun?: boolean
  from_hour?: string | null
  to_hour?: string | null
}

export interface DeliveryZone {
  uuid: string
  name: string
  district?: string
  /** so'm; null — narx belgilanmagan */
  delivery_fee: number | null
  /** Backend bergan taxminiy vaqt (daqiqa) */
  estimated_minutes: number | null
  center?: [number, number]
  /** GeoJSON: [[[lng, lat], ...]] */
  coordinates: number[][][]
}

export interface Partner {
  uuid: string
  id?: number
  name: string
  description?: string
  /** Bo'sh yoki "." bo'lsa — null */
  address: string | null
  logo: string | null
  banner: string | null
  phone?: string | null
  slug?: string
  lat: number | null
  lng: number | null
  /** 0 — reyting yo'q */
  rating: number
  is_open: boolean
  partner_type: PartnerType
  opening_hours?: OpeningHours | null
  min_order_amount: number
  free_delivery_threshold: number
  delivery_fee: number
  delivery_zones: DeliveryZone[]
}

/** 1+1 / 2+1 (BUY_X_GET_Y) — mahsulot ichidagi qisqa ko'rinish */
export interface PromotionShort {
  uuid?: string
  type: 'BUY_X_GET_Y'
  buy_quantity: number
  get_quantity: number
  label?: string
}

/** To'liq aksiya obyekti: GET /partner/promotions/?partner=<uuid> */
export interface Promotion extends PromotionShort {
  uuid: string
  partner?: string
  products: string[]
  same_product?: boolean
  is_active?: boolean
  start_date?: string | null
  end_date?: string | null
}

export interface Product {
  uuid: string
  id?: number
  name: string
  description: string
  /** Asl narx (so'm) */
  price: number
  /** Sotuv narxi (chegirma bilan) — finalPrice orqali hisoblanadi */
  final_price: number
  /** Chegirma foizi (API `discount`), 0 — yo'q */
  discount: number
  image: string | null
  images: string[]
  is_available: boolean
  category_uuid?: string
  promotion?: PromotionShort | null
}

export interface ProductSetItem {
  product: string
  name: string
  image?: string | null
  quantity: number
}

/** Set (kombo): GET /partner/sets/?partner=<uuid> */
export interface ProductSet {
  uuid: string
  partner?: string
  name: string
  description?: string
  image: string | null
  price: number
  old_price?: number | null
  items: ProductSetItem[]
  is_active?: boolean
  start_date?: string | null
  end_date?: string | null
}

export interface MenuCategory {
  uuid: string
  /** base category uuid */
  base_uuid?: string
  name: string
  logo: string | null
  category_type?: string
  products: Product[]
}

export interface BaseCategory {
  uuid: string
  name: string
  logo: string | null
  category_type?: string
  partner_uuids: string[]
}

export interface PromoBanner {
  id: number
  title: string
  description: string
  image: string
  is_active: boolean
  start_date?: string | null
  end_date?: string | null
  partner: Partner | null
}

/** Savat qatori: mahsulot yoki set */
export interface CartLine {
  key: string
  kind: 'product' | 'set'
  uuid: string
  name: string
  image: string | null
  /** Bir dona sotuv narxi */
  price: number
  /** Chizilgan eski narx (bo'lsa) */
  old_price?: number | null
  quantity: number
  promotion?: PromotionShort | null
  set_items?: ProductSetItem[]
}

export interface PartnerCart {
  partner: Partner
  lines: CartLine[]
  mode: OrderMode
  comment?: string
  cutlery?: number | null
  updatedAt: number
}

export interface Courier {
  full_name: string | null
  phone: string | null
  avatar: string | null
  rating: number | null
  vehicle_type: string | null
  /** "Oq Chevrolet Cobalt" */
  vehicle_desc: string | null
  license_plate: string | null
}

export interface OrderItem {
  uuid: string
  name: string
  image: string | null
  quantity: number
  price: number
  /** server qaytarsa (kontrakt) */
  free_quantity?: number | null
}

export interface Order {
  id: number | null
  uuid: string
  order_number: string | null
  status: string
  delivery_type: OrderMode
  partner_type: PartnerType
  partner_name: string | null
  partner_uuid: string | null
  partner_address: string | null
  partner_phone: string | null
  restaurant_lat: number | null
  restaurant_lng: number | null
  address: string | null
  lat: number | null
  lng: number | null
  contact_phone: string | null
  description: string | null
  total_price: number
  delivery_fee: number
  discount_amount: number | null
  created_at: Date | null
  updated_at: Date | null
  evaluation: boolean | null
  items: OrderItem[]
  courier: Courier | null
  raw: any
}

export interface UserProfile {
  id?: number
  uuid?: string
  full_name: string
  phone_number: string
  email?: string
  avatar?: string | null
  telegram_id?: string | null
}

export interface UserAddress {
  id: string
  name: string
  address: string
  lat: number | null
  lng: number | null
  is_default: boolean
  raw: any
}

export interface SearchResult {
  partners: Partner[]
  products: {
    uuid: string
    name: string
    price: number
    discount: number
    image: string | null
    partner_uuid: string
    partner_name: string
    partner_type: PartnerType
    partner_logo: string | null
  }[]
}
