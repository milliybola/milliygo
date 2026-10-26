import { Map, Placemark } from '@pbe/react-yandex-maps'
import { message } from 'antd'
import { useQueryClient } from '@tanstack/react-query'
import Head from 'next/head'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { SUPPORT_TELEGRAM } from '../layout/GoFooter'
import { cancelOrder, fetchCheckoutUrl } from '../lib/api'
import { usePartner, useOrder, usePublicOrder } from '../lib/queries'
import { useQueryParam } from '../lib/route'
import { useHydrated, useSession, useStorageValue } from '../lib/session'
import { orderNumber, orderStatus } from '../lib/status'
import type { CartLine, Order, Partner } from '../lib/types'
import { useOrderSocket } from '../lib/useOrderSocket'
import {
  cx,
  distanceKm,
  distanceLabel,
  etaRange,
  lineTotal,
  qtyLabel,
  som,
  workingHoursLabel,
  zoneFor,
} from '../lib/utils'
import {
  IconCash,
  IconChat,
  IconCheck,
  IconChevronRight,
  IconHome,
  IconNavigate,
  IconPhone,
  IconScooter,
  IconShare,
  IconStore,
  IconTruck,
  IconWalk,
} from '../ui/icons'
import { Button, EmptyState, Img, Skeleton } from '../ui/primitives'
import RouteSheet from '../components/RouteSheet'
import { LAST_ORDER_KEY } from './CheckoutPage'

interface Snapshot {
  uuid: string
  order_number: string | null
  partner: Partner
  mode: 'DELIVERY' | 'PICKUP'
  total: number
  lines: CartLine[]
  created: number
}

function useSnapshot(uuid?: string): Snapshot | null {
  const raw = useStorageValue(LAST_ORDER_KEY, 'session')
  return useMemo(() => {
    try {
      const s = JSON.parse(raw || 'null')
      return s && uuid && String(s.uuid) === uuid ? (s as Snapshot) : null
    } catch {
      return null
    }
  }, [raw, uuid])
}

function copy(text: string, ok: string) {
  navigator.clipboard?.writeText(text).then(() => message.success(ok))
}

const GREEN = '#15803D'
const hhmm = (d: Date) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
const card = 'rounded-[22px] bg-white p-3.5 shadow-[0_4px_16px_rgba(0,0,0,0.04)]'

const PotIcon = ({ size = 19 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.9}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M4 12h14v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-3zM18 13h2a2 2 0 0 1 0 4h-2M8 4c0 1.5 1 1.5 1 3M12 3c0 1.5 1 1.5 1 4" />
  </svg>
)

/** Superapp `_buildTimeline`: 4 bosqich, faol bosqich yumshoq halqa bilan, chiziq yarmigacha yashil */
function Timeline({
  stage,
  pickup,
  startedAt,
  arrival,
}: {
  stage: number
  pickup: boolean
  startedAt: Date | null
  arrival: string | null
}) {
  const labels = pickup
    ? ['Qabul', 'Tayyorlanmoqda', 'Tayyor', 'Olib ketildi']
    : ['Qabul', 'Tayyor', "Yo'lda", 'Yetkazildi']
  const icons = [
    <IconCheck key="a" size={19} />,
    <PotIcon key="b" />,
    pickup ? <IconStore key="c" size={19} /> : <IconTruck key="c" size={19} />,
    pickup ? <IconWalk key="d" size={19} /> : <IconHome key="d" size={19} />,
  ]
  const times = [
    startedAt ? hhmm(startedAt) : '',
    '',
    '',
    stage < 3 && arrival ? `~${arrival}` : '',
  ]
  const line = (cls: string) => <span className={cx('block h-[5px] flex-1', cls)} />
  return (
    <div className="flex items-start">
      {labels.map((label, i) => {
        const done = i < stage || (i === stage && i === 3)
        const active = i === stage && !done
        return (
          <div key={label} className="contents">
            <div className="flex flex-col items-center">
              <span
                className={cx(
                  'flex h-[46px] items-center justify-center',
                  active ? 'w-[46px]' : 'w-[36px]'
                )}
              >
                <span className="relative flex h-[46px] w-[46px] items-center justify-center">
                  {active && (
                    <span
                      className="absolute inset-0 rounded-full"
                      style={{ background: `${GREEN}2E` }}
                    />
                  )}
                  <span
                    className={cx(
                      'relative flex h-9 w-9 items-center justify-center rounded-full',
                      done || active ? 'bg-[#15803D] text-white' : 'bg-[#E5E7EB] text-[#6B7280]'
                    )}
                  >
                    {done ? <IconCheck size={19} /> : icons[i]}
                  </span>
                </span>
              </span>
              <span
                className={cx(
                  'mt-1.5 text-[0.875rem]',
                  active
                    ? 'font-[600] text-[#15803D]'
                    : done
                      ? 'font-[500] text-[#111827]'
                      : 'font-[500] text-[#6B7280]'
                )}
              >
                {label}
              </span>
              <span
                className={cx(
                  'mt-1.5 min-h-[1.1em] text-[0.781rem]',
                  active ? 'font-[800] text-[#15803D]' : 'font-[500] text-[#6B7280]'
                )}
              >
                {active ? 'Hozir' : times[i]}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div className="flex flex-1 pt-[20.5px]">
                {i < stage ? (
                  line('bg-[#15803D]')
                ) : i === stage && stage < 3 ? (
                  <>
                    {line('bg-[#15803D]')}
                    {line('bg-[#E5E7EB]')}
                  </>
                ) : (
                  line('bg-[#E5E7EB]')
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function plateParts(raw?: string | null): [string, string] | null {
  const s = (raw || '').replace(/\s+/g, '').toUpperCase()
  if (!s) return null
  const m = s.match(/^(\d{2})(.+)$/)
  if (!m) return ['', s]
  return [m[1], m[2].replace(/(?<=[A-Z])(?=\d)|(?<=\d)(?=[A-Z])/g, ' ')]
}

function CourierCard({ order, shared }: { order: Order; shared?: boolean }) {
  const c = order.courier
  if (!c || !(c.full_name || c.phone || c.license_plate)) return null
  const plate = plateParts(c.license_plate)
  return (
    <div className={card}>
      <div className="flex items-center gap-3.5">
        <span className="flex h-[70px] w-[70px] shrink-0 items-center justify-center rounded-full border-[3px] border-solid border-[#15803D]/25 p-[3px]">
          {c.avatar ? (
            <Img src={c.avatar} alt="" className="h-full w-full rounded-full" />
          ) : (
            <span className="flex h-full w-full items-center justify-center rounded-full bg-[#DCFCE7] text-[#15803D]">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7z" />
              </svg>
            </span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[1.0625rem] font-[600] text-[#111827]">
            {c.full_name || 'Kuryer'}
          </div>
          <div className="mt-1 text-[0.8125rem] font-[500] text-[#6B7280]">
            {shared ? 'Buyurtma kuryeri' : 'Sizning kuryeringiz'}
          </div>
          {c.rating ? (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-solid border-[#FDE68A] bg-[#FEF9C3] px-2.5 py-1 text-[0.8125rem] font-[600] text-[#111827]">
              <span className="text-[#713F12]">★</span> {c.rating.toFixed(1)}
            </span>
          ) : null}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[#15803D]">
          <IconScooter size={20} />
        </span>
        <span className="min-w-0 flex-1 truncate text-[0.938rem] font-[500] text-[#111827]">
          {c.vehicle_desc || c.vehicle_type || 'Skuter'}
        </span>
        {plate && (
          <span className="text-[0.719rem] font-[600] tracking-[1px] text-[#6B7280]">
            DAVLAT RAQAMI
          </span>
        )}
      </div>
      {plate && (
        <div className="mt-2.5 inline-flex items-center rounded-lg border-[1.6px] border-solid border-[#111827] bg-white px-3 py-1.5">
          {plate[0] && (
            <>
              <span className="text-[1rem] font-[800] text-[#111827]">{plate[0]}</span>
              <span className="mx-[9px] h-[18px] w-[1.5px] bg-[#CBD5E1]" />
            </>
          )}
          <span className="text-[1rem] font-[800] tracking-[1px] text-[#111827]">{plate[1]}</span>
          <span className="mx-[9px] h-[18px] w-px bg-[#E2E8F0]" />
          <span className="mr-1 text-[0.656rem] font-[800] text-[#6B7280]">UZ</span>
          <span className="flex flex-col gap-[2px]">
            <span className="h-[3px] w-4 bg-[#16A34A]" />
            <span className="h-[3px] w-4 bg-[#16A34A]" />
          </span>
        </div>
      )}
    </div>
  )
}

function Stop({
  icon,
  bg,
  fg,
  title,
  sub,
  trailing,
}: {
  icon: React.ReactNode
  bg: string
  fg: string
  title: string
  sub?: string | null
  trailing?: string | null
}) {
  return (
    <div className="flex items-start gap-3.5">
      <span
        className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full"
        style={{ background: bg, color: fg }}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-start gap-2">
          <span className="min-w-0 flex-1 text-[1rem] font-[500] text-[#111827]">{title}</span>
          {trailing && (
            <span className="text-[0.875rem] font-[500] text-[#6B7280]">{trailing}</span>
          )}
        </div>
        {sub && (
          <div className="mt-1 text-[0.875rem] font-[500] leading-[1.35] text-[#4B5A47]">{sub}</div>
        )}
      </div>
    </div>
  )
}

function ItemsCard({
  order,
  snap,
  extraRows,
  footer,
  showPrices = true,
}: {
  order?: Order
  snap: Snapshot | null
  extraRows?: { label: string; value: string; green?: boolean }[]
  footer?: React.ReactNode
  /** Ulashilgan havolada narxlar ko'rsatilmaydi (backend ham bermaydi) */
  showPrices?: boolean
}) {
  const [open, setOpen] = useState(false)
  const items = order?.items.length
    ? order.items.map((i) => ({
        key: i.uuid,
        name: i.name,
        image: i.image,
        qty: i.quantity,
        // "1.5 kg", "2 × Quti", dona uchun "3 dona"
        label: i.unit === 'KG' || i.packaging_name ? qtyLabel(i) : `${i.quantity} dona`,
        countable: i.unit === 'KG' && !i.packaging_name ? 1 : Math.ceil(i.quantity),
        unit: i.price,
        total: i.line_total,
        free: i.free_quantity || 0,
        options: i.options.map((o) => o.name).join(', '),
      }))
    : (snap?.lines || []).map((l) => ({
        key: l.key,
        name: l.name,
        image: l.image,
        qty: l.quantity,
        label:
          l.unit === 'KG' || l.packaging
            ? qtyLabel({ quantity: l.quantity, unit: l.unit, packaging_name: l.packaging?.name })
            : `${l.quantity} dona`,
        countable: l.unit === 'KG' && !l.packaging ? 1 : Math.ceil(l.quantity),
        unit: l.price,
        total: lineTotal(l),
        free: 0,
        options: (l.options || []).map((o) => o.name).join(', '),
      }))
  if (!items.length) return null
  const sum = items.reduce((s, i) => s + i.total, 0)
  const count = items.reduce((s, i) => s + i.countable, 0)
  return (
    <div className={card}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent p-0 text-left"
      >
        <span className="text-[#15803D]">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.9}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6" />
          </svg>
        </span>
        <span className="min-w-0 flex-1 text-[1.0625rem] font-[700] leading-tight text-[#111827]">
          Buyurtma tarkibi
        </span>
        <span className="text-[0.938rem] font-[700] text-[#6B7280]">
          {count} ta{showPrices ? ` · ${som(sum)}` : ''}
        </span>
        <IconChevronRight
          size={22}
          className={cx(
            'shrink-0 text-[#111827] transition-transform',
            open ? '-rotate-90' : 'rotate-90'
          )}
        />
      </button>
      {!open ? (
        <div className="no-scrollbar -mx-1 mt-1.5 flex gap-3 overflow-x-auto px-1 pb-0.5 pt-2.5">
          {items.map((i) => (
            <div key={i.key} className="flex shrink-0 items-center gap-2.5">
              <span className="relative block h-12 w-12">
                <Img src={i.image} alt="" className="h-full w-full rounded-[12px]" />
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-solid border-white bg-[#15803D] px-1 text-[0.7rem] font-[800] text-white">
                  {i.label.replace(' dona', '')}
                </span>
              </span>
              <span className="max-w-[160px] truncate text-[0.875rem] text-[#6B7280]">
                {i.name}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="mt-3 border-0 border-t border-solid border-[#EEF0F2]">
            {items.map((i) => (
              <div key={i.key} className="flex items-start gap-3 py-3">
                <Img src={i.image} alt="" className="h-[60px] w-[60px] shrink-0 rounded-[14px]" />
                <div className="min-w-0 flex-1">
                  <div className="text-[1rem] font-[700] leading-tight text-[#111827]">
                    {i.name}
                  </div>
                  {i.options && (
                    <div className="mt-0.5 text-[0.8125rem] text-[#6B7280]">{i.options}</div>
                  )}
                  <div className="mt-1.5 flex items-center gap-2 text-[0.875rem] text-[#6B7280]">
                    <span className="rounded-lg bg-[#E6F4EA] px-2.5 py-1 font-[700] text-[#15803D]">
                      {i.label}
                    </span>
                    {showPrices && <span>× {som(i.unit)}</span>}
                  </div>
                  {i.free > 0 && (
                    <div className="mt-1 text-[0.781rem] font-[800] text-[#B45309]">
                      {i.free} tasi bepul
                    </div>
                  )}
                </div>
                {showPrices && (
                  <span className="shrink-0 text-[1rem] font-[700] text-[#111827]">
                    {som(i.total)}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div
            className={cx(
              'border-0 border-t border-solid border-[#EEF0F2] pt-2.5',
              !showPrices && 'hidden'
            )}
          >
            <div className="flex items-center justify-between py-0.5 text-[1rem] text-[#111827]">
              <span>Taomlar ({count} ta)</span>
              <b>{som(sum)}</b>
            </div>
            {extraRows?.map((r) => (
              <div
                key={r.label}
                className="flex items-center justify-between py-0.5 text-[1rem] text-[#111827]"
              >
                <span>{r.label}</span>
                <b className={r.green ? 'text-go-bright' : ''}>{r.value}</b>
              </div>
            ))}
            <div className="flex items-center justify-between py-1 text-[1.125rem] font-[700] text-[#111827]">
              <span>Jami</span>
              <b className="text-[1.25rem] text-[#15803D]">{som(sum)}</b>
            </div>
          </div>
        </>
      )}
      {footer && <div className="mt-3">{footer}</div>}
    </div>
  )
}

function TrackMap({
  order,
  partner,
  courierPos,
  pill,
}: {
  order: Order
  partner?: Partner | null
  courierPos: [number, number] | null
  pill: string
}) {
  const rest: [number, number] | null =
    order.restaurant_lat != null && order.restaurant_lng != null
      ? [order.restaurant_lat, order.restaurant_lng]
      : partner?.lat != null && partner?.lng != null
        ? [partner.lat, partner.lng]
        : null
  const client: [number, number] | null =
    order.lat != null && order.lng != null ? [order.lat, order.lng] : null
  const pts = [rest, client, courierPos].filter(Boolean) as [number, number][]
  if (!pts.length) return null
  const lats = pts.map((p) => p[0])
  const lngs = pts.map((p) => p[1])
  const bounds =
    pts.length > 1
      ? [
          [Math.min(...lats), Math.min(...lngs)],
          [Math.max(...lats), Math.max(...lngs)],
        ]
      : undefined
  return (
    <div className="relative h-[34vh] min-h-[220px] overflow-hidden rounded-b-[20px] lg:h-[320px] lg:rounded-[20px]">
      <Map
        state={bounds ? ({ bounds, margin: 50 } as any) : { center: pts[0], zoom: 15 }}
        width="100%"
        height="100%"
        options={{ suppressMapOpenBlock: true }}
      >
        {rest && (
          <Placemark
            geometry={rest}
            options={{ preset: 'islands#greenFoodIcon' }}
            properties={{ hintContent: 'Restoran' }}
          />
        )}
        {client && order.delivery_type === 'DELIVERY' && (
          <Placemark
            geometry={client}
            options={{ preset: 'islands#blueHomeIcon' }}
            properties={{ hintContent: 'Manzilingiz' }}
          />
        )}
        {courierPos && (
          <Placemark
            geometry={courierPos}
            options={{ preset: 'islands#orangeAutoCircleIcon' }}
            properties={{ hintContent: 'Kuryer' }}
          />
        )}
      </Map>
      <span className="pointer-events-none absolute left-3 top-3 inline-flex max-w-[calc(100%-24px)] items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[0.875rem] font-[700] text-[#111827] shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
        <span className="h-2 w-2 shrink-0 rounded-full bg-[#16A34A]" />
        <span className="truncate">{pill}</span>
      </span>
    </div>
  )
}

export default function OrderTrackPage() {
  const uuid = useQueryParam('uuid')
  const isNew = useQueryParam('new') === '1'
  const hydrated = useHydrated()
  const { isAuthenticated, openLogin } = useSession()
  const snap = useSnapshot(uuid)
  const ownQ = useOrder(isAuthenticated ? uuid : undefined, true)
  // Ulashilgan havola: kirmagan odam yoki boshqa odamning buyurtmasi (o'z so'rovi xato bergan) — ochiq API
  const viaPublic = !isAuthenticated || (ownQ.isError && !ownQ.data)
  const publicQ = usePublicOrder(uuid, viaPublic)
  const publicResult = publicQ.data
  const order = ownQ.data ?? (publicResult?.state === 'ok' ? publicResult.order : undefined)
  const isPublicView = !ownQ.data && !!order?.is_public
  const partnerQ = usePartner(order?.partner_uuid || snap?.partner?.uuid || undefined)
  const partner = partnerQ.data || snap?.partner || null
  const st = order ? orderStatus(order) : null
  const active = !!st && st.tone !== 'done' && st.tone !== 'cancelled'
  const socket = useOrderSocket(uuid, isAuthenticated && active && !isPublicView)
  const connected = socket.connected
  // Jonli WS faqat egasi uchun; ochiq ko'rinishda kuryerning oxirgi joylashuvi API javobidan olinadi
  const publicCourier = isPublicView ? order?.raw?.courier : null
  const publicLat = parseFloat(publicCourier?.latitude)
  const publicLng = parseFloat(publicCourier?.longitude)
  const courierPos: [number, number] | null =
    socket.courierPos ??
    (Number.isFinite(publicLat) && Number.isFinite(publicLng) ? [publicLat, publicLng] : null)
  const pickup = order ? order.delivery_type === 'PICKUP' : snap?.mode === 'PICKUP'
  const number = order
    ? orderNumber(order)
    : snap?.order_number || (uuid ? `#${uuid.slice(0, 8).toUpperCase()}` : '')
  const [routeOpen, setRouteOpen] = useState(false)
  const qc = useQueryClient()
  const [busy, setBusy] = useState(false)
  const statusKey = (order?.status || '').toUpperCase()
  const verifying = statusKey === 'VERIFYING'
  const awaitingPay = statusKey === 'AWAITING_PAYMENT'
  const payMethod = String(order?.raw?.payment_method || '')
  const rejectReason = String(order?.raw?.reject_reason || order?.raw?.cancel_reason || '')
  const onCancel = async () => {
    if (!uuid || busy) return
    setBusy(true)
    try {
      await cancelOrder(uuid)
      message.success('Buyurtma bekor qilindi')
      qc.invalidateQueries({ queryKey: ['go', 'order', uuid] })
      qc.invalidateQueries({ queryKey: ['go', 'orders'] })
    } catch (e: any) {
      message.error(e?.message || 'Bekor qilib bo‘lmadi')
    } finally {
      setBusy(false)
    }
  }
  const onPay = async () => {
    if (!uuid || busy) return
    setBusy(true)
    try {
      const url = await fetchCheckoutUrl(uuid, payMethod || 'payme')
      if (url) window.location.href = url
      else message.error("To'lov havolasi topilmadi")
    } catch (e: any) {
      message.error(e?.message || "To'lov sahifasini ochib bo'lmadi")
    } finally {
      setBusy(false)
    }
  }
  const trackUrl = useMemo(
    () =>
      typeof window !== 'undefined' && uuid
        ? `${window.location.origin}/orders/track/?uuid=${uuid}`
        : '',
    [uuid]
  )

  if (!hydrated) return null
  if (!uuid)
    return (
      <EmptyState
        emoji="🔎"
        title="Buyurtma topilmadi"
        action={<Button href="/orders/">Buyurtmalarim</Button>}
      />
    )

  const info = st || {
    label: 'Buyurtma qabul qilindi',
    stage: 0,
    progress: 0.1,
    tone: 'pending' as const,
    hint: undefined,
  }
  const cancelled = info.tone === 'cancelled'
  const done = info.tone === 'done'
  const zone = partner && order ? zoneFor(partner, order.lat, order.lng) : null
  const etaMin =
    zone?.estimated_minutes && zone.estimated_minutes > 0 ? zone.estimated_minutes : null
  const etaLabel = etaMin ? etaRange(etaMin)?.replace('daq', 'daq') : null
  const arrivalDate =
    order?.created_at && etaMin ? new Date(order.created_at.getTime() + etaMin * 60000) : null
  const arrival = arrivalDate ? hhmm(arrivalDate) : null
  const restAddress = order?.partner_address || partner?.address || null
  const restLat = order?.restaurant_lat ?? partner?.lat ?? null
  const restLng = order?.restaurant_lng ?? partner?.lng ?? null
  const distance =
    restLat != null && restLng != null && order?.lat != null && order?.lng != null
      ? distanceKm(restLat, restLng, order.lat, order.lng)
      : null
  const subtitle = cancelled
    ? 'Bekor qilingan'
    : done
      ? pickup
        ? 'Olib ketilgan'
        : 'Yetkazilgan'
      : pickup
        ? 'Faol olib ketish'
        : 'Faol yetkazib berish'

  const share = async () => {
    try {
      if (navigator.share)
        await navigator.share({ title: 'MilliyGo buyurtmamni kuzating', url: trackUrl })
      else copy(trackUrl, 'Havola nusxalandi')
    } catch {
      /* bekor */
    }
  }

  const topBar = (
    <div className="sticky top-0 z-[60] bg-[#FAF8F5] lg:top-[72px]">
      <div className="mx-auto flex w-full max-w-[720px] items-center gap-2 px-4 py-2.5 lg:max-w-[760px]">
        <button
          type="button"
          aria-label="Orqaga"
          onClick={() =>
            window.history.length > 1 ? window.history.back() : (window.location.href = '/orders/')
          }
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-1 text-[#1F2937]"
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="m15 5-7 7 7 7" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[1.0625rem] font-[800] text-[#1F2937]">Buyurtma holati</div>
          <div
            className={cx(
              'text-[0.75rem] font-[700]',
              cancelled ? 'text-go-red' : pickup ? 'text-go-blue' : 'text-[#16A34A]'
            )}
          >
            {subtitle}
          </div>
        </div>
        {trackUrl && (
          <button
            type="button"
            onClick={share}
            className="flex cursor-pointer items-center gap-1.5 rounded-[20px] border border-solid border-[#15803D]/25 bg-[#E8F5EC] px-3 py-2 text-[0.813rem] font-[700] text-[#15803D]"
          >
            <IconShare size={16} /> Ulashish
          </button>
        )}
      </div>
    </div>
  )

  const shell = (children: React.ReactNode) => (
    <div className="min-h-[70vh] bg-[#FAF8F5]">
      <Head>
        <title>{`Buyurtma ${number} — MilliyGo`}</title>
      </Head>
      {topBar}
      <div className="mx-auto w-full max-w-[720px] lg:max-w-[760px]">{children}</div>
    </div>
  )

  // Ochiq havola holatlari (kuzatuvchi buyurtma egasi emas)
  if (viaPublic && !order && !snap) {
    if (publicResult?.state === 'finished') {
      const failed = publicResult.status === 'CANCELLED' || publicResult.status === 'REJECTED'
      return shell(
        <EmptyState
          emoji={failed ? '🚫' : '✅'}
          title={failed ? 'Buyurtma bekor qilingan' : 'Buyurtma yetkazib berildi'}
          text="Kuzatish havolasi faqat buyurtma faol bo'lgan vaqtda ochiq turadi."
          action={<Button href="/">MilliyGo&apos;ga o&apos;tish</Button>}
        />
      )
    }
    if (publicResult?.state === 'missing') {
      return shell(
        <EmptyState
          emoji="🔎"
          title="Buyurtma topilmadi"
          text="Havola noto'g'ri yoki buyurtma hali tasdiqlanmagan. Buyurtma egasi bo'lsangiz, tizimga kiring."
          action={<Button onClick={openLogin}>Kirish</Button>}
        />
      )
    }
    if (publicQ.isError) {
      return shell(
        <EmptyState
          emoji="📭"
          title="Buyurtmani yuklab bo'lmadi"
          text="Internet bilan muammo bor. Qayta urinib ko'ring."
          action={<Button onClick={() => publicQ.refetch()}>Qayta urinish</Button>}
        />
      )
    }
    return shell(
      <div className="space-y-3 px-4">
        <Skeleton className="h-[220px]" />
        <Skeleton className="h-[140px]" />
      </div>
    )
  }
  if (!viaPublic && ownQ.isLoading && !snap) {
    return shell(
      <div className="space-y-3 px-4">
        <Skeleton className="h-[220px]" />
        <Skeleton className="h-[140px]" />
      </div>
    )
  }
  if (!viaPublic && ownQ.isError && !snap) {
    return shell(
      <EmptyState
        emoji="📭"
        title="Buyurtmani yuklab bo'lmadi"
        text="Buyurtma topilmadi yoki internet bilan muammo bor."
        action={<Button onClick={() => ownQ.refetch()}>Qayta urinish</Button>}
      />
    )
  }

  if (pickup) {
    const tone = info.tone
    const ready = tone === 'delivering'
    const colors = cancelled
      ? 'from-[#B91C1C] to-[#EF4444]'
      : ready
        ? 'from-[#D97706] to-[#F5B400]'
        : 'from-[#166534] to-[#16A34A]'
    const ptitle = cancelled
      ? info.label
      : ready
        ? 'Buyurtmangiz tayyor!'
        : done
          ? info.label
          : tone === 'pending'
            ? 'Buyurtma qabul qilindi'
            : info.label
    const psub = cancelled
      ? "Buyurtma bekor qilindi. Savollar bo'lsa, qo'llab-quvvatlash xizmatiga yozing."
      : ready
        ? 'Restoranga borib, buyurtma raqamini ayting.'
        : done
          ? 'Yoqimli ishtaha!'
          : "Restoran tayyorlaydi — o'zingiz olib ketasiz."
    const steps = ['Qabul qilindi', 'Tayyorlanmoqda', 'Tayyor', 'Olib ketildi']
    const hasRoute = restLat != null && restLng != null && !cancelled && !done
    const pAddress = restAddress && /[A-Za-zА-Яа-я0-9]/.test(restAddress) ? restAddress : null
    return (
      <div className="min-h-[70vh] bg-white">
        <Head>
          <title>{`Olib ketish ${number} — MilliyGo`}</title>
        </Head>
        <div className="sticky top-0 z-[60] bg-white lg:top-[72px]">
          <div className="mx-auto flex h-14 w-full max-w-[720px] items-center px-1.5 lg:max-w-[760px] lg:px-4">
            <button
              type="button"
              aria-label="Orqaga"
              onClick={() =>
                window.history.length > 1
                  ? window.history.back()
                  : (window.location.href = '/orders/')
              }
              className="flex h-11 w-11 cursor-pointer items-center justify-center border-0 bg-transparent text-[#111]"
            >
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M19 12H5M11 6l-6 6 6 6" />
              </svg>
            </button>
            <div className="flex-1 pr-11 text-center text-[1.125rem] font-[700] text-[#111]">
              Olib ketish
            </div>
          </div>
        </div>
        <div className="mx-auto w-full max-w-[720px] space-y-3.5 px-4 pb-[200px] pt-1 lg:max-w-[760px] lg:pb-8">
          <div
            className={cx(
              'rounded-[26px] bg-gradient-to-br px-[18px] pb-4 pt-[18px] text-white shadow-[0_8px_18px_rgba(22,101,52,0.28)]',
              colors
            )}
          >
            <div className="flex items-center gap-3.5">
              <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-white/[0.18]">
                {cancelled ? (
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.4}
                    strokeLinecap="round"
                    aria-hidden
                  >
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                ) : ready ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M6 8h12l1 12H5L6 8zm3-1a3 3 0 0 1 6 0h-2a1 1 0 0 0-2 0H9z" />
                  </svg>
                ) : done ? (
                  <IconCheck size={28} />
                ) : (
                  <PotIcon size={28} />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[1.3125rem] font-[900] leading-[1.15]">{ptitle}</div>
                <div className="mt-[3px] text-[0.844rem] leading-[1.3] text-white/[0.88]">
                  {psub}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => copy(number, 'Buyurtma raqami nusxalandi')}
              className="mt-3.5 inline-flex cursor-pointer items-center gap-2 rounded-[14px] border-0 bg-white/[0.18] px-3 py-2 text-white"
            >
              <span className="text-[0.813rem] text-white/85">Buyurtma raqami</span>
              <span className="text-[1.0625rem] font-[900] tracking-[0.5px]">{number}</span>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-85"
                aria-hidden
              >
                <rect x="9" y="9" width="12" height="12" rx="2" />
                <path d="M5 15V5a2 2 0 0 1 2-2h10" />
              </svg>
            </button>
            {!cancelled && (
              <>
                <div className="mt-4 flex gap-1">
                  {steps.map((s, i) => (
                    <span
                      key={s}
                      className="h-[5px] flex-1 overflow-hidden rounded-[3px] bg-white/25"
                    >
                      <span
                        className={cx(
                          'block h-full rounded-[3px] bg-white transition-[width] duration-500',
                          i <= info.stage ? 'w-full' : 'w-0'
                        )}
                      />
                    </span>
                  ))}
                </div>
                <div className="mt-1.5 flex">
                  {steps.map((s, i) => (
                    <span
                      key={s}
                      className={cx(
                        'min-w-0 flex-1 whitespace-nowrap text-[0.6875rem]',
                        i === 0 ? 'text-left' : i === 3 ? 'text-right' : 'text-center',
                        i === info.stage ? 'font-[800]' : 'font-[500]',
                        i <= info.stage ? 'text-white' : 'text-white/60'
                      )}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="overflow-hidden rounded-[22px] border border-solid border-[#ECEEF1] bg-white">
            {restLat != null && restLng != null && (
              <button
                type="button"
                aria-label="Restoranga yo'nalish"
                onClick={() => hasRoute && setRouteOpen(true)}
                className="relative block h-[140px] w-full cursor-pointer border-0 bg-transparent p-0"
              >
                <div className="pointer-events-none absolute inset-0">
                  <Map
                    state={{ center: [restLat, restLng], zoom: 16, controls: [] }}
                    width="100%"
                    height="100%"
                    options={{ suppressMapOpenBlock: true, yandexMapDisablePoiInteractivity: true }}
                    instanceRef={(m: any) =>
                      m &&
                      m.behaviors?.disable?.(['drag', 'scrollZoom', 'multiTouch', 'dblClickZoom'])
                    }
                  >
                    <Placemark
                      geometry={[restLat, restLng]}
                      options={{ preset: 'islands#greenShoppingCircleIcon' }}
                    />
                  </Map>
                </div>
              </button>
            )}
            <div className="flex items-center py-3.5 pl-4 pr-2">
              <div className="min-w-0 flex-1">
                <div className="text-[0.6875rem] font-[800] tracking-[0.6px] text-[#6B7280]">
                  QAYERDAN OLASIZ
                </div>
                <div className="mt-1 text-[1.0625rem] font-[800] text-[#111]">
                  {order?.partner_name || partner?.name || 'Restoran'}
                </div>
                {pAddress && (
                  <div className="mt-0.5 text-[0.875rem] leading-[1.3] text-[#374151]">
                    {pAddress}
                  </div>
                )}
                {partner && workingHoursLabel(partner) && (
                  <div className="mt-1.5 flex items-center gap-1 text-[0.813rem] text-[#6B7280]">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      aria-hidden
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                    {workingHoursLabel(partner)}
                  </div>
                )}
              </div>
              {pAddress && (
                <button
                  type="button"
                  aria-label="Manzilni nusxalash"
                  onClick={() => copy(pAddress, 'Manzil nusxalandi')}
                  className="flex h-11 w-11 cursor-pointer items-center justify-center border-0 bg-transparent text-[#111]"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <rect x="9" y="9" width="12" height="12" rx="2" />
                    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <ItemsCard
            order={order}
            snap={snap}
            showPrices={!isPublicView}
            extraRows={[{ label: 'Olib ketish', value: 'Bepul', green: true }]}
            footer={
              isPublicView ? undefined : (
                <div className="flex items-center gap-2 rounded-[14px] bg-[#FFF4CC] px-3 py-2.5 text-[0.8125rem] font-[600] text-[#78350F]">
                  <span className="shrink-0 text-[#92400E]">
                    <IconCash size={18} />
                  </span>
                  Naqd pulda — buyurtmani olayotganda restoranda to&apos;laysiz
                </div>
              )
            }
          />
        </div>

        {restLat != null && restLng != null && (
          <RouteSheet
            open={routeOpen}
            onClose={() => setRouteOpen(false)}
            lat={restLat}
            lng={restLng}
            label={partner?.name}
          />
        )}

        {(hasRoute || isNew) && (
          <div className="fixed inset-x-0 bottom-0 z-[60] lg:sticky lg:bottom-4 lg:px-4">
            <div className="mx-auto w-full max-w-[720px] rounded-t-[24px] bg-white px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-3px_16px_rgba(0,0,0,0.06)] lg:max-w-[560px] lg:rounded-[24px]">
              {hasRoute && (
                <button
                  type="button"
                  onClick={() => setRouteOpen(true)}
                  className="flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-[18px] border-0 bg-go-green text-[1.031rem] font-[800] text-white"
                >
                  <IconNavigate size={20} /> Restoranga borish
                </button>
              )}
              {isNew && (
                <div className={cx('flex gap-2.5', hasRoute && 'mt-2.5')}>
                  <Link
                    href="/orders/"
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[16px] bg-go-chip text-[0.906rem] font-[700] text-[#111] no-underline"
                  >
                    Buyurtmalarim
                  </Link>
                  <Link
                    href="/"
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[16px] bg-go-chip text-[0.906rem] font-[700] text-[#111] no-underline"
                  >
                    Bosh sahifa
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
  const itemsSum = (order?.items || []).reduce((s, i) => s + i.price * i.quantity, 0)
  const fee = order?.delivery_fee || 0
  const total = order ? order.total_price : snap?.total || 0

  return shell(
    <>
      {isPublicView && (
        <div className="px-3 pt-2.5">
          <div className="rounded-[14px] bg-[#EFF6FF] px-3.5 py-2.5 text-[0.8125rem] font-[600] text-go-blue">
            Siz ulashilgan buyurtmani kuzatyapsiz. Holat avtomatik yangilanadi; buyurtma
            yakunlangach havola yopiladi.
          </div>
        </div>
      )}
      {!pickup && order && active && (
        <TrackMap
          order={order}
          partner={partner}
          courierPos={courierPos}
          pill={`${info.label}${etaLabel ? ` • ~${etaLabel}` : ''}`}
        />
      )}

      {active && etaLabel && arrival && !pickup && (
        <div className="px-3 pt-2.5">
          <div className="flex items-center gap-3 rounded-[18px] bg-white px-3.5 py-3 shadow-[0_6px_16px_rgba(0,0,0,0.06)]">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#DCFCE7] text-[#16A34A]">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                aria-hidden
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[0.813rem] font-[800] text-[#0F172A]">
                Taxminiy yetib borish vaqti
              </span>
              <span className="mt-0.5 block text-[0.75rem] font-[600] text-[#6B7280]">
                {arrival} gacha ({etaLabel})
              </span>
            </span>
            <span className="rounded-full bg-[#DCFCE7] px-2.5 py-[5px] text-[0.688rem] font-[800] text-[#16A34A]">
              Tezkor
            </span>
          </div>
        </div>
      )}

      <div className="mt-2.5 space-y-2.5 rounded-t-[24px] border-0 border-t-[1.5px] border-solid border-[#EADBCE] bg-[#FAF9F6] px-3 pb-6 pt-3 shadow-[0_-8px_16px_rgba(0,0,0,0.05)]">
        {/* Holat kartasi */}
        <div className={cx(card, 'pb-3', cancelled && '!bg-[#FEF2F2]')}>
          <div className="flex items-center justify-between">
            <span className="text-[1.3125rem] font-[800] tracking-[-0.3px] text-[#111827]">
              Buyurtma holati
            </span>
            <span className="text-[0.844rem] font-[800] text-[#15803D]">{number}</span>
          </div>
          {cancelled ? (
            <p className="mb-1 mt-3 text-[0.938rem] font-[600] text-[#991B1B]">
              Buyurtma bekor qilindi.
              {rejectReason ? ` Sabab: ${rejectReason}.` : ''} Savollar bo&apos;lsa,
              qo&apos;llab-quvvatlash xizmatiga yozing.
            </p>
          ) : verifying || awaitingPay ? (
            <div className="mt-3 space-y-3">
              <div className="rounded-[14px] bg-[#FFF7ED] px-3 py-3 text-[0.875rem] font-[600] text-[#9A3412]">
                {verifying
                  ? "Buyurtmangiz qabul qilindi. Operator tez orada sizga qo'ng'iroq qilib tasdiqlaydi — iltimos, telefoningizni oching. Taxminan 20 daqiqa ichida bog'lana olmasak, buyurtma avtomatik bekor qilinadi."
                  : "Buyurtma tasdiqlandi. Davom etish uchun to'lovni yakunlang."}
              </div>
              {verifying && payMethod && payMethod.toUpperCase() !== 'CASH' && (
                <div className="text-[0.813rem] text-[#6B7280]">
                  Onlayn to&apos;lov tasdiqlangandan keyin so&apos;raladi.
                </div>
              )}
              {awaitingPay && !isPublicView && (
                <Button onClick={onPay} disabled={busy}>
                  To&apos;lovga o&apos;tish
                </Button>
              )}
              {!isPublicView && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={busy}
                  className="w-full rounded-[14px] border border-solid border-[#FCA5A5] bg-white py-2.5 text-[0.875rem] font-[700] text-[#B91C1C]"
                >
                  Buyurtmani bekor qilish
                </button>
              )}
            </div>
          ) : (
            <div className="mt-4">
              <Timeline
                stage={info.stage}
                pickup={!!pickup}
                startedAt={order?.created_at || (snap ? new Date(snap.created) : null)}
                arrival={arrival}
              />
            </div>
          )}
          {pickup && !cancelled && info.stage >= 2 && info.stage < 3 && (
            <div className="mt-3 rounded-[14px] bg-[#EFF6FF] px-3 py-2.5 text-[0.875rem] font-[600] text-go-blue">
              Buyurtmangiz tayyor! Restoranga borib, buyurtma raqamini ayting.
            </div>
          )}
          {isNew && info.stage === 0 && !cancelled && (
            <div className="mt-3 text-[0.813rem] text-[#6B7280]">
              Buyurtma qabul qilindi. {info.hint}
            </div>
          )}
          {active && (
            <div className="mt-3 flex items-center gap-2 text-[0.75rem] text-[#6B7280]">
              <span
                className={cx('h-2 w-2 rounded-full', connected ? 'bg-go-bright' : 'bg-go-amber')}
              />
              {connected ? 'Jonli yangilanmoqda' : 'Har 15 soniyada yangilanadi'}
            </div>
          )}
        </div>

        {order && !pickup && <CourierCard order={order} shared={isPublicView} />}

        {/* Yo'nalish tafsilotlari */}
        <div className={card}>
          <div className="mb-3 text-[0.813rem] font-[700] tracking-[0.8px] text-[#3F4F3A]">
            {pickup ? 'QAYERDAN OLASIZ' : "YO'NALISH TAFSILOTLARI"}
          </div>
          <Stop
            icon={<IconStore size={24} />}
            bg="#EEF0F2"
            fg="#15803D"
            title={order?.partner_name || partner?.name || 'Restoran'}
            sub={restAddress}
            trailing={!pickup && distance ? distanceLabel(distance) : null}
          />
          {!pickup && (
            <div className="mt-3">
              <Stop
                icon={
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.9}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M12 21s7-6.2 7-11.5a7 7 0 1 0-14 0C5 14.800 12 21 12 21z" />
                    <circle cx="12" cy="9.5" r="2.5" />
                  </svg>
                }
                bg="#FFD12B"
                fg="#5C4A12"
                title="Yetkazish manzili"
                sub={
                  isPublicView
                    ? 'Mijoz manzili ulashilmagan (xaritada taxminiy joy)'
                    : order?.address
                }
              />
            </div>
          )}
          {pickup && partner && workingHoursLabel(partner) && (
            <div className="mt-2 text-[0.844rem] text-[#6B7280]">
              Ish vaqti: {workingHoursLabel(partner)}
            </div>
          )}
          {pickup && !cancelled && restLat != null && restLng != null && (
            <Button variant="blue" block className="mt-3" onClick={() => setRouteOpen(true)}>
              <IconNavigate size={18} /> Restoranga borish
            </Button>
          )}
        </div>

        <ItemsCard order={order} snap={snap} showPrices={!isPublicView} />

        {/* To'lov tafsilotlari — ulashilgan havolada ko'rsatilmaydi */}
        <div className={cx(card, isPublicView && 'hidden')}>
          <div className="flex items-center">
            <span className="flex-1 text-[1.3125rem] font-[800] tracking-[-0.3px] text-[#111827]">
              To&apos;lov tafsilotlari
            </span>
          </div>
          <div className="mt-2.5 space-y-1 text-[0.938rem]">
            {itemsSum > 0 && (
              <div className="flex justify-between py-1">
                <span className="text-[#4B5A47]">Taomlar summasi</span>
                <span className="font-[500] text-[#111827]">{som(itemsSum)}</span>
              </div>
            )}
            {!pickup && (
              <div className="flex justify-between py-1">
                <span className="text-[#4B5A47]">Yetkazib berish xizmati</span>
                <span className="font-[500] text-[#111827]">{som(fee)}</span>
              </div>
            )}
            {order?.discount_amount ? (
              <div className="flex justify-between py-1 font-[800] text-[#15803D]">
                <span>Chegirma</span>
                <span>−{som(order.discount_amount)}</span>
              </div>
            ) : null}
          </div>
          <div className="mt-2.5 flex items-center rounded-[16px] bg-[#F3F4F6] px-[18px] py-5">
            <span className="flex-1 text-[1.1875rem] font-[700] text-[#111827]">
              Jami to&apos;lov
            </span>
            <span className="text-[1.3125rem] font-[800] text-[#15803D]">{som(total)}</span>
          </div>
          <div className="mt-2.5 flex items-center gap-2 text-[0.844rem] text-[#6B7280]">
            <IconCash size={16} /> Naqd pul
            {pickup ? " — buyurtmani olayotganda restoranda to'laysiz" : ''}
          </div>
        </div>

        {/* Pastki tugmalar */}
        <div className="flex gap-2.5 pt-1">
          {order?.courier?.phone && !pickup ? (
            <a
              href={`tel:${order.courier.phone}`}
              className="flex h-[52px] min-w-0 flex-1 items-center justify-center gap-2 rounded-[14px] bg-[#15803D] px-2 text-[0.875rem] font-[700] text-white no-underline"
            >
              <IconPhone size={19} />{' '}
              <span className="truncate">Kuryerga qo&apos;ng&apos;iroq</span>
            </a>
          ) : (
            <Link
              href={isPublicView ? '/' : '/orders/'}
              className="flex h-[52px] min-w-0 flex-1 items-center justify-center rounded-[14px] bg-[#15803D] px-2 text-[0.875rem] font-[700] text-white no-underline"
            >
              {isPublicView ? "MilliyGo'ga o'tish" : 'Buyurtmalarim'}
            </Link>
          )}
          <a
            href={SUPPORT_TELEGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[52px] min-w-0 flex-1 items-center justify-center gap-2 rounded-[14px] border border-solid border-[#15803D]/25 bg-[#E8F5EC] px-2 text-[0.875rem] font-[700] text-[#15803D] no-underline"
          >
            <IconChat size={19} /> <span className="truncate">Yordam xizmati</span>
          </a>
        </div>
      </div>
    </>
  )
}
