import Link from 'next/link'
import { useRef, useState } from 'react'
import type { Order } from '../lib/types'
import { orderStatus } from '../lib/status'
import { cx, distanceKm } from '../lib/utils'
import { IconChevronRight } from '../ui/icons'

export const orderHref = (o: Order) => `/orders/track/?uuid=${o.uuid}`

/** Taxminiy yetib kelish vaqti ("5-7 daq"): masofa × 1.3 (~20 km/soat) + bosqichga qarab qolgan vaqt (superapp `_eta`) */
function eta(o: Order): string | null {
  if (o.lat == null || o.lng == null || o.restaurant_lat == null || o.restaurant_lng == null)
    return null
  const km = distanceKm(o.restaurant_lat, o.restaurant_lng, o.lat, o.lng)
  if (!Number.isFinite(km)) return null
  const travel = Math.ceil(((km * 1.3) / 20) * 60)
  const s = (o.status || '').toUpperCase()
  const extra = ['PICKED_UP', 'DELIVERING', 'ON_THE_WAY'].includes(s)
    ? 0
    : ['PICKUP_IN_PROGRESS', 'READY', 'READY_FOR_PICKUP'].includes(s)
      ? 5
      : ['ASSIGNED', 'COURIER_ACCEPTED'].includes(s)
        ? 8
        : ['PREPARING', 'COOKING'].includes(s)
          ? 12
          : s === 'PENDING'
            ? 20
            : 15
  const lo = Math.max(3, travel + extra)
  return `${lo}-${lo + (lo < 10 ? 2 : 5)} daq`
}

/** Holatga mos do'stona sarlavha va izoh (superapp `_texts`) */
function texts(o: Order): [string, string] {
  const s = (o.status || '').toUpperCase()
  if (o.delivery_type === 'PICKUP') {
    if (s === 'PENDING') return ['Buyurtma yuborildi', 'Restoran tasdiqlashini kutyapmiz']
    if (s === 'ACCEPTED' || s === 'CONFIRMED')
      return ['Buyurtma qabul qilindi', 'Tez orada tayyorlanadi']
    if (s === 'READY' || s === 'READY_FOR_PICKUP')
      return ['Buyurtmangiz tayyor!', 'Restoranga borib oling']
    return ['Tayyorlanmoqda', 'Restoranda tayyorlanmoqda']
  }
  switch (s) {
    case 'PENDING':
      return ['Buyurtma yuborildi', 'Restoran tasdiqlashini kutyapmiz']
    case 'ACCEPTED':
    case 'CONFIRMED':
      return ['Buyurtma qabul qilindi', 'Restoran tayyorlashni boshlaydi']
    case 'SEARCHING_COURIER':
      return ['Kuryer qidirilmoqda', 'Yaqin atrofdagi kuryerni topyapmiz']
    case 'PREPARING':
    case 'COOKING':
      return ['Tayyorlanmoqda', 'Oshpazlar ishga kirishdi']
    case 'ASSIGNED':
    case 'COURIER_ACCEPTED':
      return ['Kuryer biriktirildi', "Kuryer restoranga yo'lda"]
    case 'READY':
    case 'READY_FOR_PICKUP':
      return ['Buyurtma tayyor', 'Kuryer olib ketishini kutmoqda']
    case 'PICKUP_IN_PROGRESS':
      return ['Kuryer restoranda', 'Buyurtmangizni olmoqda']
    case 'PICKED_UP':
    case 'DELIVERING':
    case 'ON_THE_WAY':
      return ["Buyurtmangiz yo'lda", 'Kuryer yaqinlashmoqda']
    default:
      return [orderStatus(o).label, o.partner_name || 'Buyurtma']
  }
}

function Card({ o, className }: { o: Order; className?: string }) {
  const st = orderStatus(o)
  const pickup = o.delivery_type === 'PICKUP'
  const [title, sub] = texts(o)
  const accent = pickup ? '#2563EB' : '#15803D'
  return (
    <Link
      href={orderHref(o)}
      className={cx(
        'flex h-[72px] items-center rounded-[20px] text-inherit no-underline',
        pickup ? 'bg-[#EAF2FF]' : 'bg-[#E6F6EC]',
        className
      )}
    >
      <span className="flex h-full w-20 shrink-0 items-center justify-center">
        {pickup ? (
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#2563EB]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M6 8h12l1 12H5L6 8zm3-1a3 3 0 0 1 6 0h-2a1 1 0 0 0-2 0H9z" />
            </svg>
          </span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/go/kuryer.webp"
            alt=""
            className="h-full w-full object-contain py-[5px] pl-2 pr-1.5"
          />
        )}
      </span>
      <span className="ml-3 min-w-0 flex-1">
        <span className="block truncate text-[0.906rem] font-[800] leading-[1.2] text-[#111]">
          {title}
        </span>
        <span className="mt-0.5 block truncate text-[0.75rem] leading-[1.2] text-[#7B8AA3]">
          {sub}
        </span>
        <span
          className="mt-[7px] block h-[5px] w-[82%] overflow-hidden rounded-[4px]"
          style={{ background: `${accent}24` }}
        >
          <span
            className="block h-full rounded-[4px] transition-[width] duration-[900ms] ease-out"
            style={{ width: `${Math.round(st.progress * 100)}%`, background: accent }}
          />
        </span>
      </span>
      <span
        className={cx(
          'ml-2.5 mr-2.5 flex shrink-0 items-center rounded-[18px] py-2 pl-3 pr-1.5 text-[0.844rem] font-[800] text-[#111]',
          pickup ? 'bg-[#D6E6FF]' : 'bg-[#CDEED9]'
        )}
      >
        {pickup ? "Ko'rish" : eta(o) || 'Kuzatish'}
        <IconChevronRight size={18} />
      </span>
    </Link>
  )
}

/**
 * Faol buyurtmalar (Home va Profil uchun bitta komponent, superapp ActiveOrdersStrip):
 * bitta buyurtma — bitta karta; bir nechta — varaqlanadigan karusel (keyingisi chetidan ko'rinadi),
 * pastida nuqtalar va "1 / 3 faol buyurtma".
 */
export default function ActiveOrdersStrip({ orders }: { orders: Order[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [idx, setIdx] = useState(0)
  if (!orders.length) return null
  if (orders.length === 1) return <Card o={orders[0]} />

  const onScroll = () => {
    const el = ref.current
    const first = el?.children[0] as HTMLElement | undefined
    const second = el?.children[1] as HTMLElement | undefined
    if (!el || !first || !second) return
    const step = second.offsetLeft - first.offsetLeft
    setIdx(Math.min(orders.length - 1, Math.max(0, Math.round(el.scrollLeft / step))))
  }

  return (
    <div>
      <div
        ref={ref}
        onScroll={onScroll}
        className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto"
      >
        {orders.map((o) => (
          <Card key={o.uuid} o={o} className="w-[92%] shrink-0 snap-start sm:w-[420px]" />
        ))}
      </div>
      <div className="mt-2 flex items-center">
        {orders.map((o, i) => (
          <span
            key={o.uuid}
            className={cx(
              'mr-1 h-1.5 rounded-[3px] transition-all duration-200',
              i === idx ? 'w-4 bg-[#16A34A]' : 'w-1.5 bg-[#D1D5DB]'
            )}
          />
        ))}
        <span className="ml-auto text-[0.75rem] font-[600] text-[#6B7280]">
          {idx + 1} / {orders.length} faol buyurtma
        </span>
      </div>
    </div>
  )
}
