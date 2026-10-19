import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo, useState, type ReactNode } from 'react'
import FoodHeader from '../components/FoodHeader'
import { FoodRestaurantCard, StoreListCard } from '../components/FoodRestaurantCard'
import PromoCarousel from '../components/PromoCarousel'
import { useBanners, useBaseCategories, usePartners } from '../lib/queries'
import { useUi, useUserLocation } from '../lib/session'
import type { BaseCategory, PartnerType } from '../lib/types'
import { cx, isOutOfZone, workingHoursLabel, zoneFor } from '../lib/utils'
import {
  IconBolt,
  IconCheck,
  IconChevronDown,
  IconClose,
  IconMoon,
  IconPin,
  IconSearch,
  IconSliders,
  IconStar,
  IconTag,
} from '../ui/icons'
import { Button, EmptyState, Img, Page, Skeleton } from '../ui/primitives'
import { sortPartners } from '../components/PartnerCard'

type FilterKey = 'fast' | 'allday' | 'top' | 'promo'

const FILTERS: { key: FilterKey; label: string; icon: (on: boolean) => ReactNode }[] = [
  {
    key: 'fast',
    label: '30 daqiqagacha',
    icon: (on) => <IconBolt size={17} className={on ? '' : 'text-[#1F2937]'} />,
  },
  {
    key: 'allday',
    label: 'Tun-u kun',
    icon: (on) => <IconMoon size={17} className={on ? '' : 'text-[#1F2937]'} />,
  },
  {
    key: 'top',
    label: 'Reyting 4.5+',
    icon: (on) => <IconStar size={17} className={on ? '' : 'text-go-gold'} />,
  },
  {
    key: 'promo',
    label: 'Aksiya',
    icon: (on) => <IconTag size={17} className={on ? '' : 'text-[#1F2937]'} />,
  },
]

/** Superapp `_FoodSearchField`: och kulrang maydon — lupa + matn + filtr belgisi */
function SearchField({ hint }: { hint: string }) {
  return (
    <Link
      href="/search/"
      className="flex h-[50px] items-center gap-2.5 rounded-[20px] bg-[#F2F3F5] pl-4 pr-3.5 no-underline"
    >
      <IconSearch size={22} className="shrink-0 text-[#4B5563]" />
      <span className="min-w-0 flex-1 truncate text-[0.906rem] font-[500] text-[#8A919C]">
        {hint}
      </span>
      <IconSliders size={21} className="shrink-0 text-[#4B5563]" />
    </Link>
  )
}

/** "Buyurtma qilish" — rasmli kategoriyalar (fonsiz doira rasm, nomi pastda) */
function CategoryStrip({
  title,
  categories,
  selected,
  onSelect,
}: {
  title: string
  categories: BaseCategory[]
  selected: string | null
  onSelect: (uuid: string | null) => void
}) {
  return (
    <div className="pt-1.5">
      <h2 className="m-0 px-4 text-[1.5rem] font-[900] tracking-[-0.6px] text-[#111] lg:px-0">
        {title}
      </h2>
      <div className="no-scrollbar mt-1 flex h-[94px] overflow-x-auto px-3 lg:px-0">
        {categories.map((c) => {
          const on = selected === c.uuid
          return (
            <button
              key={c.uuid}
              type="button"
              onClick={() => onSelect(on ? null : c.uuid)}
              aria-pressed={on}
              className="relative h-[94px] w-[calc((min(100vw,720px)-12px)/4.5)] min-w-[64px] max-w-[96px] shrink-0 cursor-pointer border-0 bg-transparent p-0 lg:w-[96px]"
            >
              <span
                className={cx(
                  'mx-auto block aspect-square w-[calc(100%-4px)] min-w-[56px] max-w-[80px] p-0.5 transition-transform',
                  on && 'scale-[1.06]'
                )}
              >
                <Img
                  src={c.logo}
                  alt=""
                  className="h-full w-full bg-transparent [&_img]:object-contain"
                />
              </span>
              <span
                className={cx(
                  'absolute inset-x-0 bottom-0 mx-auto block w-fit max-w-full truncate rounded-[10px] px-2 py-[3px] text-center text-[0.8125rem] leading-[1.1]',
                  on ? 'bg-go-green font-[700] text-white' : 'font-[600] text-[#1F2937]'
                )}
              >
                {c.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Do'konlar: 4 ustunli kvadrat plitkalar, 8 tadan ko'p bo'lsa "Barchasi" */
function StoreCategoryGrid({
  categories,
  selected,
  onSelect,
}: {
  categories: BaseCategory[]
  selected: string | null
  onSelect: (uuid: string | null) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const canExpand = categories.length > 8
  const visible = canExpand && !expanded ? categories.slice(0, 8) : categories
  return (
    <div className="px-4 lg:px-0">
      <div className="flex items-center">
        <h2 className="m-0 flex-1 text-[1.25rem] font-[800] tracking-[-0.4px] text-[#1B1F2E]">
          Kategoriyalar
        </h2>
        {canExpand && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex cursor-pointer items-center border-0 bg-transparent px-1.5 py-1 text-[0.875rem] font-[700] text-go-green"
          >
            {expanded ? "Yig'ish" : 'Barchasi'}
            <IconChevronDown
              size={20}
              className={cx('transition-transform', expanded && 'rotate-180')}
            />
          </button>
        )}
      </div>
      <div className="mt-2.5 grid grid-cols-4 gap-x-2.5 gap-y-3 lg:grid-cols-8">
        {visible.map((c) => {
          const on = selected === c.uuid
          return (
            <button
              key={c.uuid}
              type="button"
              onClick={() => onSelect(on ? null : c.uuid)}
              className="cursor-pointer border-0 bg-transparent p-0 text-center"
            >
              <span
                className={cx(
                  'relative block aspect-square overflow-hidden rounded-[16px] bg-[#F2F3F5]',
                  on && 'border-2 border-solid border-go-green'
                )}
              >
                <Img src={c.logo} alt="" className="h-full w-full" />
                {on && (
                  <span className="absolute right-1.5 top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-go-green text-white">
                    <IconCheck size={13} />
                  </span>
                )}
              </span>
              <span
                className={cx(
                  'mt-[5px] line-clamp-2 block text-[0.719rem] leading-[1.2]',
                  on ? 'font-[800] text-go-green' : 'font-[600] text-[#111]'
                )}
              >
                {c.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function PartnersListPage({ type }: { type: PartnerType }) {
  const router = useRouter()
  const isShop = type === 'SHOP'
  const pickup = !isShop && router.query.mode === 'pickup'
  const { lat, lng, hasLocation } = useUserLocation()
  const setLocationOpen = useUi((s) => s.setLocationOpen)
  const partnersQ = usePartners(type)
  const bannersQ = useBanners(type)
  const catsQ = useBaseCategories(type)
  const [cat, setCat] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterKey[]>([])

  const banners = useMemo(() => bannersQ.data || [], [bannersQ.data])
  const promoIds = useMemo(
    () => new Set(banners.map((b) => b.partner?.uuid).filter(Boolean) as string[]),
    [banners]
  )
  const categories = useMemo(() => catsQ.data || [], [catsQ.data])
  const all = useMemo(() => partnersQ.data || [], [partnersQ.data])

  const deliverable = useMemo(
    () => (isShop || pickup || !hasLocation ? all : all.filter((p) => !isOutOfZone(p, lat, lng))),
    [all, isShop, pickup, hasLocation, lat, lng]
  )

  const list = useMemo(() => {
    let l = deliverable
    if (cat) {
      const ids = new Set(categories.find((c) => c.uuid === cat)?.partner_uuids || [])
      l = l.filter((p) => ids.has(p.uuid))
    }
    for (const f of pickup ? [] : filters) {
      if (f === 'fast') l = l.filter((p) => (zoneFor(p, lat, lng)?.estimated_minutes ?? 999) <= 30)
      if (f === 'top') l = l.filter((p) => p.rating >= 4.5)
      if (f === 'promo') l = l.filter((p) => promoIds.has(p.uuid))
      if (f === 'allday')
        l = l.filter((p) => {
          const h = workingHoursLabel(p)
          return !!h && (h === '00:00 - 23:59' || h === '00:00 - 00:00')
        })
    }
    return sortPartners(l, lat, lng, pickup)
  }, [deliverable, cat, categories, filters, lat, lng, pickup, promoIds])

  const toggle = (f: FilterKey) =>
    setFilters((s) => (s.includes(f) ? s.filter((x) => x !== f) : [...s, f]))
  const nobodyDelivers =
    !isShop && !pickup && hasLocation && all.length > 0 && deliverable.length === 0
  const title = isShop ? "Do'konlar" : pickup ? 'Olib ketishga' : 'Taomlar'
  const hasActive = filters.length > 0

  return (
    <div className="pb-6">
      <FoodHeader title={title} />

      <Page className="pt-2.5 lg:pt-6">
        <h1 className="m-0 mb-4 hidden text-[2.125rem] font-[900] tracking-[-0.6px] text-go-ink lg:block">
          {title}
        </h1>
        {!pickup && (
          <div className="lg:max-w-[560px]">
            <SearchField
              hint={
                isShop ? "Mahsulot yoki do'konni qidirish..." : 'Taom yoki restoranni qidirish...'
              }
            />
          </div>
        )}
      </Page>

      {banners.length > 0 && !pickup && (
        <div className="mx-auto my-2 mt-3 w-full max-w-[720px] lg:max-w-[1180px] lg:px-6">
          <PromoCarousel banners={banners} />
        </div>
      )}

      {categories.length > 0 && (
        <div className="mx-auto w-full max-w-[720px] lg:max-w-[1180px] lg:px-6">
          {isShop ? (
            <div className="pt-3">
              <StoreCategoryGrid categories={categories} selected={cat} onSelect={setCat} />
            </div>
          ) : (
            <CategoryStrip
              title={pickup ? 'Olib ketishga' : 'Buyurtma qilish'}
              categories={categories}
              selected={cat}
              onSelect={setCat}
            />
          )}
        </div>
      )}

      {isShop && !partnersQ.isLoading && list.length > 0 && (
        <Page className="pt-3">
          <div className="flex items-end gap-2">
            <h2 className="m-0 text-[1.25rem] font-[800] tracking-[-0.4px] text-[#1B1F2E]">
              Do&apos;konlar
            </h2>
            <span className="pb-[3px] text-[0.875rem] font-[600] text-[#9CA3AF]">
              {list.length} ta
            </span>
          </div>
        </Page>
      )}

      {!pickup && (
        <div
          className={cx(
            'mx-auto w-full max-w-[720px] lg:max-w-[1180px] lg:px-6',
            isShop ? 'pt-2.5' : 'pt-3'
          )}
        >
          <div className="no-scrollbar flex h-10 gap-2 overflow-x-auto px-4 lg:px-0">
            <button
              type="button"
              aria-label={hasActive ? 'Filtrlarni tozalash' : 'Filtrlar'}
              onClick={() => hasActive && setFilters([])}
              className={cx(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-0 transition-colors',
                hasActive
                  ? 'cursor-pointer bg-go-green text-white'
                  : 'cursor-default bg-[#F2F3F5] text-[#1F2937]'
              )}
            >
              {hasActive ? <IconClose size={20} /> : <IconSliders size={20} />}
            </button>
            {FILTERS.map((f) => {
              const on = filters.includes(f.key)
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => toggle(f.key)}
                  aria-pressed={on}
                  className={cx(
                    'flex h-10 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-[20px] border-0 px-3.5 text-[0.844rem] font-[600] transition-colors',
                    on ? 'bg-go-green text-white' : 'bg-[#F2F3F5] text-[#1F2937]'
                  )}
                >
                  {f.icon(on)}
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <Page className="mt-[18px]">
        {partnersQ.isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <Skeleton className="aspect-video rounded-[16px]" />
                <Skeleton className="mt-2 h-5 w-1/2" />
              </div>
            ))}
          </div>
        ) : partnersQ.isError ? (
          <EmptyState
            emoji="📡"
            title="Ma'lumotni yuklab bo'lmadi"
            text="Internetni tekshirib, qaytadan urinib ko'ring"
            action={<Button onClick={() => partnersQ.refetch()}>Qayta urinish</Button>}
          />
        ) : nobodyDelivers ? (
          <div className="flex flex-col items-center px-8 py-10 text-center">
            <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[#FEF3C7] text-[#B45309]">
              <IconPin size={34} />
            </span>
            <h3 className="m-0 mt-3.5 text-[1.0625rem] font-[800] text-[#111]">
              Bu manzilga hozircha yetkazmaymiz
            </h3>
            <p className="mb-4 mt-1.5 text-[0.844rem] leading-[1.4] text-[#6B7280]">
              Restoranlar faqat o&apos;z yetkazib berish hududlariga xizmat ko&apos;rsatadi. Boshqa
              manzilni tanlab ko&apos;ring yoki &quot;Olib ketishga&quot; bo&apos;limidan
              foydalaning.
            </p>
            <button
              type="button"
              onClick={() => setLocationOpen(true)}
              className="h-10 cursor-pointer rounded-[20px] border-0 bg-go-green px-4 text-[0.875rem] font-[700] text-white"
            >
              Manzilni o&apos;zgartirish
            </button>
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center px-8 py-10 text-center">
            <h3 className="m-0 text-[1.0625rem] font-[800] text-[#111]">
              {all.length ? 'Mos maskan topilmadi' : 'Maskanlar topilmadi'}
            </h3>
            {all.length > 0 && (
              <>
                <p className="mb-3.5 mt-1 text-[0.844rem] text-[#6B7280]">
                  Tanlangan filtrlarni o&apos;zgartirib ko&apos;ring
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFilters([])
                    setCat(null)
                  }}
                  className="h-10 cursor-pointer rounded-[20px] border-0 bg-go-green px-4 text-[0.875rem] font-[700] text-white"
                >
                  Filtrlarni tozalash
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) =>
              isShop ? (
                <StoreListCard key={p.uuid} partner={p} lat={lat} lng={lng} />
              ) : (
                <FoodRestaurantCard key={p.uuid} partner={p} lat={lat} lng={lng} pickup={pickup} />
              )
            )}
          </div>
        )}
      </Page>
    </div>
  )
}
