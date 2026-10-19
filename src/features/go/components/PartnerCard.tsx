import Link from 'next/link'
import ApiGap from '@/components/common/ApiGap'
import type { Partner } from '../lib/types'
import {
  cx,
  distanceKm,
  distanceLabel,
  etaRange,
  isOpenNow,
  isOutOfZone,
  opensAtLabel,
  som,
  workingHoursLabel,
  zoneFor,
} from '../lib/utils'
import { IconPin, IconScooter, IconStar, IconWalk } from '../ui/icons'
import { Img } from '../ui/primitives'

export const partnerHref = (p: Partner, pickup = false) =>
  p.partner_type === 'SHOP'
    ? `/store/?id=${p.uuid}`
    : `/restaurant/?id=${p.uuid}${pickup ? '&mode=pickup' : ''}`

/** Faol (ochiq va yetkazadi) → yetkazmaydiganlar → yopiqlar; keyin reyting va masofa */
export function sortPartners(
  list: Partner[],
  lat: number | null,
  lng: number | null,
  pickup = false
) {
  const rank = (p: Partner) =>
    (isOpenNow(p) ? 0 : 10) + (!pickup && isOutOfZone(p, lat, lng) ? 5 : 0)
  const dist = (p: Partner) =>
    lat != null && lng != null && p.lat != null && p.lng != null
      ? distanceKm(lat, lng, p.lat, p.lng)
      : 1e9
  return [...list].sort((a, b) => {
    const r = rank(a) - rank(b)
    if (r) return r
    if (pickup) return dist(a) - dist(b)
    const byRating = b.rating - a.rating
    if (byRating) return byRating
    return dist(a) - dist(b)
  })
}

interface Props {
  partner: Partner
  lat: number | null
  lng: number | null
  pickup?: boolean
  small?: boolean
  hasPromo?: boolean
  className?: string
}

export default function PartnerCard({ partner: p, lat, lng, pickup, small, className }: Props) {
  const open = isOpenNow(p)
  const hasLoc = lat != null && lng != null
  const zone = zoneFor(p, lat, lng)
  const out = !pickup && isOutOfZone(p, lat, lng)
  const inactive = !open || out
  const eta = etaRange(zone?.estimated_minutes)
  const fee = zone ? (zone.delivery_fee ?? p.delivery_fee) : null
  const km = hasLoc && p.lat != null && p.lng != null ? distanceKm(lat!, lng!, p.lat, p.lng) : null
  const hours = workingHoursLabel(p)

  let line: React.ReactNode
  if (pickup) {
    line = (
      <>
        <IconWalk size={16} className="shrink-0 text-go-blue" />
        <span className="truncate">
          {[km != null ? distanceLabel(km) : null, p.address].filter(Boolean).join(' · ') ||
            'Olib ketish mumkin'}
        </span>
      </>
    )
  } else if (!hasLoc) {
    line = (
      <>
        <IconPin size={16} className="shrink-0" />
        <span className="truncate">Manzilni tanlang</span>
      </>
    )
  } else if (out) {
    line = (
      <>
        <IconPin size={16} className="shrink-0" />
        <span className="truncate">{small ? 'Yetkazmaydi' : 'Manzilingizga yetkazmaydi'}</span>
      </>
    )
  } else {
    line = (
      <>
        <IconScooter size={16} className="shrink-0" />
        <span className="truncate">
          {eta ? eta.replace('daq', 'daqiqa') : 'Yetkazib beriladi'}
          {!small && fee != null && fee > 0 ? ` · ${som(fee)}` : ''}
        </span>
        {!eta && !small && (
          <ApiGap note="delivery_zones[].estimated_minutes bo'sh — yetkazish vaqtini ko'rsatib bo'lmaydi" />
        )}
      </>
    )
  }

  return (
    <Link
      href={partnerHref(p, pickup)}
      className={cx('group block min-w-0 text-inherit no-underline', className)}
      aria-label={`${p.name}${inactive ? ' (nofaol)' : ''}`}
    >
      <div
        className={cx('relative overflow-hidden rounded-[20px]', small ? 'h-[104px]' : 'h-[148px]')}
      >
        <Img
          src={p.banner || p.logo}
          alt={p.name}
          grayscale={inactive}
          className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {inactive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/35 px-3 text-center text-white">
            <span className={cx('font-[900]', small ? 'text-[0.875rem]' : 'text-[1rem]')}>
              {open ? 'Yetkazib bermaydi' : 'Hozir yopiq'}
            </span>
            <span className="mt-0.5 text-[0.7812rem] font-[600] opacity-90">
              {open
                ? small
                  ? 'Hududdan tashqarida'
                  : 'Manzilingiz hududdan tashqarida'
                : opensAtLabel(p)
                  ? `${opensAtLabel(p)} da ochiladi`
                  : hours || ''}
            </span>
          </div>
        )}
        {!inactive && !pickup && zone && fee === 0 && (
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-[8px] bg-go-bright py-[3px] pl-1.5 pr-2 text-[0.719rem] font-[700] text-white">
            <IconScooter size={14} />
            {small ? 'Bepul' : 'Bepul yetkazish'}
          </span>
        )}{' '}
      </div>
      <div className="mt-2 flex items-start gap-2">
        <span
          className={cx(
            'min-w-0 flex-1 truncate font-[700] leading-tight text-go-ink',
            small ? 'text-[0.9375rem]' : 'text-[1.0625rem]'
          )}
        >
          {p.name}
        </span>
        {p.rating > 0 && (
          <span className="flex shrink-0 items-center gap-0.5 text-[0.9062rem] font-[600] text-go-ink">
            <IconStar size={17} className="text-go-ink" />
            {p.rating.toFixed(1)}
          </span>
        )}
      </div>
      <div className="mt-0.5 flex items-center gap-1.5 text-[0.875rem] text-[#374151]">{line}</div>
    </Link>
  )
}
