import { Input, message, Modal } from 'antd'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import { checkServiceArea } from '@/helpers/location-helper'
import { useNeighborhoods } from '@/hooks/useNeighborhoods'
import { useLocationStore } from '@/store/useLocationStore'
import { createOrder, fetchAddresses, type CreateOrderPayload } from '../lib/api'
import { cartSaving, cartSubtotal, useCart } from '../lib/cart'
import { usePartner } from '../lib/queries'
import { useQueryParam } from '../lib/route'
import { useHydrated, useSession, useUi, useUserLocation } from '../lib/session'
import type { OrderMode } from '../lib/types'
import {
  changeOptions,
  cx,
  deliveryFeeFor,
  digits,
  etaRange,
  isOpenNow,
  isOutOfZone,
  som,
  workingHoursLabel,
  zoneFor,
} from '../lib/utils'
import {
  IconArrowRight,
  IconCash,
  IconChat,
  IconCheck,
  IconChevronRight,
  IconClose,
  IconCopy,
  IconHome,
  IconInfo,
  IconNavigate,
  IconPhone,
  IconPin,
  IconScooter,
  IconStore,
  IconWalk,
} from '../ui/icons'
import { BackButton, Button, EmptyState, Page, Sheet } from '../ui/primitives'

export const LAST_ORDER_KEY = 'go_last_order'

export function openInMaps(lat: number, lng: number, label?: string) {
  const ua = navigator.userAgent
  const dest = `${lat},${lng}`
  if (/iPhone|iPad|iPod/i.test(ua)) window.location.href = `maps://?daddr=${dest}&dirflg=d`
  else if (/Android/i.test(ua))
    window.location.href = `geo:${dest}?q=${dest}(${encodeURIComponent(label || 'Restoran')})`
  else window.open(`https://yandex.uz/maps/?rtext=~${dest}&rtt=auto`, '_blank', 'noopener')
}

export default function CheckoutPage() {
  const router = useRouter()
  const qc = useQueryClient()
  const hydrated = useHydrated()
  const partnerId = useQueryParam('partner')
  const cart = useCart((s) => (partnerId ? s.carts[partnerId] : undefined))
  const { setMode, setCutlery, clear } = useCart()
  const { isAuthenticated, profile, openLogin } = useSession()
  const { lat, lng, address, hasLocation } = useUserLocation()
  const setLocation = useLocationStore((s) => s.setLocation)
  const setInArea = useLocationStore((s) => s.setIsInServiceArea)
  const setLocationOpen = useUi((s) => s.setLocationOpen)
  const { neighborhoods } = useNeighborhoods()
  const fresh = usePartner(partnerId)
  const partner = fresh.data || cart?.partner

  const addressesQ = useQuery({
    queryKey: ['go', 'addresses'],
    queryFn: fetchAddresses,
    enabled: isAuthenticated,
  })

  const [entrance, setEntrance] = useState('')
  const [floor, setFloor] = useState('')
  const [apartment, setApartment] = useState('')
  const [intercom, setIntercom] = useState('')
  const [comment, setComment] = useState('')
  const [phone, setPhone] = useState('')
  const [recipient, setRecipient] = useState('')
  const [changeFrom, setChangeFrom] = useState<number | null>(null)
  const [sheet, setSheet] = useState<null | 'comment' | 'recipient' | 'change' | 'address'>(null)
  const [draftPhone, setDraftPhone] = useState('')
  const [draftName, setDraftName] = useState('')
  const [draftComment, setDraftComment] = useState('')
  const [draftChange, setDraftChange] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (cart?.comment && !comment) setComment(cart.comment)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart?.comment])
  useEffect(() => {
    if (profile?.phone_number && !phone) setPhone(profile.phone_number)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.phone_number])

  const isShop = partner?.partner_type === 'SHOP'
  const pickup = !isShop && cart?.mode === 'PICKUP'
  const sum = cartSubtotal(cart)
  const saving = cartSaving(cart)
  const zone = partner ? zoneFor(partner, lat, lng) : null
  const fee = partner && !pickup ? deliveryFeeFor(partner, sum, zone) : 0
  const baseFee = partner && !pickup ? (zone?.delivery_fee ?? partner.delivery_fee) : 0
  const total = sum + fee
  const inArea =
    hasLocation &&
    lat != null &&
    lng != null &&
    (neighborhoods.length === 0 || checkServiceArea(lat, lng, neighborhoods))
  const out = partner ? isOutOfZone(partner, lat, lng) : false
  const min = partner?.min_order_amount || 0
  const threshold = partner?.free_delivery_threshold || 0
  const remainFree = !pickup && threshold > 0 && sum < threshold ? threshold - sum : 0
  const open = partner ? isOpenNow(partner) : false
  const changeOpts = useMemo(() => changeOptions(total), [total])

  const missing: string[] = []
  if (!pickup) {
    if (!hasLocation) missing.push('Yetkazib berish manzili')
    else if (!inArea) missing.push('Manzil xizmat hududidan tashqarida')
    else if (out) missing.push(`${isShop ? "Do'kon" : 'Restoran'} bu manzilga yetkazmaydi`)
  }
  if (min > 0 && sum < min) missing.push(`Minimal summa: ${som(min)}`)
  if (digits(phone).length < 9) missing.push('Oluvchi telefoni')
  if (!open) missing.push('Muassasa hozir yopiq')

  if (!hydrated) return null

  if (!cart || !cart.lines.length || !partner) {
    return (
      <Page className="max-w-[720px]">
        <EmptyState
          emoji="🧺"
          title="Savat bo'sh"
          text="Buyurtma berish uchun avval savatga mahsulot qo'shing."
          action={<Button href="/cart/">Savatga o&apos;tish</Button>}
        />
      </Page>
    )
  }

  if (!isAuthenticated) {
    return (
      <Page className="max-w-[720px]">
        <div className="flex items-center gap-3 pt-3">
          <BackButton fallback="/cart/" />
          <h1 className="m-0 text-[1.5rem] font-[900] tracking-[-0.5px]">
            Buyurtmani rasmiylashtirish
          </h1>
        </div>
        <EmptyState
          emoji="🔐"
          title="Davom etish uchun kiring"
          text="Buyurtma holatini kuzatish va kuryer bilan bog'lanish uchun Telegram orqali tizimga kiring."
          action={<Button onClick={openLogin}>Kirish</Button>}
        />
      </Page>
    )
  }

  const place = async () => {
    if (missing.length) {
      message.warning(missing[0])
      return
    }
    const parts = [
      comment.trim(),
      !pickup
        ? [
            entrance.trim() && `Podyezd: ${entrance.trim()}`,
            floor.trim() && `Qavat: ${floor.trim()}`,
            apartment.trim() && `Kvartira: ${apartment.trim()}`,
            intercom.trim() && `Domofon: ${intercom.trim()}`,
          ]
            .filter(Boolean)
            .join(', ')
        : '',
      cart.cutlery ? `Anjomlar va salfetkalar: ${cart.cutlery} kishiga` : '',
      changeFrom ? `Qaytim: ${som(changeFrom)}dan` : '',
    ].filter(Boolean)

    const clientLat = lat ?? (pickup ? partner.lat : null)
    const clientLng = lng ?? (pickup ? partner.lng : null)
    const payload: CreateOrderPayload = {
      description: parts.length
        ? parts.join('. ')
        : isShop
          ? "Do'kon buyurtmasi"
          : 'Ovqat buyurtmasi',
      address: pickup ? partner.address || partner.name : address || 'Tanlangan manzil',
      contact_phone: phone.trim(),
      ...(recipient.trim() ? { contact_name: recipient.trim() } : {}),
      delivery_type: pickup ? 'PICKUP' : 'DELIVERY',
      payment_method: 'CASH',
      latitude: clientLat != null ? clientLat.toFixed(6) : '',
      longitude: clientLng != null ? clientLng.toFixed(6) : '',
      items: cart.lines.map((l) =>
        l.kind === 'set'
          ? { set: l.uuid, quantity: l.quantity }
          : { product_uuid: l.uuid, quantity: l.quantity, price_at_time_of_order: l.price }
      ),
    }

    Modal.confirm({
      title: 'Buyurtmani tasdiqlang',
      content: `${som(total)}lik buyurtma ${pickup ? 'olib ketish' : 'yetkazib berish'} uchun rasmiylashtiriladi. To'lov — naqd pulda.`,
      okText: 'Tasdiqlash',
      cancelText: 'Bekor qilish',
      centered: true,
      onOk: async () => {
        setLoading(true)
        try {
          const res = await createOrder(payload)
          const uuid = res?.uuid || res?.id
          sessionStorage.setItem(
            LAST_ORDER_KEY,
            JSON.stringify({
              uuid,
              order_number: res?.order_number || null,
              partner,
              mode: pickup ? 'PICKUP' : 'DELIVERY',
              total,
              lines: cart.lines,
              created: Date.now(),
            })
          )
          clear(cart.partner.uuid)
          qc.invalidateQueries({ queryKey: ['go', 'orders'] })
          message.success('Buyurtma qabul qilindi')
          router.replace(uuid ? `/orders/track/?uuid=${uuid}&new=1` : '/orders/')
        } catch (e: any) {
          message.error(e?.message || "Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.")
        } finally {
          setLoading(false)
        }
      },
    })
  }

  const cardCls =
    'rounded-[24px] border border-solid border-[#ECEEF1] bg-white px-4 pb-3 pt-4 shadow-[0_4px_12px_rgba(0,0,0,0.03)]'
  const Title = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
    <div className="mb-1.5 flex items-center gap-2.5">
      <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-go-soft text-go-green">
        {icon}
      </span>
      <span className="text-[1.1875rem] font-[800] tracking-[-0.2px] text-[#111]">{children}</span>
    </div>
  )
  const Row = ({
    icon,
    overline,
    title,
    titleCls,
    sub,
    onClick,
    divider = true,
  }: {
    icon: React.ReactNode
    overline?: string
    title: string
    titleCls?: string
    sub?: string | null
    onClick?: () => void
    divider?: boolean
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-[18px] border-0 bg-transparent p-0 text-left"
    >
      <span className="shrink-0 text-[#374151]">{icon}</span>
      <span
        className={cx(
          'flex min-w-0 flex-1 items-center py-3.5',
          divider && 'border-0 border-b border-solid border-[#E5E7EB]'
        )}
      >
        <span className="min-w-0 flex-1">
          {overline && <span className="block text-[0.8125rem] text-[#6B7280]">{overline}</span>}
          <span
            className={cx(
              'line-clamp-2 block text-[1.0625rem] font-[500]',
              titleCls || 'text-[#111]'
            )}
          >
            {title}
          </span>
          {sub && (
            <span className="mt-0.5 block text-[0.844rem] leading-[1.35] text-[#6B7280]">
              {sub}
            </span>
          )}
        </span>
        {onClick && <IconChevronRight size={26} className="shrink-0 text-[#111]" />}
      </span>
    </button>
  )
  const warn = (t: string) => (
    <div className="mb-1 mt-2 flex items-center gap-2 rounded-[14px] bg-[#FEF2F2] px-3.5 py-2.5 text-[0.844rem] font-[600] text-[#B91C1C]">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#DC2626"
        strokeWidth={2}
        strokeLinecap="round"
        aria-hidden
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5M12 16.5v.1" />
      </svg>
      {t}
    </div>
  )
  const Line = ({
    label,
    value,
    color,
    strike,
  }: {
    label: string
    value: string
    color?: string
    strike?: string
  }) => (
    <div className="flex items-center py-1.5 text-[1.0625rem] text-[#111]">
      <span className="flex-1">{label}</span>
      {strike && <span className="mr-2 text-[0.875rem] text-[#9CA3AF] line-through">{strike}</span>}
      <span className={cx('font-[800]', color)}>{value}</span>
    </div>
  )
  const ufield = (label: string, v: string, set: (x: string) => void, numeric?: boolean) => (
    <input
      value={v}
      onChange={(e) => set(e.target.value.slice(0, 10))}
      placeholder={label}
      aria-label={label}
      inputMode={numeric ? 'numeric' : 'text'}
      className="min-w-0 flex-1 border-0 border-b border-solid border-[#E5E7EB] bg-transparent pb-3 pt-3.5 text-[1.0625rem] text-[#111] outline-none placeholder:text-[#9CA3AF] focus:border-go-green"
    />
  )
  const seg = (label: string, on: boolean, v: OrderMode) => (
    <button
      type="button"
      onClick={() => setMode(partner, v)}
      className={cx(
        'cursor-pointer whitespace-nowrap rounded-[20px] border-0 px-3.5 py-[9px] text-[0.938rem] font-[700] transition-colors',
        on ? 'bg-go-green text-white' : 'bg-transparent text-[#6B7280]'
      )}
    >
      {label}
    </button>
  )
  const barOffset = 'bottom-[calc(66px+env(safe-area-inset-bottom))] lg:bottom-4'

  return (
    <div className="bg-white">
      <Head>
        <title>Buyurtmani rasmiylashtirish — MilliyGo</title>
      </Head>

      {/* Yuqori panel: orqaga · Yetkazish | Olib ketish · yopish */}
      <div className="sticky top-0 z-[60] bg-white lg:top-[72px]">
        <div className="mx-auto flex h-14 w-full max-w-[720px] items-center gap-1 px-1.5 lg:max-w-[760px] lg:px-4">
          <BackButton fallback="/cart/" />
          <div className="min-w-0 flex-1 text-center">
            {isShop ? (
              <span className="text-[1.125rem] font-[700] text-[#111]">
                Buyurtmani rasmiylashtirish
              </span>
            ) : (
              <div className="inline-flex rounded-[23px] bg-go-chip p-[3px]">
                {seg('Yetkazish', !pickup, 'DELIVERY')}
                {seg('Olib ketish', pickup, 'PICKUP')}
              </div>
            )}
          </div>
          <Link
            href="/"
            aria-label="Yopish"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EDEEF0] text-[#4B5563] no-underline"
          >
            <IconClose size={22} />
          </Link>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[720px] space-y-3 px-4 pb-[260px] pt-2 lg:max-w-[760px] lg:pb-6">
        {/* Bosh banner */}
        <div className="flex items-center gap-3.5 rounded-[24px] bg-gradient-to-br from-[#166534] to-go-bright p-4 shadow-[0_6px_16px_rgba(21,128,61,0.25)]">
          <span className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full bg-white/[0.16] text-white">
            {pickup ? <IconWalk size={28} /> : <IconScooter size={28} />}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[1.125rem] font-[900] text-white">
              {pickup ? "O'zingiz olib ketasiz" : 'Yetkazib beramiz'}
            </div>
            <div className="truncate text-[0.844rem] text-white/85">{partner.name}</div>
          </div>
          <span className="shrink-0 rounded-[12px] bg-go-gold px-2.5 py-1.5 text-[0.8125rem] font-[900] text-[#111]">
            {pickup ? 'Bepul' : etaRange(zone?.estimated_minutes) || '—'}
          </span>
        </div>

        {!pickup ? (
          <div className={cardCls}>
            <Title icon={<IconHome size={18} />}>Qayerga</Title>
            <Row
              icon={
                <IconPin size={26} className={hasLocation ? 'text-go-green' : 'text-[#9CA3AF]'} />
              }
              title={hasLocation ? address || 'Tanlangan manzil' : 'Manzilni tanlang'}
              titleCls={hasLocation ? undefined : 'text-[#9CA3AF]'}
              sub={zone ? [zone.name, zone.district].filter(Boolean).join(' · ') : null}
              onClick={() => setSheet('address')}
            />
            {hasLocation && !inArea && warn("Manzil xizmat ko'rsatish hududidan tashqarida")}
            {hasLocation &&
              inArea &&
              out &&
              warn(`${isShop ? "Do'kon" : 'Restoran'} bu manzilga yetkazib bermaydi`)}
            <div className="flex gap-[18px]">
              {ufield('Podyezd', entrance, setEntrance, true)}
              {ufield('Qavat', floor, setFloor, true)}
            </div>
            <div className="flex gap-[18px]">
              {ufield('Kvartira', apartment, setApartment)}
              {ufield('Domofon', intercom, setIntercom)}
            </div>
            <div className="h-1" />
            <Row
              icon={<IconChat size={26} />}
              title={comment || 'Kuryer va restoranga izoh'}
              titleCls={comment ? undefined : 'text-[#9CA3AF]'}
              onClick={() => {
                setDraftComment(comment)
                setSheet('comment')
              }}
            />
            <Row
              icon={<IconPhone size={26} />}
              overline={recipient ? `Oluvchi: ${recipient}` : 'Oluvchi telefoni'}
              title={phone || 'Raqamni kiriting'}
              titleCls={digits(phone).length >= 9 ? undefined : 'text-[#DC2626]'}
              divider={false}
              onClick={() => {
                setDraftPhone(phone)
                setDraftName(recipient)
                setSheet('recipient')
              }}
            />
          </div>
        ) : (
          <div className={cardCls}>
            <Title icon={<IconStore size={18} />}>Qayerdan olish kerak</Title>
            <div className="flex items-start gap-[18px]">
              <IconStore size={26} className="mt-3.5 shrink-0 text-go-green" />
              <div className="min-w-0 flex-1 py-3">
                <div className="text-[1.0625rem] font-[700] leading-[1.3] text-[#111]">
                  {partner.name}
                </div>
                {partner.address && (
                  <div className="mt-0.5 text-[0.875rem] leading-[1.3] text-[#374151]">
                    {partner.address}
                  </div>
                )}
                {workingHoursLabel(partner) && (
                  <div className="mt-0.5 text-[0.844rem] text-[#6B7280]">
                    Ish vaqti: {workingHoursLabel(partner)}
                  </div>
                )}
              </div>
              <div className="flex shrink-0 flex-col">
                {partner.lat != null && partner.lng != null && (
                  <button
                    type="button"
                    aria-label="Xaritada ochish"
                    onClick={() => openInMaps(partner.lat!, partner.lng!, partner.name)}
                    className="flex h-11 w-11 cursor-pointer items-center justify-center border-0 bg-transparent text-go-blue"
                  >
                    <IconNavigate size={24} />
                  </button>
                )}
                {partner.address && (
                  <button
                    type="button"
                    aria-label="Manzilni nusxalash"
                    onClick={() =>
                      navigator.clipboard
                        ?.writeText(partner.address!)
                        .then(() => message.success('Manzil nusxalandi'))
                    }
                    className="flex h-11 w-11 cursor-pointer items-center justify-center border-0 bg-transparent text-[#111]"
                  >
                    <IconCopy size={24} />
                  </button>
                )}
              </div>
            </div>
            <div className="h-px bg-[#E5E7EB]" />
            <Row
              icon={<IconPhone size={26} />}
              overline={recipient ? `Oluvchi: ${recipient}` : 'Oluvchi telefoni'}
              title={phone || 'Raqamni kiriting'}
              titleCls={digits(phone).length >= 9 ? undefined : 'text-[#DC2626]'}
              divider={false}
              onClick={() => {
                setDraftPhone(phone)
                setDraftName(recipient)
                setSheet('recipient')
              }}
            />
          </div>
        )}

        {!isShop && (
          <div className={cx(cardCls, 'flex items-center gap-3')}>
            <span className="text-[1.375rem]" aria-hidden>
              🍴
            </span>
            <span className="min-w-0 flex-1 text-[1.0625rem] text-[#111]">
              Anjomlar va salfetkalar
              <span className="block text-[0.844rem] text-[#6B7280]">
                {cart.cutlery ? `${cart.cutlery} kishiga` : 'Kerak emas'}
              </span>
            </span>
            <div className="flex h-10 items-center rounded-[14px] bg-go-chip">
              <button
                type="button"
                aria-label="Kamaytirish"
                onClick={() =>
                  setCutlery(partner.uuid, Math.max(0, (cart.cutlery || 0) - 1) || null)
                }
                className="h-10 w-9 cursor-pointer border-0 bg-transparent text-[1.125rem] font-[700] text-go-green"
              >
                −
              </button>
              <span className="min-w-[18px] text-center font-[800]">{cart.cutlery || 0}</span>
              <button
                type="button"
                aria-label="Ko'paytirish"
                onClick={() => setCutlery(partner.uuid, Math.min(20, (cart.cutlery || 0) + 1))}
                className="h-10 w-9 cursor-pointer border-0 bg-transparent text-[1.125rem] font-[700] text-go-green"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* To'lov */}
        <div className={cardCls}>
          <Title icon={<IconCash size={18} />}>To&apos;lov</Title>
          <div className="rounded-[16px] bg-[#FFF4CC] p-3.5 text-[0.844rem] leading-[1.35] text-[#78350F]">
            <b className="block font-[800] text-go-goldtext">
              Hozircha faqat naqd pulda to&apos;lanadi
            </b>
            {pickup
              ? "To'lovni buyurtmani olayotganda restoranda qilasiz."
              : "To'lovni buyurtmani qabul qilganda kuryerga berasiz."}{' '}
            Tafsilotlarni tekshiring — keyin o&apos;zgartirib bo&apos;lmaydi.
          </div>
          <div className="mt-3 w-[150px] rounded-[20px] border-2 border-solid border-go-green bg-[#F0FDF4] p-3.5">
            <div className="flex items-center justify-between">
              <span className="flex rounded-[10px] bg-go-gold p-1.5 text-[#111]">
                <IconCash size={20} />
              </span>
              <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-go-green text-white">
                <IconCheck size={14} />
              </span>
            </div>
            <div className="mt-[18px] text-[1rem] font-[800] text-[#111]">Naqd pul</div>
          </div>
          {!pickup ? (
            <div className="mt-1">
              <Row
                icon={
                  <span className="text-[1.5rem] leading-none" aria-hidden>
                    🪙
                  </span>
                }
                title={changeFrom ? `Qaytim: ${som(changeFrom)}dan` : 'Qaytim kerakmi?'}
                titleCls={changeFrom ? undefined : 'text-[#9CA3AF]'}
                divider={false}
                onClick={() => {
                  setDraftChange(changeFrom)
                  setSheet('change')
                }}
              />
            </div>
          ) : (
            <div className="h-1" />
          )}
        </div>

        {/* Narx */}
        <div className={cardCls}>
          <Title icon={<span className="text-[0.9rem]">🧾</span>}>Narxga nimalar kiradi</Title>
          <Line label={`Savatdagi ${isShop ? 'mahsulotlar' : 'taomlar'}`} value={som(sum)} />
          {saving > 0 && (
            <Line label="Aksiya va chegirmalar" value={`−${som(saving)}`} color="text-go-green" />
          )}
          {pickup ? (
            <Line label="Olib ketish" value="Bepul" color="text-go-bright" />
          ) : fee === 0 ? (
            <Line
              label="Yetkazish"
              value="Bepul"
              color="text-go-bright"
              strike={baseFee > 0 ? som(baseFee) : undefined}
            />
          ) : (
            <Line label="Yetkazish" value={som(fee)} />
          )}
          {remainFree > 0 && (
            <div className="mt-2 flex items-center gap-2.5 rounded-[16px] bg-[#F0FDF4] px-3.5 py-3 text-[0.844rem] font-[600] text-go-green">
              <IconScooter size={20} className="shrink-0 text-go-bright" />
              Yana {som(remainFree)} qo&apos;shsangiz — yetkazish bepul
            </div>
          )}
          {min > 0 &&
            sum < min &&
            warn(`Minimal buyurtma ${som(min)} — yana ${som(min - sum)} qo'shing`)}
          <div className="h-1" />
        </div>
      </div>

      {/* Pastki panel: jami to'lov + "Buyurtma berish" */}
      <div
        className={cx(
          'fixed inset-x-0 z-[60] lg:sticky lg:inset-x-auto lg:mt-4 lg:px-4',
          barOffset
        )}
      >
        <div className="mx-auto w-full max-w-[720px] rounded-t-[24px] bg-white px-5 pb-3 pt-4 shadow-[0_-3px_16px_rgba(0,0,0,0.06)] lg:max-w-[760px] lg:rounded-[24px] lg:shadow-[0_8px_30px_rgba(0,0,0,0.14)]">
          <div className="flex items-center">
            <span className="text-[1.0625rem] font-[700] text-[#6B7280]">Jami to&apos;lov</span>
            <span className="ml-auto text-[1.5rem] font-[900] text-go-green">{som(total)}</span>
          </div>
          {missing.length > 0 ? (
            <div className="mb-2.5 mt-1 flex items-start gap-1.5 text-[0.8125rem] font-[600] text-[#92400E]">
              <IconInfo size={16} className="mt-px shrink-0 text-[#D97706]" />
              <span className="line-clamp-2">{missing.join(' · ')}</span>
            </div>
          ) : (
            <div className="h-3" />
          )}
          <button
            type="button"
            onClick={place}
            disabled={loading}
            className={cx(
              'flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-[18px] border-0 text-[1.0625rem] font-[800] text-white',
              missing.length ? 'bg-[#B8BEC6]' : 'bg-go-green',
              loading && 'opacity-70'
            )}
          >
            {loading ? (
              <span className="h-6 w-6 animate-spin rounded-full border-[2.4px] border-solid border-white border-t-transparent" />
            ) : (
              <>
                Buyurtma berish <IconArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
      {/* ── Varaqlar ── */}
      <Sheet
        open={sheet === 'comment'}
        onClose={() => setSheet(null)}
        title={pickup ? 'Restoranga izoh' : 'Kuryer va restoranga izoh'}
        subtitle={
          pickup
            ? 'Masalan: 18:30 da olib ketaman'
            : "Masalan: domofon ishlamaydi, qo'ng'iroq qiling"
        }
        footer={
          <Button
            block
            onClick={() => {
              setComment(draftComment.trim())
              setSheet(null)
            }}
          >
            Saqlash
          </Button>
        }
      >
        <Input.TextArea
          autoFocus
          value={draftComment}
          onChange={(e) => setDraftComment(e.target.value)}
          placeholder="Izohingizni yozing"
          autoSize={{ minRows: 3, maxRows: 6 }}
          maxLength={300}
        />
      </Sheet>

      <Sheet
        open={sheet === 'recipient'}
        onClose={() => setSheet(null)}
        title="Oluvchi"
        subtitle="Buyurtmani boshqa odam qabul qilsa — uning ismi va raqamini yozing"
        footer={
          <Button
            block
            onClick={() => {
              setPhone(draftPhone.trim())
              setRecipient(draftName.trim())
              setSheet(null)
            }}
          >
            Saqlash
          </Button>
        }
      >
        <label className="block text-[0.8125rem] text-go-muted">Telefon raqami</label>
        <Input
          size="large"
          value={draftPhone}
          onChange={(e) => setDraftPhone(e.target.value)}
          placeholder="+998 90 123 45 67"
          inputMode="tel"
          className="mt-1"
        />
        <label className="mt-3 block text-[0.8125rem] text-go-muted">Ismi (ixtiyoriy)</label>
        <Input
          size="large"
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          placeholder="Masalan: Aziz"
          maxLength={60}
          className="mt-1"
        />
      </Sheet>

      <Sheet
        open={sheet === 'change'}
        onClose={() => setSheet(null)}
        title="Qaytim kerakmi?"
        subtitle={`Qaysi kupyuradan to'laysiz — ${pickup ? 'restoran' : 'kuryer'} qaytimni tayyorlab qo'yadi`}
        footer={
          <Button
            block
            onClick={() => {
              setChangeFrom(draftChange)
              setSheet(null)
            }}
          >
            Tayyor
          </Button>
        }
      >
        {[null, ...changeOpts].map((v) => {
          const active = draftChange === v
          return (
            <button
              key={String(v)}
              type="button"
              onClick={() => setDraftChange(v)}
              className="flex min-h-[52px] w-full cursor-pointer items-center border-0 bg-transparent text-left"
            >
              <span className={cx('flex-1 text-[1rem]', active ? 'font-[800]' : 'font-[500]')}>
                {v ? `${som(v)}dan` : 'Qaytim kerak emas'}
              </span>
              <span
                className={cx(
                  'flex h-6 w-6 items-center justify-center rounded-full border-2 border-solid',
                  active ? 'border-go-green bg-go-green text-white' : 'border-[#D1D5DB]'
                )}
              >
                {active && <IconCheck size={14} />}
              </span>
            </button>
          )
        })}
      </Sheet>

      <Sheet open={sheet === 'address'} onClose={() => setSheet(null)} title="Yetkazish manzili">
        {(addressesQ.data || []).length > 0 && (
          <div className="mb-3">
            <div className="mb-1 text-[0.8125rem] font-[700] text-go-muted">
              Saqlangan manzillar
            </div>
            {(addressesQ.data || []).map((a) => (
              <button
                key={a.id}
                type="button"
                disabled={a.lat == null || a.lng == null}
                onClick={() => {
                  if (a.lat == null || a.lng == null) return
                  setLocation({ lat: a.lat, lng: a.lng, address: a.address || a.name })
                  setInArea(
                    neighborhoods.length === 0 || checkServiceArea(a.lat, a.lng, neighborhoods)
                  )
                  setSheet(null)
                }}
                className="flex min-h-[56px] w-full cursor-pointer items-center gap-3 border-0 border-b border-solid border-go-line bg-transparent text-left disabled:opacity-50"
              >
                <IconPin size={20} className="text-go-green" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.9375rem] font-[700]">{a.name}</span>
                  <span className="block truncate text-[0.8125rem] text-go-muted">{a.address}</span>
                </span>
                {a.is_default && (
                  <span className="text-[0.75rem] font-[800] text-go-green">Asosiy</span>
                )}
              </button>
            ))}
          </div>
        )}
        <Button
          block
          variant="ghost"
          onClick={() => {
            setSheet(null)
            setLocationOpen(true)
          }}
        >
          <IconPin size={18} /> Xaritadan tanlash
        </Button>
      </Sheet>
    </div>
  )
}
