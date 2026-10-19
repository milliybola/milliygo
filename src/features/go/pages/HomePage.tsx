import Link from 'next/link'
import { useMemo, useState, type ReactNode } from 'react'
import { useNeighborhoods } from '@/hooks/useNeighborhoods'
import { checkServiceArea } from '@/helpers/location-helper'
import ActiveOrdersStrip from '../components/ActiveOrdersStrip'
import InstructionStories from '../components/InstructionStories'
import PartnerCard, { sortPartners } from '../components/PartnerCard'
import PromoCarousel from '../components/PromoCarousel'
import RateCourierPrompt from '../components/RateCourierPrompt'
import { LocationCard } from '../layout/GoHeader'
import { SUPPORT_TELEGRAM } from '../layout/GoFooter'
import { useBanners, useOrders, usePartners } from '../lib/queries'
import { useUi, useUserLocation } from '../lib/session'
import type { Partner } from '../lib/types'
import { isOpenNow, zoneFor } from '../lib/utils'
import {
  IconArrowRight,
  IconBasket,
  IconBellRing,
  IconBolt,
  IconChat,
  IconChevronRight,
  IconGrid,
  IconPill,
  IconPin,
  IconScooter,
  IconSearch,
  IconSliders,
  IconStar,
  IconTaxi,
  IconTruck,
} from '../ui/icons'
import { Button, Chip, Notice, Page, SectionTitle, SeeAll, Skeleton } from '../ui/primitives'

type Filter = 'all' | 'fast' | 'top' | 'free'

/** Ilovadagi xizmat kartasi: rasm, pastki chapda to'q matn, pastki o'ngda oq doirada rangli strelka */
function ServiceCard({
  href,
  title,
  subtitle,
  image,
  accent,
}: {
  href: string
  title: string
  subtitle: string
  image: string
  accent: string
}) {
  return (
    <Link
      href={href}
      className="group relative block aspect-[902/772] overflow-hidden rounded-[22px] bg-[#FFF4CC] no-underline lg:aspect-auto lg:h-[250px]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-x-0 bottom-0 hidden h-[40%] bg-gradient-to-t from-white/90 via-white/45 to-transparent lg:block" />
      <div className="absolute inset-x-0 bottom-0 flex items-end gap-1.5 pb-[9px] pl-[11px] pr-[9px] lg:pb-4 lg:pl-5 lg:pr-4">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[1.0625rem] font-[900] leading-none tracking-[-0.4px] text-[#111] lg:text-[1.5rem]">
            {title}
          </div>
          <div className="mt-0.5 line-clamp-2 text-[0.656rem] font-[500] leading-[1.15] text-[#374151] lg:mt-1 lg:text-[0.9rem]">
            {subtitle}
          </div>
        </div>
        <span
          className="mb-1.5 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.06)] lg:h-10 lg:w-10"
          style={{ color: accent }}
        >
          <IconChevronRight size={21} />
        </span>
      </div>
    </Link>
  )
}

function NearbySection({
  title,
  partners,
  promoIds,
  href,
  lat,
  lng,
  compact,
}: {
  title: string
  partners: Partner[]
  promoIds: Set<string>
  href: string
  lat: number | null
  lng: number | null
  compact?: boolean
}) {
  const [filter, setFilter] = useState<Filter>('all')
  const items = useMemo(() => {
    let list = partners
    if (filter === 'fast')
      list = list.filter((p) => (zoneFor(p, lat, lng)?.estimated_minutes ?? 999) <= 30)
    if (filter === 'top') list = list.filter((p) => p.rating >= 4.5)
    if (filter === 'free') list = list.filter((p) => zoneFor(p, lat, lng)?.delivery_fee === 0)
    return sortPartners(list, lat, lng).slice(0, compact ? 4 : 12)
  }, [partners, filter, lat, lng, compact])

  if (!partners.length) return null
  const hasLoc = lat != null && lng != null
  return (
    <section className="mt-1.5 pb-2.5">
      <Page>
        <SectionTitle className="!mb-0.5" action={compact ? undefined : <SeeAll href={href} />}>
          {title}
        </SectionTitle>
        {!compact && (
          <div className="no-scrollbar -mx-4 mb-1.5 flex gap-2 overflow-x-auto px-4 pb-[5px] pt-[3px] lg:mx-0 lg:px-0">
            <Chip
              active={filter === 'all'}
              onClick={() => setFilter('all')}
              icon={<IconGrid size={16} className={filter === 'all' ? '' : 'text-go-green'} />}
            >
              Barchasi
            </Chip>
            {hasLoc && (
              <Chip
                active={filter === 'fast'}
                onClick={() => setFilter('fast')}
                icon={<IconBolt size={16} className={filter === 'fast' ? '' : 'text-go-red'} />}
              >
                Tez yetkazish
              </Chip>
            )}
            <Chip
              active={filter === 'top'}
              onClick={() => setFilter('top')}
              icon={<IconStar size={16} className={filter === 'top' ? '' : 'text-go-gold'} />}
            >
              Reyting yuqori
            </Chip>
            {hasLoc && (
              <Chip
                active={filter === 'free'}
                onClick={() => setFilter('free')}
                icon={
                  <IconScooter size={16} className={filter === 'free' ? '' : 'text-go-green'} />
                }
              >
                Bepul yetkazish
              </Chip>
            )}
          </div>
        )}
      </Page>
      {items.length === 0 ? (
        <Page>
          <p className="m-0 px-0 py-6 text-[0.844rem] text-[#6B7280]">
            Bu filtr bo&apos;yicha hozircha joy topilmadi
          </p>
        </Page>
      ) : compact ? (
        <Page>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-4 lg:grid-cols-4">
            {items.map((p) => (
              <PartnerCard
                key={p.uuid}
                partner={p}
                lat={lat}
                lng={lng}
                small
                hasPromo={promoIds.has(p.uuid)}
              />
            ))}
          </div>
          <Link
            href={href}
            className="mt-3.5 flex h-[46px] w-full items-center justify-center gap-1.5 rounded-[14px] border border-solid border-[#D7EBDD] bg-[#F3FAF5] text-[0.906rem] font-[700] text-go-green no-underline lg:mx-auto lg:max-w-[360px]"
          >
            Barcha do&apos;konlar <IconArrowRight size={18} />
          </Link>
        </Page>
      ) : (
        <div className="mx-auto w-full max-w-[720px] lg:max-w-[1180px] lg:px-6">
          <div className="no-scrollbar flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-3 lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible lg:px-0 xl:grid-cols-4">
            {items.map((p) => (
              <PartnerCard
                key={p.uuid}
                partner={p}
                lat={lat}
                lng={lng}
                hasPromo={promoIds.has(p.uuid)}
                className="w-[286px] shrink-0 snap-start lg:w-auto"
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

const UPCOMING: { title: string; subtitle: string; icon: ReactNode; color: string }[] = [
  {
    title: 'MilliyGo Taxi',
    subtitle: "Shahar bo'ylab qulay, arzon va xavfsiz taksi",
    icon: <IconTaxi size={21} />,
    color: '#D97706',
  },
  {
    title: 'MilliyGo Market',
    subtitle: 'Oziq-ovqat va uy mollari 15 daqiqada',
    icon: <IconBasket size={21} />,
    color: '#16A34A',
  },
  {
    title: 'Dorixona 24/7',
    subtitle: 'Retseptli va tezkor dorilar yetkazish',
    icon: <IconPill size={21} />,
    color: '#DC2626',
  },
  {
    title: 'Yuk Tashish',
    subtitle: "Katta o'lchamli yuklar va ko'chish xizmati",
    icon: <IconTruck size={21} />,
    color: '#9333EA',
  },
]

/** Ilovadagi manzil kartasidagi vaqt: restoranlarning haqiqiy `estimated_minutes` qiymatlaridan */
function etaLabel(partners: Partner[], lat: number | null, lng: number | null) {
  if (lat == null || lng == null) return null
  const mins = partners
    .filter((p) => p.partner_type === 'RESTAURANT')
    .map((p) => zoneFor(p, lat, lng)?.estimated_minutes)
    .filter((m): m is number => typeof m === 'number' && m > 0)
  if (!mins.length) return null
  const lo = Math.min(...mins)
  const hi = Math.max(...mins)
  return lo === hi ? `${lo} daq` : `${lo}-${hi} daq`
}

export default function HomePage() {
  const { lat, lng, hasLocation } = useUserLocation()
  const setLocationOpen = useUi((s) => s.setLocationOpen)
  const { neighborhoods } = useNeighborhoods()
  const partnersQ = usePartners()
  const bannersQ = useBanners()
  const { active, orders } = useOrders({ poll: true })

  const all = partnersQ.data || []
  const restaurants = all.filter((p) => p.partner_type === 'RESTAURANT')
  const shops = all.filter((p) => p.partner_type === 'SHOP')
  const banners = bannersQ.data || []
  const promoIds = new Set(banners.map((b) => b.partner?.uuid).filter(Boolean) as string[])
  const outsideArea =
    hasLocation &&
    lat != null &&
    lng != null &&
    neighborhoods.length > 0 &&
    !checkServiceArea(lat, lng, neighborhoods)
  const anyOpen = all.some((p) => isOpenNow(p))

  return (
    <div className="pb-6 pt-1 lg:pt-6">
      <RateCourierPrompt orders={orders} />
      <Page>
        {/* Telefon: ilovadagi kabi manzil kartasi va qidiruv (kompyuterda sarlavhada) */}
        <div className="lg:hidden">
          <LocationCard eta={etaLabel(all, lat, lng)} />
          <div className="mt-3 flex items-center gap-2.5">
            <Link
              href="/search/"
              className="flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-[22px] border border-solid border-go-line bg-[#F8F9FB] px-3.5 no-underline"
            >
              <IconSearch size={22} className="shrink-0 text-go-muted" />
              <span className="truncate text-[0.844rem] font-[500] text-[#7B8AA3]">
                Taom, restoran yoki mahsulot qidirish...
              </span>
            </Link>
            <Link
              href="/search/"
              aria-label="Filtrlar"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-solid border-[#EDEFF3] bg-white text-[#111827]"
            >
              <IconSliders size={21} />
            </Link>
          </div>
        </div>

        {outsideArea && (
          <Notice tone="danger" icon={<IconPin size={18} />} className="mt-3">
            <b>Xizmat doirasidan tashqari.</b> Hozircha tanlangan hududda xizmat
            ko&apos;rsatilmaydi.{' '}
            <button
              type="button"
              onClick={() => setLocationOpen(true)}
              className="cursor-pointer border-0 bg-transparent p-0 font-[800] text-inherit underline"
            >
              Manzilni o&apos;zgartirish
            </button>
          </Notice>
        )}
        <div className="mt-3.5 grid grid-cols-2 gap-3 lg:mt-0 lg:gap-4">
          <ServiceCard
            href="/restaurants/"
            title="Taomlar"
            subtitle="Restoranlardan tez yetkazib berish"
            image="/go/service_food.webp"
            accent="#F59E0B"
          />
          <ServiceCard
            href="/store/"
            title="Do'konlar"
            subtitle="Oziq-ovqat va boshqa mahsulotlar"
            image="/go/service_store.webp"
            accent="#EF4444"
          />
        </div>
        {active.length > 0 && (
          <div className="mt-3">
            <ActiveOrdersStrip orders={active} />
          </div>
        )}
      </Page>

      {bannersQ.isLoading ? (
        <Page className="my-[18px]">
          <Skeleton className="h-[150px]" />
        </Page>
      ) : banners.length > 0 ? (
        <div className="mx-auto my-[18px] w-full max-w-[720px] lg:max-w-[1180px] lg:px-6">
          <PromoCarousel banners={banners} height={150} />
        </div>
      ) : (
        <div className="h-[18px]" />
      )}

      {partnersQ.isLoading ? (
        <Page className="mt-2">
          <Skeleton className="mb-3 h-6 w-64" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[190px]" />
            ))}
          </div>
        </Page>
      ) : partnersQ.isError ? (
        <Page className="mt-2">
          <Notice tone="danger">
            Maskanlarni yuklab bo&apos;lmadi. Internetni tekshirib, sahifani yangilang.
          </Notice>
        </Page>
      ) : (
        <>
          {!hasLocation && (
            <Page className="mb-4 hidden lg:block">
              <button
                type="button"
                onClick={() => setLocationOpen(true)}
                className="flex w-full cursor-pointer items-center gap-3 rounded-[18px] border border-dashed border-go-green bg-go-soft px-4 py-3 text-left"
              >
                <IconPin size={22} className="shrink-0 text-go-green" />
                <span className="flex-1 text-[0.906rem] font-[700] text-go-green">
                  Yetkazish vaqti va narxini ko&apos;rish uchun manzilni tanlang
                </span>
              </button>
            </Page>
          )}
          {!anyOpen && all.length > 0 && (
            <Page className="mb-4">
              <Notice tone="warn">
                Hozir barcha maskanlar yopiq. Ish vaqtida buyurtma bering.
              </Notice>
            </Page>
          )}
          <NearbySection
            title="Yaqin atrofdagi restoranlar"
            partners={restaurants}
            promoIds={promoIds}
            href="/restaurants/"
            lat={lat}
            lng={lng}
          />
          <NearbySection
            title="Do'konlar va marketlar"
            partners={shops}
            promoIds={promoIds}
            href="/store/"
            lat={lat}
            lng={lng}
            compact
          />
        </>
      )}

      <section className="mt-6">
        <Page>
          <SectionTitle>Qo&apos;llanma</SectionTitle>
        </Page>
        <div className="mx-auto w-full max-w-[720px] lg:max-w-[1180px] lg:px-6">
          <InstructionStories />
        </div>
      </section>

      <section className="mt-6">
        <Page>
          <SectionTitle>
            <span className="flex items-center gap-2">
              Tez kunda
              <span className="rounded-[8px] bg-go-goldsoft px-2 py-[3px] text-[0.719rem] font-[700] tracking-normal text-go-goldtext">
                Yangi xizmatlar
              </span>
            </span>
          </SectionTitle>
        </Page>
        <div className="mx-auto w-full max-w-[720px] lg:max-w-[1180px] lg:px-6">
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 lg:grid lg:grid-cols-4 lg:px-0">
            {UPCOMING.map((u) => (
              <div
                key={u.title}
                className="flex min-h-[150px] w-[156px] shrink-0 flex-col rounded-[20px] p-3 lg:w-auto"
                style={{ background: `color-mix(in srgb, ${u.color} 10%, white)` }}
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white"
                  style={{ color: u.color }}
                >
                  {u.icon}
                </span>
                <div className="mt-2.5 truncate text-[0.906rem] font-[800] text-[#111]">
                  {u.title}
                </div>
                <div className="mt-0.5 line-clamp-2 flex-1 text-[0.719rem] leading-[1.3] text-[#6B7280]">
                  {u.subtitle}
                </div>
                <div
                  className="flex items-center gap-1 text-[0.719rem] font-[700]"
                  style={{ color: `color-mix(in srgb, ${u.color} 85%, black)` }}
                >
                  <IconBellRing size={13} /> Tez kunda
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Page className="mt-6">
        <div className="flex items-center gap-3 rounded-[20px] bg-[#E6F6EC] p-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-go-green">
            <IconChat size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[0.969rem] font-[800] text-[#111]">Savollaringiz bormi?</div>
            <div className="text-[0.781rem] text-[#4B5563]">
              Qo&apos;llab-quvvatlash xizmati yordam beradi
            </div>
          </div>
          <Button size="md" href={SUPPORT_TELEGRAM}>
            Yozish
          </Button>
        </div>
      </Page>
    </div>
  )
}
