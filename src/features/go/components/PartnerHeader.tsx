import { message } from 'antd'
import { useState } from 'react'
import ApiGap from '@/components/common/ApiGap'
import type { Partner } from '../lib/types'
import { useUi } from '../lib/session'
import {
  etaRange,
  isOpenNow,
  isOutOfZone,
  opensAtLabel,
  som,
  workingHoursLabel,
  zoneFor,
} from '../lib/utils'
import {
  IconClock,
  IconInfo,
  IconLock,
  IconPin,
  IconScooter,
  IconSearch,
  IconShare,
  IconStar,
} from '../ui/icons'
import { BackButton, IconButton, Img, Notice, Row, Sheet } from '../ui/primitives'

export function PartnerInfoSheet({
  partner: p,
  open,
  onClose,
  lat,
  lng,
}: {
  partner: Partner
  open: boolean
  onClose: () => void
  lat: number | null
  lng: number | null
}) {
  const zone = zoneFor(p, lat, lng)
  const fee = zone ? (zone.delivery_fee ?? p.delivery_fee) : p.delivery_fee
  const hours = workingHoursLabel(p)
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={p.name}
      subtitle={p.partner_type === 'SHOP' ? "Do'kon haqida" : 'Restoran haqida'}
    >
      <div className="divide-y divide-solid divide-go-line">
        {p.description && p.description !== p.name && (
          <p className="m-0 pb-3 text-[0.9375rem] text-[#4B5563]">{p.description}</p>
        )}
        <Row
          icon={<IconClock size={20} />}
          title="Ish vaqti"
          subtitle={hours || "Ko'rsatilmagan"}
        />
        <Row icon={<IconPin size={20} />} title="Manzil" subtitle={p.address || "Ko'rsatilmagan"} />
        {zone && (
          <Row
            icon={<IconPin size={20} />}
            title="Yetkazish hududi"
            subtitle={[zone.name, zone.district].filter(Boolean).join(' · ')}
          />
        )}
        <Row
          icon={<IconScooter size={20} />}
          title="Yetkazish narxi"
          subtitle={fee > 0 ? som(fee) : 'Bepul'}
        />
        {p.free_delivery_threshold > 0 && (
          <Row
            icon={<IconScooter size={20} />}
            title="Bepul yetkazish"
            subtitle={`${som(p.free_delivery_threshold)} dan`}
          />
        )}
        {p.min_order_amount > 0 && (
          <Row
            icon={<IconInfo size={20} />}
            title="Minimal buyurtma"
            subtitle={som(p.min_order_amount)}
          />
        )}
        {p.phone && (
          <Row
            icon={<span className="text-[1.125rem]">📞</span>}
            title="Telefon"
            subtitle={
              <a href={`tel:${p.phone}`} className="text-go-green no-underline">
                {p.phone}
              </a>
            }
          />
        )}
      </div>
    </Sheet>
  )
}

export default function PartnerHeader({
  partner: p,
  lat,
  lng,
  pickup,
  onSearch,
}: {
  partner: Partner
  lat: number | null
  lng: number | null
  pickup?: boolean
  onSearch?: () => void
}) {
  const [info, setInfo] = useState(false)
  const setLocationOpen = useUi((s) => s.setLocationOpen)
  const open = isOpenNow(p)
  const zone = zoneFor(p, lat, lng)
  const out = !pickup && isOutOfZone(p, lat, lng)
  const eta = etaRange(zone?.estimated_minutes)
  const fee = zone ? (zone.delivery_fee ?? p.delivery_fee) : null
  const hours = workingHoursLabel(p)
  const hasLoc = lat != null && lng != null

  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share)
        await navigator.share({
          title: p.name,
          text: `MilliyGo'da "${p.name}" menyusini ko'ring`,
          url,
        })
      else {
        await navigator.clipboard.writeText(url)
        message.success('Havola nusxalandi')
      }
    } catch {
      /* bekor qilindi */
    }
  }

  return (
    <>
      <div className="relative">
        <div className="mx-auto h-[180px] w-full max-w-[720px] overflow-hidden lg:mt-4 lg:h-[260px] lg:w-[calc(100%-48px)] lg:max-w-[1180px] lg:rounded-[28px]">
          <Img src={p.banner || p.logo} alt={p.name} grayscale={!open} className="h-full w-full" />
        </div>
        <div className="absolute inset-x-0 top-3 mx-auto flex w-full max-w-[720px] items-center justify-between px-4 lg:top-7 lg:max-w-[1180px] lg:px-10">
          <BackButton fallback={p.partner_type === 'SHOP' ? '/store/' : '/restaurants/'} />
          <div className="flex gap-2">
            {onSearch && (
              <IconButton label="Menyudan qidirish" onClick={onSearch}>
                <IconSearch size={20} />
              </IconButton>
            )}
            <IconButton label="Ulashish" onClick={share}>
              <IconShare size={19} />
            </IconButton>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[720px] px-4 lg:max-w-[1180px] lg:px-6">
        <Img
          src={p.logo}
          alt=""
          className="relative -mt-9 h-[72px] w-[72px] shrink-0 rounded-[20px] border-4 border-solid border-white shadow-[0_4px_14px_rgba(0,0,0,0.08)]"
        />
        <div className="mt-2 min-w-0">
          <h1 className="m-0 truncate text-[1.625rem] font-[900] leading-tight tracking-[-0.5px] text-go-ink lg:text-[2rem]">
            {p.name}
          </h1>
          {p.address && <div className="truncate text-[0.875rem] text-go-muted">{p.address}</div>}
        </div>

        <button
          type="button"
          onClick={() => setInfo(true)}
          className="mt-4 flex w-full cursor-pointer items-stretch rounded-[18px] border border-solid border-go-line bg-white p-0 text-left"
        >
          <span className="flex flex-1 flex-col items-center justify-center px-2 py-2.5">
            <span className="flex items-center gap-1 text-[1rem] font-[900] text-go-ink">
              {p.rating > 0 ? (
                <>
                  <IconStar size={16} className="text-go-gold" /> {p.rating.toFixed(1)}
                </>
              ) : (
                '—'
              )}
            </span>
            <span className="flex items-center gap-1 text-[0.75rem] text-go-muted">
              Reyting
              <ApiGap note="Sharhlar soni (reviews_count) API'da yo'q" label="API" />
            </span>
          </span>
          <span className="my-2 w-px bg-go-line" />
          <span className="flex flex-1 flex-col items-center justify-center px-2 py-2.5">
            <span className="text-[1rem] font-[900] text-go-ink">
              {pickup ? 'Bepul' : out ? '—' : eta || '—'}
            </span>
            <span className="text-[0.75rem] text-go-muted">
              {pickup ? 'Olib ketish' : 'Yetkazish'}
            </span>
          </span>
          <span className="my-2 w-px bg-go-line" />
          <span className="flex flex-1 flex-col items-center justify-center px-2 py-2.5">
            <span className="text-[1rem] font-[900] text-go-ink">
              {hours ? hours.split(' - ')[1] : '—'}
            </span>
            <span className="text-[0.75rem] text-go-muted">
              {hours ? 'gacha ochiq' : 'Ish vaqti'}
            </span>
          </span>
          <span className="flex items-center pr-3 text-go-muted">
            <IconInfo size={18} />
          </span>
        </button>

        {!pickup && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[0.8438rem]">
            {!hasLoc ? (
              <button
                type="button"
                onClick={() => setLocationOpen(true)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border-0 bg-go-soft px-3 py-1.5 font-[700] text-go-green"
              >
                <IconPin size={15} /> Yetkazish narxini bilish uchun manzilni tanlang
              </button>
            ) : (
              !out && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-go-chip px-3 py-1.5 font-[700] text-go-ink">
                  <IconScooter size={15} />
                  {fee && fee > 0 ? `Yetkazish: ${som(fee)}` : 'Yetkazish: bepul'}
                </span>
              )
            )}
            {p.min_order_amount > 0 && (
              <span className="inline-flex items-center rounded-full bg-go-chip px-3 py-1.5 font-[600] text-go-muted">
                kamida {som(p.min_order_amount)}
              </span>
            )}
            {p.free_delivery_threshold > 0 && (
              <span className="inline-flex items-center rounded-full bg-go-soft px-3 py-1.5 font-[700] text-go-green">
                {som(p.free_delivery_threshold)} dan bepul yetkazish
              </span>
            )}
          </div>
        )}

        {!open && (
          <Notice tone="danger" icon={<IconLock size={18} />} className="mt-3">
            {p.partner_type === 'SHOP' ? "Do'kon" : 'Muassasa'} hozir yopiq
            {opensAtLabel(p)
              ? ` · ${opensAtLabel(p)} da ochiladi`
              : hours
                ? ` · Ish vaqti: ${hours}`
                : ''}
          </Notice>
        )}
        {open && out && (
          <Notice tone="warn" icon={<IconPin size={18} />} className="mt-3">
            Manzilingizga yetkazmaydi.{' '}
            <button
              type="button"
              onClick={() => setLocationOpen(true)}
              className="cursor-pointer border-0 bg-transparent p-0 font-[800] text-inherit underline"
            >
              Manzilni o&apos;zgartirish
            </button>
            {p.partner_type === 'RESTAURANT' ? " yoki «O'zi olib ketish»ni tanlang." : ''}
          </Notice>
        )}
      </div>
      <PartnerInfoSheet
        partner={p}
        open={info}
        onClose={() => setInfo(false)}
        lat={lat}
        lng={lng}
      />
    </>
  )
}
