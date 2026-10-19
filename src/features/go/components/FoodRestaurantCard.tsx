import Link from 'next/link'
import type { Partner } from '../lib/types'
import { useFavorite } from '../lib/favorites'
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
import { IconHeart, IconNavigate, IconScooter, IconStar } from '../ui/icons'
import { Img } from '../ui/primitives'
import { partnerHref } from './PartnerCard'

/** Rasm ustidagi yurakcha: maskanni sevimlilarga qo'shadi */
function Heart({ uuid, className }: { uuid: string; className?: string }) {
  const { fav, toggle } = useFavorite(uuid)
  return (
    <button
      type="button"
      aria-label={fav ? 'Sevimlilardan olib tashlash' : "Sevimlilarga qo'shish"}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle()
      }}
      className={cx(
        'absolute flex cursor-pointer items-center justify-center border-0 bg-transparent p-1.5 drop-shadow-[0_1px_6px_rgba(0,0,0,0.4)]',
        className
      )}
    >
      <IconHeart size={28} filled={fav} className={fav ? 'text-go-red' : 'text-white'} />
    </button>
  )
}

/** Superapp `_FoodRestaurantCard`: 16:9 rasm, ostida nom · yetkazish vaqti · reyting */
export function FoodRestaurantCard({
  partner: p,
  lat,
  lng,
  pickup,
  className,
}: {
  partner: Partner
  lat: number | null
  lng: number | null
  pickup?: boolean
  className?: string
}) {
  const open = isOpenNow(p)
  const zone = zoneFor(p, lat, lng)
  const eta = etaRange(zone?.estimated_minutes)
  const km =
    lat != null && lng != null && p.lat != null && p.lng != null
      ? distanceKm(lat, lng, p.lat, p.lng)
      : null
  const hours = workingHoursLabel(p)

  let info: string | null
  if (pickup)
    info = [km != null ? distanceLabel(km) : null, p.address].filter(Boolean).join(' · ') || null
  else info = eta || (lat == null ? 'Manzilni tanlang' : null)

  return (
    <Link
      href={partnerHref(p, pickup)}
      className={cx('group block min-w-0 text-inherit no-underline', className)}
      aria-label={p.name}
    >
      <div className="relative aspect-video overflow-hidden rounded-[16px] bg-[#F2F3F5]">
        <Img
          src={p.banner || p.logo}
          alt={p.name}
          grayscale={!open}
          className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
        />
        {!open && (
          <span className="absolute bottom-2.5 left-2.5 rounded-lg bg-[#111]/90 px-[9px] py-[5px] text-[0.75rem] font-[700] text-white">
            {`Yopiq${hours ? ` · ${hours}` : opensAtLabel(p) ? ` · ${opensAtLabel(p)} da ochiladi` : ''}`}
          </span>
        )}
        <Heart uuid={p.uuid} className="right-1.5 top-1.5" />
      </div>
      <div className="mt-2 flex items-start gap-2.5">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[1.0625rem] font-[800] tracking-[-0.3px] text-[#111]">
            {p.name}
          </div>
          {info && (
            <div className="mt-0.5 flex items-center gap-1 text-[0.844rem] text-[#6B7280]">
              {pickup ? (
                <IconNavigate size={16} className="shrink-0" />
              ) : (
                <IconScooter size={16} className="shrink-0" />
              )}
              <span className="truncate">{info}</span>
            </div>
          )}
        </div>
        {p.rating > 0 && (
          <span className="flex shrink-0 items-center gap-0.5 text-[0.906rem] font-[700] text-[#111]">
            <IconStar size={18} className="text-go-gold" />
            {p.rating.toFixed(1)}
          </span>
        )}
      </div>
    </Link>
  )
}

/** Superapp `_StoreListCard`: keng banner, chap pastda oq ramkali logo, ostida nom · reyting va ma'lumot */
export function StoreListCard({
  partner: p,
  lat,
  lng,
  className,
}: {
  partner: Partner
  lat: number | null
  lng: number | null
  className?: string
}) {
  const open = isOpenNow(p)
  const out = isOutOfZone(p, lat, lng)
  const zone = zoneFor(p, lat, lng)
  const eta = etaRange(zone?.estimated_minutes)
  const fee = zone ? (zone.delivery_fee ?? p.delivery_fee) : null
  const info = [
    !open ? (opensAtLabel(p) ? `${opensAtLabel(p)} da ochiladi` : 'Hozir yopiq') : null,
    open && out ? 'Manzilingizga yetkazmaydi' : null,
    open && eta ? eta.replace('daq', 'daq') : null,
    open && fee != null ? (fee > 0 ? `Yetkazish ${som(fee)}` : 'Bepul yetkazish') : null,
    p.min_order_amount > 0 ? `Min. ${som(p.min_order_amount)}` : null,
  ].filter(Boolean) as string[]

  return (
    <Link
      href={partnerHref(p)}
      className={cx('block min-w-0 text-inherit no-underline', className)}
      aria-label={p.name}
    >
      <div className="relative h-[176px]">
        <div className="absolute inset-x-0 bottom-[30px] top-0 overflow-hidden rounded-[22px] bg-[#F2F3F5]">
          <Img src={p.banner || p.logo} alt={p.name} grayscale={!open} className="h-full w-full" />
          {!open && <div className="absolute inset-0 bg-black/25" />}
          {open && fee === 0 && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-lg bg-go-bright py-[3px] pl-1.5 pr-2 text-[0.719rem] font-[700] text-white">
              <IconScooter size={14} /> Bepul yetkazish
            </span>
          )}
          {!open && (
            <span className="absolute left-3 top-3 rounded-[9px] bg-black/60 px-[9px] py-1 text-[0.75rem] font-[700] text-white">
              Hozir yopiq
            </span>
          )}
          <Heart uuid={p.uuid} className="right-1 top-1" />
        </div>
        <div className="absolute bottom-0 left-3.5 h-16 w-16 rounded-[18px] bg-white p-[3px] shadow-[0_4px_12px_rgba(0,0,0,0.14)]">
          <Img src={p.logo || p.banner} alt="" className="h-full w-full rounded-[15px]" />
        </div>
        <div className="absolute bottom-0.5 left-[88px] right-1 flex h-6 items-center gap-1">
          <span className="min-w-0 flex-1 truncate text-[1.0625rem] font-[800] text-[#111]">
            {p.name}
          </span>
          {p.rating > 0 && (
            <>
              <IconStar size={17} className="text-[#111]" />
              <span className="text-[0.938rem] font-[600] text-[#111]">{p.rating.toFixed(1)}</span>
            </>
          )}
        </div>
      </div>
      {info.length > 0 && (
        <div
          className={cx(
            'truncate pl-[88px] pr-1 pt-px text-[0.8125rem]',
            !open || out ? 'text-[#DC2626]' : 'text-[#6B7280]'
          )}
        >
          {info.join(' · ')}
        </div>
      )}
    </Link>
  )
}
