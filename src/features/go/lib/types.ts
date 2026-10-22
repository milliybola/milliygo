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

export interface Cuisine {
  uuid: string
  name: string
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
  /** Hamkor belgilagan taxminiy yetkazish vaqti (daqiqa) */
  delivery_time_minutes: number | null
  delivery_zones: DeliveryZone[]
  /** Oshxona yo'nalishlari (Fastfud, Pitsa...) */
  cuisines: Cuisine[]
  /** Maskan qo'shilgan vaqt (API: "20-10-2026 18:21:32") — "Yangi" belgisi uchun */
  created_at: string | null
}

/** GET /partner/ server filtrlari (yoqilgani "true" bo'lib yuboriladi) */
export interface PartnerFilters {
  /** 30 daqiqagacha */
  fast?: boolean
  /** Tun-u kun */
  all_day?: boolean
  /** Reyting 4.5+ */
  top_rated?: boolean
  /** Aksiya (chegirmali mahsuloti bor) */
  promo?: boolean
  /** Bepul yetkazish */
  free_delivery?: boolean
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

/** Mijoz tanlaydigan opsiya (sous, o'lcham, set ichidagi tanlov) */
export interface ProductOption {
  uuid: string
  name: string
  /** So'mda qo'shimcha narx (0 — bepul) */
  price_delta: number
  is_available: boolean
}

/** Tanlov guruhi: min_select >= 1 — majburiy; max_select — ko'pi bilan nechta */
export interface ProductOptionGroup {
  uuid: string
  name: string
  min_select: number
  max_select: number
  options: ProductOption[]
}

/** Savatga/buyurtmaga tushgan tanlangan opsiya */
export interface SelectedOption {
  /** Buyurtmada yuboriladigan opsiya uuid'si */
  uuid: string
  group_name: string
  name: string
  price_delta: number
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
  /** SET — kombo (menyuda alohida "Setlar" bo'limida ko'rsatiladi) */
  kind?: 'SINGLE' | 'SET'
  option_groups: ProductOptionGroup[]
  /** Sotuv birligi: dona yoki kilogramm (narx — 1 dona/kg uchun) */
  unit: ProductUnit
  /** Miqdor qadami (dona 1, kg masalan 0.1) va eng kam miqdor */
  step: number
  min_quantity: number
  barcode?: string
  brand?: string
  /** Boshqa o'lchamda sotilishi: quti, blok, xalta */
  packagings: ProductPackaging[]
  /** Qoldiq (faqat do'kon): null — cheklanmagan, 0 — tugagan */
  stock_quantity: number | null
}

export type ProductUnit = 'PIECE' | 'KG'

/** Qadoq (quti): `multiplier` dona (yoki kg) ichida, `price` — 1 qadoq narxi */
export interface ProductPackaging {
  uuid: string
  name: string
  multiplier: number
  price: number
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
  /** Mijoz tanlaydigan qismlar: "Sok (2 ta tanlang)", "Sous" */
  option_groups?: ProductOptionGroup[]
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
  /** Tanlangan opsiyalar; `price` ularning narxini ham o'z ichiga oladi */
  options?: SelectedOption[]
  /** Miqdor birligi va qadami (kg uchun kasr); qadoq tanlangan bo'lsa `quantity` — qadoqlar soni */
  unit?: ProductUnit
  step?: number
  min_quantity?: number
  /** Tanlangan qadoq (quti); `price` — 1 qadoq narxi */
  packaging?: { uuid: string; name: string; multiplier: number }
  /** Qatorda ko'pi bilan nechta (qoldiqdan kelib chiqib), null — cheklanmagan */
  max_quantity?: number | null
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
  /** Qator summasi (server: price × quantity − aksiya chegirmasi) */
  line_total: number
  options: SelectedOption[]
  unit: ProductUnit
  /** Qadoq (quti) bilan sotilgan bo'lsa nomi va uuid'i; `quantity` — qadoqlar soni */
  packaging_name: string
  packaging_uuid: string | null
  pack_multiplier: number
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
  /** Ulashilgan (kirishsiz) havola orqali olingan — narxlar, telefon va to'liq manzil yo'q */
  is_public?: boolean
  raw: any
}

/** GET /orders/track/<uuid>/ natijasi */
export type PublicOrderResult =
  | { state: 'ok'; order: Order }
  /** Buyurtma yakunlangan/bekor qilingan — havola yopilgan (410) */
  | { state: 'finished'; status: string }
  | { state: 'missing' }

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

/** Mijoz bildirishnomasi (headerdagi qo'ng'iroqcha ro'yxati): GET /notifications/ */
export interface UserNotification {
  uuid: string
  type: 'ORDER_STATUS' | 'PROMO' | 'SYSTEM'
  title: string
  body: string
  /** Bosilganda qayerga o'tish: order_uuid, partner_uuid va h.k. */
  data: Record<string, any>
  is_read: boolean
  created_at: Date | null
}

export interface NotificationsPage {
  count: number
  unread_count: number
  /** Keyingi sahifa boshlanishi; null — tugadi */
  next_offset: number | null
  results: UserNotification[]
}
