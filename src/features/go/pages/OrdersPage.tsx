import { message } from 'antd'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useMemo, useState, type ReactNode } from 'react'
import { orderHref } from '../components/ActiveOrdersStrip'
import { fetchPartner, fetchPartners } from '../lib/api'
import { productLine, useCart } from '../lib/cart'
import { normalizeProduct } from '../lib/normalize'
import { useOrders } from '../lib/queries'
import { useRequireLocation, useSession } from '../lib/session'
import { isOrderActive, orderNumber, orderStatus } from '../lib/status'
import type { Order, Partner } from '../lib/types'
import { cx, som } from '../lib/utils'
import { IconPhone, IconScooter, IconSearch, IconStore, IconWalk } from '../ui/icons'
import { Button, EmptyState, Sheet, Skeleton } from '../ui/primitives'
import Link from 'next/link'

const GREEN = '#15803D'
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
const pad = (n: number) => String(n).padStart(2, '0')
const hhmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`
const dateLong = (d: Date | null) =>
  d ? `${pad(d.getDate())}-${MONTHS[d.getMonth()]}, ${d.getFullYear()} • ${hhmm(d)}` : ''
const dateFull = (d: Date | null) =>
  d ? `${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${hhmm(d)}` : ''
const isToday = (d: Date | null) => !!d && d.toDateString() === new Date().toDateString()

const typeLabel = (t: string) => (t === 'SHOP' ? "Do'konlar" : t === 'RESTAURANT' ? 'Taomlar' : t)

async function resolvePartner(o: Order): Promise<Partner | null> {
  if (o.partner_uuid) {
    try {
      return await fetchPartner(o.partner_uuid)
    } catch {
      /* nom bo'yicha qidiramiz */
    }
  }
  if (!o.partner_name) return null
  const list = await fetchPartners({ partner_type: o.partner_type })
  return (
    list.find((p) => p.name.trim().toLowerCase() === o.partner_name!.trim().toLowerCase()) || null
  )
}

function DeliveryTag({ pickup }: { pickup: boolean }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-[3px] rounded-lg px-[7px] py-[3px] text-[0.6875rem] font-[800]',
        pickup ? 'bg-[#EFF6FF] text-[#2563EB]' : 'bg-[#ECFDF5] text-[#15803D]'
      )}
    >
      {pickup ? <IconWalk size={13} /> : <IconScooter size={13} />}
      {pickup ? 'Olib ketish' : 'Yetkazish'}
    </span>
  )
}

function SpotlightCard({ o }: { o: Order }) {
  const router = useRouter()
  const st = orderStatus(o)
  const pickup = o.delivery_type === 'PICKUP'
  const stage = Math.min(3, Math.max(0, st.stage))
  const accent = pickup ? '#2563EB' : GREEN
  const steps = pickup
    ? ['Qabul qilindi', 'Tayyorlanmoqda', 'Tayyor', 'Olib ketildi']
    : ['Qabul qilindi', 'Tayyorlanmoqda', "Yo'lda", 'Yetkazildi']
  const pill =
    st.tone === 'pending'
      ? 'bg-[#FFF7E6] text-[#B45309]'
      : st.tone === 'delivering'
        ? 'bg-[#FFF4CC] text-[#92400E]'
        : st.tone === 'cancelled'
          ? 'bg-[#FEF2F2] text-[#DC2626]'
          : 'bg-[#ECFDF5] text-[#15803D]'
  const itemsText = o.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')
  const c = o.courier
  const hasCourier = !pickup && !!c?.full_name
  const vehicle = [c?.vehicle_desc || c?.vehicle_type, c?.license_plate].filter(Boolean).join(' • ')
  const href = orderHref(o)
  return (
    <div
      onClick={() => router.push(href)}
      className="cursor-pointer rounded-[22px] border border-solid border-[#ECEEF1] bg-white p-4"
    >
      <div className="flex items-center gap-3">
        <span
          className={cx(
            'flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[14px]',
            pickup ? 'bg-[#EFF6FF] text-[#2563EB]' : 'bg-[#ECFDF5] text-[#15803D]'
          )}
        >
          {pickup ? (
            <IconWalk size={24} />
          ) : o.partner_type === 'SHOP' ? (
            <IconStore size={24} />
          ) : (
            <IconScooter size={24} />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[1.031rem] font-[800] text-[#0F172A]">
            {o.partner_name || 'Buyurtma'}
          </div>
          <div className="mt-0.5 text-[0.781rem] font-[600] text-[#64748B]">
            {orderNumber(o)}
            {o.created_at ? ` · ${isToday(o.created_at) ? 'bugun ' : ''}${hhmm(o.created_at)}` : ''}
          </div>
        </div>
        <span className="shrink-0 text-[1rem] font-[900] text-[#0F172A]">{som(o.total_price)}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <DeliveryTag pickup={pickup} />
        <span
          className={cx(
            'inline-flex items-center gap-[5px] rounded-lg px-2 py-[3px] text-[0.6875rem] font-[800]',
            pill
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {st.label}
        </span>
      </div>
      {itemsText && (
        <div className="mt-2.5 line-clamp-2 text-[0.844rem] leading-[1.35] text-[#374151]">
          {itemsText}
        </div>
      )}
      {hasCourier && (
        <div className="mt-2.5 flex items-center gap-2 rounded-[14px] bg-[#F8FAFC] px-3 py-2.5">
          <span className="text-[#94A3B8]">
            <IconScooter size={16} />
          </span>
          <span className="min-w-0 flex-1 truncate text-[0.781rem] font-[700] text-[#1F2937]">
            {vehicle ? `${c!.full_name} (${vehicle})` : c!.full_name}
          </span>
        </div>
      )}
      <div className="mt-4 flex gap-1">
        {steps.map((s, i) => (
          <span key={s} className="h-1.5 flex-1 overflow-hidden rounded-[3px] bg-[#E5E7EB]">
            <span
              className="block h-full rounded-[3px] transition-[width] duration-500"
              style={{ width: i <= stage ? '100%' : '0%', background: accent }}
            />
          </span>
        ))}
      </div>
      <div className="mt-2 flex items-center">
        <span className="flex-1 text-[0.813rem] font-[800]" style={{ color: accent }}>
          {steps[stage]}
        </span>
        <span className="text-[0.75rem] font-[600] text-[#94A3B8]">
          {stage + 1} / 4 · {steps[3]}
        </span>
      </div>
      <div className="mt-3.5 flex gap-2.5" onClick={(e) => e.stopPropagation()}>
        <Link
          href={href}
          className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-[14px] bg-[#15803D] px-2 text-[0.906rem] font-[800] text-white no-underline"
        >
          {pickup ? 'Buyurtma tafsilotlari' : 'Xaritada kuzatish'}
        </Link>
        {hasCourier && c?.phone && (
          <a
            href={`tel:${c.phone}`}
            aria-label="Kuryerga qo'ng'iroq"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#ECFDF5] text-[#15803D]"
          >
            <IconPhone size={20} />
          </a>
        )}
      </div>
    </div>
  )
}

function HistoryCard({
  o,
  onDetails,
  onReorder,
  busy,
}: {
  o: Order
  onDetails: () => void
  onReorder: () => void
  busy: boolean
}) {
  const router = useRouter()
  const st = orderStatus(o)
  const cancelled = st.tone === 'cancelled'
  const done = st.tone === 'done'
  const pill = cancelled
    ? 'bg-[#FEF2F2] text-[#EF4444]'
    : done
      ? 'bg-[#ECFDF5] text-[#16A34A]'
      : 'bg-[#FFF7E6] text-[#B45309]'
  const itemsText = o.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')
  return (
    <div
      onClick={() => router.push(orderHref(o))}
      className={cx(
        'cursor-pointer rounded-[20px] bg-white p-4 shadow-[0_5px_14px_rgba(0,0,0,0.025)]',
        cancelled && 'opacity-60'
      )}
    >
      <div className="flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate text-[0.938rem] font-[800] text-[#0F172A]">
          {o.partner_name || 'Buyurtma'}
        </span>
        <span className={cx('rounded-[10px] px-2 py-[3px] text-[0.625rem] font-[800]', pill)}>
          {done ? `✓ ${st.label}` : st.label}
        </span>
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <DeliveryTag pickup={o.delivery_type === 'PICKUP'} />
        <span className="min-w-0 flex-1 truncate text-[0.719rem] font-[600] text-[#6B7280]">
          {orderNumber(o)}
          {o.created_at ? ` · ${dateLong(o.created_at)}` : ''}
        </span>
      </div>
      <div className="mt-2 flex items-start gap-2">
        {itemsText ? (
          <span
            className={cx(
              'min-w-0 flex-1 truncate text-[0.781rem] font-[600] text-[#4B5563]',
              cancelled && 'line-through'
            )}
          >
            {itemsText}
          </span>
        ) : (
          <span className="flex-1" />
        )}
        <span
          className={cx(
            'text-[0.875rem] font-[900]',
            cancelled ? 'text-[#9CA3AF] line-through' : 'text-[#0F172A]'
          )}
        >
          {som(o.total_price)}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {cancelled ? (
          <button
            type="button"
            onClick={() => message.info("Bekor qilinish sababi tez orada qo'shiladi")}
            className="cursor-pointer border-0 bg-transparent p-0 text-[0.75rem] font-[700] text-[#6B7280] underline"
          >
            Sababini ko&apos;rish
          </button>
        ) : o.evaluation ? (
          <span className="inline-flex items-center gap-1 rounded-[10px] bg-[#ECFDF5] px-[9px] py-[5px] text-[0.6875rem] font-[700] text-[#16A34A]">
            ✓ Siz baholadingiz
          </span>
        ) : (
          <button
            type="button"
            onClick={() => message.info("Baholash tez orada qo'shiladi")}
            className="inline-flex cursor-pointer items-center gap-1 rounded-[10px] border border-solid border-[#E2E8F0] bg-[#F8FAFC] px-[9px] py-[5px] text-[0.6875rem] font-[700] text-[#64748B]"
          >
            ☆ Baholash
          </button>
        )}
        <span className="flex-1" />
        <button
          type="button"
          aria-label="Tafsilotlar"
          onClick={onDetails}
          className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[10px] border border-solid border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onReorder}
          disabled={busy}
          className="inline-flex cursor-pointer items-center gap-[5px] rounded-[10px] border-0 bg-[#16A34A] px-3 py-[9px] text-[0.719rem] font-[800] text-white disabled:opacity-60"
        >
          ↻ {busy ? 'Kuting…' : 'Qayta buyurtma'}
        </button>
      </div>
    </div>
  )
}

function InfoRow({
  icon,
  color,
  title,
  sub,
}: {
  icon: ReactNode
  color: string
  title: string
  sub: string
}) {
  return (
    <div className="flex items-start gap-3.5">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ background: `${color}14`, color }}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[0.75rem] font-[800] text-[#94A3B8]">{title}</div>
        <div className="mt-1 line-clamp-2 text-[0.875rem] font-[900] text-[#1F2937]">{sub}</div>
      </div>
    </div>
  )
}

function DetailsSheet({ o, onClose }: { o: Order | null; onClose: () => void }) {
  if (!o)
    return (
      <Sheet open={false} onClose={onClose}>
        {null}
      </Sheet>
    )
  const cancelled = orderStatus(o).tone === 'cancelled'
  const pickup = o.delivery_type === 'PICKUP'
  return (
    <Sheet open onClose={onClose} width={520}>
      <div className="flex items-start">
        <div className="min-w-0 flex-1">
          <div
            className={cx(
              'text-[1.25rem] font-[900] tracking-[-0.4px]',
              cancelled ? 'text-[#EF4444]' : 'text-[#16A34A]'
            )}
          >
            {cancelled
              ? o.status.toUpperCase() === 'REJECTED'
                ? 'Buyurtma rad etilgan'
                : 'Buyurtma bekor qilingan'
              : pickup
                ? 'Olib ketilgan'
                : 'Yetkazib berilgan'}
          </div>
          <div className="mt-1.5 text-[0.813rem] font-[800] text-[#94A3B8]">
            Buyurtma {orderNumber(o)}
          </div>
        </div>
        <span
          className={cx(
            'flex h-12 w-12 items-center justify-center rounded-full',
            cancelled ? 'bg-[#FEF2F2] text-[#EF4444]' : 'bg-[#ECFDF5] text-[#16A34A]'
          )}
        >
          {cancelled ? '✕' : '✓'}
        </span>
      </div>
      <div className="my-5 h-px bg-[#EADBCE]" />
      <div className="space-y-5">
        <InfoRow
          color="#3B82F6"
          title="Buyurtma vaqti"
          sub={dateFull(o.created_at)}
          icon={
            <svg
              width="20"
              height="20"
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
          }
        />
        <InfoRow
          color={pickup ? '#2563EB' : '#EF4444'}
          title={pickup ? 'Olib ketish' : 'Yetkazish manzili'}
          sub={pickup ? "Mijoz restorandan o'zi olib ketadi" : o.address || 'Manzil kiritilmagan'}
          icon={
            pickup ? (
              <IconWalk size={20} />
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M12 21s7-6.2 7-11.5a7 7 0 1 0-14 0C5 14.800 12 21 12 21z" />
                <circle cx="12" cy="9.5" r="2.5" />
              </svg>
            )
          }
        />
        <InfoRow
          color="#F59E0B"
          title={typeLabel(o.partner_type)}
          sub={o.partner_name || "Noma'lum"}
          icon={<IconStore size={20} />}
        />
      </div>
      <div className="mb-3 mt-7 text-[1rem] font-[900] text-[#16A34A]">Xarid tafsilotlari</div>
      <div className="rounded-[20px] border border-solid border-[#EADBCE] bg-[#FAF8F5] p-4">
        {o.items.length === 0 ? (
          <div className="py-1 text-[0.875rem] font-[700] text-[#94A3B8]">
            Mahsulotlar mavjud emas
          </div>
        ) : (
          o.items.map((i) => (
            <div key={i.uuid} className="flex items-center justify-between gap-3 py-1.5">
              <span className="min-w-0 flex-1 text-[0.875rem] font-[700] text-[#4B5563]">
                {i.quantity}x {i.name}
              </span>
              <span className="text-[0.875rem] font-[800] text-[#1F2937]">
                {som(i.price * i.quantity)}
              </span>
            </div>
          ))
        )}
        <div className="my-2.5 h-px bg-[#EADBCE]" />
        {!pickup && (
          <div className="flex items-center justify-between text-[0.875rem] font-[700] text-[#64748B]">
            <span>Yetkazib berish xizmati</span>
            <span className="font-[800] text-[#1F2937]">{som(o.delivery_fee)}</span>
          </div>
        )}
        <div className="my-3 h-px bg-[#EADBCE]" />
        <div className="flex items-center justify-between">
          <span className="text-[0.938rem] font-[900] text-[#16A34A]">Umumiy summa</span>
          <span className="text-[1.125rem] font-[900] text-[#16A34A]">{som(o.total_price)}</span>
        </div>
      </div>
    </Sheet>
  )
}

export default function OrdersPage() {
  const router = useRouter()
  const { isAuthenticated, openLogin } = useSession()
  const { orders, isLoading, isError, refetch } = useOrders({ poll: true })
  const setQty = useCart((s) => s.setQty)
  const setMode = useCart((s) => s.setMode)
  const [filter, setFilter] = useState<string>('ALL')
  const [newestFirst, setNewestFirst] = useState(true)
  const [searchOpen, setSearchOpen] = useState(false)
  const [q, setQ] = useState('')
  const [details, setDetails] = useState<Order | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const types = useMemo(() => {
    const t = Array.from(new Set(orders.map((o) => o.partner_type)))
    return t.sort((a, b) =>
      a === 'RESTAURANT'
        ? -1
        : b === 'RESTAURANT'
          ? 1
          : a === 'SHOP'
            ? -1
            : b === 'SHOP'
              ? 1
              : String(a).localeCompare(String(b))
    )
  }, [orders])
  const activeCount = orders.filter(isOrderActive).length

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    return orders.filter((o) => {
      if (filter === 'ACTIVE' && !isOrderActive(o)) return false
      if (filter !== 'ALL' && filter !== 'ACTIVE' && o.partner_type !== filter) return false
      if (!s) return true
      return (
        (o.partner_name || '').toLowerCase().includes(s) ||
        o.items.some((i) => i.name.toLowerCase().includes(s))
      )
    })
  }, [orders, filter, q])

  const time = (o: Order) => o.created_at?.getTime() || 0
  const active = useMemo(
    () => filtered.filter(isOrderActive).sort((a, b) => time(b) - time(a)),
    [filtered]
  )
  const history = useMemo(
    () =>
      filtered
        .filter((o) => !isOrderActive(o))
        .sort((a, b) => (newestFirst ? time(b) - time(a) : time(a) - time(b))),
    [filtered, newestFirst]
  )

  const requireLocation = useRequireLocation()
  const reorder = async (o: Order) => {
    if (!requireLocation()) return
    setBusy(o.uuid)
    try {
      const partner = await resolvePartner(o)
      const rawItems: any[] = Array.isArray(o.raw?.items) ? o.raw.items : []
      const products = rawItems.filter(
        (i) => i?.product && typeof i.product === 'object' && i.product.uuid
      )
      if (!partner || !products.length) {
        message.info("Bu buyurtmani avtomatik takrorlab bo'lmadi — menyudan tanlang")
        if (partner)
          router.push(
            partner.partner_type === 'SHOP'
              ? `/store/?id=${partner.uuid}`
              : `/restaurant/?id=${partner.uuid}`
          )
        return
      }
      products.forEach((i) =>
        setQty(partner, productLine(normalizeProduct(i.product)), parseInt(i.quantity, 10) || 1)
      )
      if (partner.partner_type === 'RESTAURANT') setMode(partner, o.delivery_type)
      message.success("Mahsulotlar savatga qo'shildi (narxlar joriy menyu bo'yicha yangilanadi)")
      router.push(`/cart/?partner=${partner.uuid}`)
    } catch {
      message.error("Qayta buyurtma berib bo'lmadi")
    } finally {
      setBusy(null)
    }
  }

  const chips: { key: string; label: string; count?: number }[] = [
    { key: 'ALL', label: 'Barchasi' },
    { key: 'ACTIVE', label: 'Faol', count: activeCount },
    ...types.map((t) => ({ key: t, label: typeLabel(t) })),
  ]

  const iconBtn =
    'flex h-9 w-9 cursor-pointer items-center justify-center border-0 bg-transparent p-1 text-[#1F2937]'

  return (
    <div className="min-h-[70vh] bg-[#FAF8F5]">
      <Head>
        <title>Mening buyurtmalarim — MilliyGo</title>
      </Head>
      <div className="mx-auto w-full max-w-[720px] lg:max-w-[820px]">
        <div className="flex items-center gap-2 px-4 pt-3">
          <button
            type="button"
            aria-label="Orqaga"
            onClick={() =>
              window.history.length > 1 ? window.history.back() : (window.location.href = '/')
            }
            className={iconBtn}
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
            <div className="text-[1.0625rem] font-[800] text-[#1F2937]">Mening buyurtmalarim</div>
            {isAuthenticated && (
              <div className="text-[0.75rem] font-[600] text-[#6B7280]">
                Jami {orders.length} ta xarid
              </div>
            )}
          </div>
          {isAuthenticated && (
            <>
              <button
                type="button"
                aria-label="Qidirish"
                onClick={() => setSearchOpen((v) => !v)}
                className={iconBtn}
              >
                {searchOpen ? (
                  <span className="text-[1.25rem] leading-none">✕</span>
                ) : (
                  <IconSearch size={22} />
                )}
              </button>
              <button
                type="button"
                aria-label="Saralash"
                onClick={() => setNewestFirst((v) => !v)}
                className={iconBtn}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d={newestFirst ? 'M4 7h16M4 12h11M4 17h6' : 'M4 7h6M4 12h11M4 17h16'} />
                </svg>
              </button>
            </>
          )}
        </div>

        {!isAuthenticated ? (
          <EmptyState
            emoji="🔐"
            title="Buyurtmalarni ko'rish uchun kiring"
            text="Telegram orqali bir zumda tizimga kiring."
            action={<Button onClick={openLogin}>Kirish</Button>}
          />
        ) : (
          <>
            {searchOpen && (
              <div className="px-4 pt-2.5">
                <label className="flex items-center gap-2 rounded-[14px] bg-[#E8EAED] px-3">
                  <IconSearch size={19} className="text-[#94A3B8]" />
                  <input
                    autoFocus
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Buyurtma yoki taom nomi bo'yicha qidirish"
                    className="h-[46px] min-w-0 flex-1 border-0 bg-transparent text-[0.875rem] font-[600] text-[#1A1A1A] outline-none placeholder:text-[0.813rem] placeholder:font-[500] placeholder:text-[#9CA3AF]"
                  />
                </label>
              </div>
            )}
            <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1 pt-3.5">
              {chips.map((c) => {
                const on = filter === c.key
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setFilter(c.key)}
                    className={cx(
                      'flex h-[38px] shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-[20px] border-[1.2px] border-solid px-3.5 text-[0.781rem] font-[800]',
                      on
                        ? 'border-[#16A34A] bg-[#16A34A] text-white'
                        : 'border-[#E2E8F0] bg-white text-[#1F2937]'
                    )}
                  >
                    {c.label}
                    {!!c.count && (
                      <span
                        className={cx(
                          'rounded-[10px] px-1.5 py-px text-[0.656rem]',
                          on ? 'bg-white/25 text-white' : 'bg-[#FFFBEB] text-[#D97706]'
                        )}
                      >
                        {c.count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="px-4 pb-8 pt-2">
              {isLoading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <Skeleton key={i} className="h-[130px] rounded-[22px]" />
                  ))}
                </div>
              ) : isError ? (
                <EmptyState
                  emoji="📡"
                  title="Ma'lumotlarni yuklashda xatolik"
                  action={<Button onClick={() => refetch()}>Qayta urinish</Button>}
                />
              ) : active.length === 0 && history.length === 0 ? (
                <div className="flex flex-col items-center px-6 py-14 text-center">
                  <span className="flex h-[120px] w-[120px] items-center justify-center rounded-full border-[1.5px] border-solid border-[#EADBCE]/50 bg-[#FAF9F6] text-[3.5rem]">
                    🍽
                  </span>
                  <h2 className="m-0 mt-6 text-[1.0625rem] font-[900] text-[#1F2937]">
                    Buyurtmalar topilmadi
                  </h2>
                  <p className="mb-6 mt-2 text-[0.813rem] font-[600] leading-[1.4] text-[#6B7280]">
                    Ushbu bo&apos;limda hali buyurtmalar yo&apos;q.
                    <br />
                    Keling, mazali taom yoki mahsulot buyurtma qilamiz!
                  </p>
                  <Button href="/restaurants/">Buyurtma berish</Button>
                </div>
              ) : (
                <>
                  {active.length > 0 && (
                    <section className="pb-2.5">
                      <div className="mb-2.5 flex items-center gap-2">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-[#16A34A]" />
                        <span className="text-[0.75rem] font-[800] tracking-[0.5px] text-[#334155]">
                          FAOL BUYURTMALAR
                        </span>
                      </div>
                      <div className="space-y-3">
                        {active.map((o) => (
                          <SpotlightCard key={o.uuid} o={o} />
                        ))}
                      </div>
                    </section>
                  )}
                  {history.length > 0 && (
                    <section className="pt-3">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-[0.969rem] font-[800] text-[#0F172A]">
                          Avvalgi buyurtmalar
                        </span>
                        <button
                          type="button"
                          onClick={() => setNewestFirst((v) => !v)}
                          className="flex cursor-pointer items-center gap-[3px] border-0 bg-transparent p-0 text-[0.75rem] font-[700] text-[#6B7280]"
                        >
                          ⇅ Sana bo&apos;yicha
                        </button>
                      </div>
                      <div className="space-y-3">
                        {history.map((o) => (
                          <HistoryCard
                            key={o.uuid}
                            o={o}
                            busy={busy === o.uuid}
                            onDetails={() => setDetails(o)}
                            onReorder={() => reorder(o)}
                          />
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
      <DetailsSheet o={details} onClose={() => setDetails(null)} />
    </div>
  )
}
