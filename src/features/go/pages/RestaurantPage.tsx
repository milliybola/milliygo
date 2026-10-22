import PartnerSeo from '../components/PartnerSeo'
import Link from 'next/link'
import { message } from 'antd'
import { useEffect, useMemo, useRef, useState } from 'react'
import DeliveryProgressPanel, { ClosedBar } from '../components/DeliveryProgressPanel'
import MenuSearchSheet from '../components/MenuSearchSheet'
import { PartnerInfoSheet } from '../components/PartnerHeader'
import ProductCard, { SetCard } from '../components/ProductCard'
import ProductSheet from '../components/ProductSheet'
import { cartCount, cartSubtotal, useCart } from '../lib/cart'
import { useMenu, usePartner, usePromotions, useSets } from '../lib/queries'
import { useQueryParam, useRouteId } from '../lib/route'
import { useFavorite } from '../lib/favorites'
import { useHydrated, useUserLocation } from '../lib/session'
import type { MenuCategory, Product, ProductSet } from '../lib/types'
import { cx, etaRange, isOpenNow, isOutOfZone, som, workingHoursLabel, zoneFor } from '../lib/utils'
import {
  IconBack,
  IconChevronRight,
  IconClose,
  IconHeart,
  IconInfo,
  IconLock,
  IconMore,
  IconPin,
  IconScooter,
  IconSearch,
  IconShare,
  IconStar,
} from '../ui/icons'
import { Button, EmptyState, Notice, Page, Skeleton } from '../ui/primitives'

/** Yuqori panel (56) + tablar (52): telefon/planshetda umumiy sarlavha yo'q, kompyuterda u 72px */
const TOP_MOBILE = 56 + 52
const TOP_DESKTOP = 72 + 56 + 52

const isDesktop = () => typeof window !== 'undefined' && window.innerWidth >= 1024

/** Tablar ostidan o'tgan oxirgi bo'lim — joriy (scroll-spy) */
function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState<string | null>(null)
  useEffect(() => {
    if (!ids.length) return
    const onScroll = () => {
      const inset = (isDesktop() ? TOP_DESKTOP : TOP_MOBILE) + 12
      let cur = ids[0]
      for (const id of ids) {
        const el = document.getElementById(`cat-${id}`)
        if (el && el.getBoundingClientRect().top <= inset) cur = id
      }
      setActive(cur)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [ids])
  return active
}

export function scrollToSection(id: string) {
  const el = document.getElementById(`cat-${id}`)
  if (!el) return
  const y =
    el.getBoundingClientRect().top + window.scrollY - (isDesktop() ? TOP_DESKTOP : TOP_MOBILE)
  window.scrollTo({ top: y, behavior: 'smooth' })
}

/** Superapp TabBar: matnli tablar, tanlangani qora va ostida yashil chiziq */
function Tabs({ items, active }: { items: { id: string; name: string }[]; active: string | null }) {
  const bar = useRef<HTMLDivElement>(null)
  const [stuck, setStuck] = useState(false)
  useEffect(() => {
    if (!active || !bar.current) return
    const el = bar.current.querySelector<HTMLElement>(`[data-tab="${active}"]`)
    if (el) bar.current.scrollTo({ left: el.offsetLeft - 16, behavior: 'smooth' })
  }, [active])
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 120)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  if (items.length < 1) return null
  return (
    <div
      className={cx(
        'sticky top-14 z-[50] bg-white transition-shadow lg:top-[128px]',
        stuck && 'shadow-[0_4px_10px_rgba(0,0,0,0.06)]'
      )}
    >
      <div
        ref={bar}
        className="no-scrollbar mx-auto flex h-[52px] w-full max-w-[720px] items-stretch gap-1 overflow-x-auto px-3 lg:max-w-[1180px] lg:px-5"
      >
        {items.map((c) => (
          <button
            key={c.id}
            type="button"
            data-tab={c.id}
            onClick={() => scrollToSection(c.id)}
            className={cx(
              'relative shrink-0 cursor-pointer whitespace-nowrap border-0 bg-transparent px-3 text-[1.0625rem] transition-colors',
              active === c.id ? 'font-[800] text-[#111]' : 'font-[600] text-[#A3A9B3]'
            )}
          >
            {c.name}
            {active === c.id && (
              <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-[2px] bg-go-green" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Superapp AppBar: orqaga, (aylantirilganda) sarlavha, qidiruv, sevimli, yopish */
function TopBar({
  title,
  showTitle,
  fav,
  onFav,
  onSearch,
}: {
  title: string
  showTitle: boolean
  fav: boolean
  onFav: () => void
  onSearch: () => void
}) {
  const icon =
    'flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-[#111] no-underline hover:bg-go-chip'
  return (
    <div className="sticky top-0 z-[60] bg-white lg:top-[72px]">
      <div className="mx-auto flex h-14 w-full max-w-[720px] items-center gap-0.5 px-1.5 lg:max-w-[1180px] lg:px-4">
        <button
          type="button"
          aria-label="Orqaga"
          className={icon}
          onClick={() => {
            if (window.history.length > 1) window.history.back()
            else window.location.href = '/restaurants/'
          }}
        >
          <IconBack size={26} />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <span
            className={cx(
              'inline-block max-w-full truncate text-[1.0625rem] font-[800] text-[#111] transition-all duration-200',
              showTitle ? 'translate-y-0 opacity-100' : 'translate-y-1.5 opacity-0'
            )}
          >
            {title}
          </span>
        </div>
        <button type="button" aria-label="Menyudan qidirish" className={icon} onClick={onSearch}>
          <IconSearch size={26} />
        </button>
        <button
          type="button"
          aria-label={fav ? 'Sevimlilardan olib tashlash' : "Sevimlilarga qo'shish"}
          className={icon}
          onClick={onFav}
        >
          <IconHeart size={26} filled={fav} className={fav ? 'text-go-red' : ''} />
        </button>
        <Link href="/" aria-label="Yopish" className={icon}>
          <IconClose size={26} />
        </Link>
      </div>
    </div>
  )
}

function InfoCell({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div className="leading-tight">
        <div className="text-[0.969rem] font-[800] text-[#111]">{value}</div>
        <div className="text-[0.781rem] text-[#6B7280]">{label}</div>
      </div>
    </div>
  )
}

export default function RestaurantPage() {
  const id = useRouteId('restaurant')
  const modeParam = useQueryParam('mode')
  const hydrated = useHydrated()
  const { lat, lng } = useUserLocation()
  const partnerQ = usePartner(id)
  const menuQ = useMenu(id)
  const setsQ = useSets(id)
  const promosQ = usePromotions(id)
  const setMode = useCart((s) => s.setMode)
  const refreshPartner = useCart((s) => s.refreshPartner)
  const mode =
    useCart((s) => (id ? s.carts[id]?.mode || s.preferredMode[id] : undefined)) || 'DELIVERY'
  const cart = useCart((s) => (id ? s.carts[id] : undefined))

  const [product, setProduct] = useState<Product | null>(null)
  const [set, setSet] = useState<ProductSet | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [info, setInfo] = useState(false)
  const [showTitle, setShowTitle] = useState(false)
  const { fav, toggle } = useFavorite(id || undefined)

  const partner = partnerQ.data
  useEffect(() => {
    if (partner) refreshPartner(partner)
  }, [partner, refreshPartner])

  // "Olib ketishga" bo'limidan kelganda — olib ketish rejimi
  useEffect(() => {
    if (partner && modeParam === 'pickup') setMode(partner, 'PICKUP')
  }, [partner, modeParam, setMode])

  useEffect(() => {
    const onScroll = () => setShowTitle(window.scrollY > 70)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // 1+1 / 2+1: mahsulotdagi `promotion` yoki /partner/promotions/ ro'yxatidan
  const categories: MenuCategory[] = useMemo(() => {
    const promos = promosQ.data?.data || []
    const byProduct = new Map<string, (typeof promos)[number]>()
    promos.forEach((pr) => pr.products.forEach((pid) => byProduct.set(pid, pr)))
    // Setlar (kind=SET) "Setlar" bo'limida ko'rsatiladi — menyuda ikkinchi marta chiqmasligi uchun
    // (bo'lim ishlamay qolsa, set oddiy mahsulot sifatida menyuda qoladi)
    const hideSets = !!setsQ.data?.available
    return (menuQ.data?.categories || [])
      .map((c) => ({
        ...c,
        products: c.products
          .filter((p) => !(hideSets && p.kind === 'SET'))
          .map((p) =>
            p.promotion || !byProduct.has(p.uuid) ? p : { ...p, promotion: byProduct.get(p.uuid)! }
          ),
      }))
      .filter((c) => c.products.length > 0)
  }, [menuQ.data, promosQ.data, setsQ.data?.available])

  const allProducts = useMemo(() => categories.flatMap((c) => c.products), [categories])
  const deals = allProducts.filter((p) => p.promotion || p.discount > 0)
  const sets = setsQ.data?.data || []

  const tabs = useMemo(
    () => [
      ...(sets.length ? [{ id: 'sets', name: 'Setlar' }] : []),
      ...(deals.length ? [{ id: 'deals', name: 'Aksiyalar' }] : []),
      ...categories.map((c) => ({ id: c.uuid, name: c.name })),
    ],
    [sets.length, deals.length, categories]
  )
  const tabIds = useMemo(() => tabs.map((t) => t.id), [tabs])
  const active = useScrollSpy(tabIds)

  if (!id || partnerQ.isLoading || !hydrated) {
    return (
      <div>
        <div className="h-14" />
        <Page className="space-y-3">
          <Skeleton className="h-9 w-2/3" />
          <div className="flex gap-4">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-28" />
          </div>
          <Skeleton className="h-[72px] rounded-[20px]" />
          <Skeleton className="mt-4 h-7 w-44" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-[22px]" />
            ))}
          </div>
        </Page>
      </div>
    )
  }

  if (partnerQ.isError || !partner) {
    return (
      <EmptyState
        emoji="🍽"
        title="Restoran topilmadi"
        text="Havola eskirgan yoki restoran vaqtincha faol emas."
        action={<Button href="/restaurants/">Restoranlarga qaytish</Button>}
      />
    )
  }

  const open = isOpenNow(partner)
  const pickup = mode === 'PICKUP'
  const zone = zoneFor(partner, lat, lng)
  const out = !pickup && isOutOfZone(partner, lat, lng)
  const eta = etaRange(zone?.estimated_minutes)
  const fee = zone?.delivery_fee ?? partner.delivery_fee ?? 0
  const hours = workingHoursLabel(partner)
  const subtotal = cartSubtotal(cart)
  const count = cartCount(cart)

  const share = async () => {
    setMenuOpen(false)
    const url = window.location.href
    try {
      if (navigator.share)
        await navigator.share({
          title: partner.name,
          text: `MilliyGo'da "${partner.name}" menyusini ko'ring`,
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

  const grid = 'grid grid-cols-2 gap-x-3 gap-y-[18px] sm:grid-cols-3 lg:grid-cols-4'
  const sectionTitle = 'm-0 mb-3 text-[1.625rem] font-[900] tracking-[-0.6px] text-[#111]'

  return (
    <div className="bg-white">
      <PartnerSeo partner={partner} />

      <TopBar
        title={partner.name}
        showTitle={showTitle}
        fav={fav}
        onFav={toggle}
        onSearch={() => setSearchOpen(true)}
      />

      {/* Sarlavha: nom, reyting · yetkazish · ⋮, yetkazish kartasi */}
      <Page className="pb-3 pt-1">
        <h1 className="m-0 text-[2rem] font-[900] leading-[1.1] tracking-[-1px] text-[#111]">
          {partner.name}
        </h1>

        <div className="relative mt-3.5 flex items-center">
          <InfoCell
            icon={<IconStar size={26} className="text-go-gold" />}
            value={partner.rating > 0 ? partner.rating.toFixed(1) : '—'}
            label="Reyting"
          />
          <span className="mx-3.5 h-[30px] w-px bg-[#E5E7EB]" />
          <InfoCell
            icon={<IconScooter size={26} className="text-go-green" />}
            value={pickup ? 'Bepul' : eta || '—'}
            label={pickup ? 'Olib ketish' : 'Yetkazish'}
          />
          <span className="mx-1.5 h-[30px] w-px bg-[#E5E7EB]" />
          <div className="relative">
            <button
              type="button"
              aria-label="Yana"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-[#111] hover:bg-go-chip"
            >
              <IconMore size={26} />
            </button>
            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Yopish"
                  onClick={() => setMenuOpen(false)}
                  className="fixed inset-0 z-[80] cursor-default border-0 bg-transparent"
                />
                <div className="absolute left-1/2 top-12 z-[81] w-[230px] -translate-x-1/2 overflow-hidden rounded-[18px] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.16)]">
                  <button
                    type="button"
                    onClick={share}
                    className="flex h-[52px] w-full cursor-pointer items-center gap-3.5 border-0 bg-transparent px-4 text-left text-[1rem] font-[500] text-[#111]"
                  >
                    <IconShare size={22} /> Ulashish
                  </button>
                  <div className="h-px bg-[#F0F1F3]" />
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      setInfo(true)
                    }}
                    className="flex h-[52px] w-full cursor-pointer items-center gap-3.5 border-0 bg-transparent px-4 text-left text-[1rem] font-[500] text-[#111]"
                  >
                    <IconInfo size={22} /> Restoran haqida
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-4">
          {open ? (
            !pickup && (
              <button
                type="button"
                onClick={() => setInfo(true)}
                className="flex w-full cursor-pointer items-center gap-3 rounded-[20px] border-0 bg-go-soft py-3.5 pl-4 pr-3 text-left"
              >
                <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-go-green text-white">
                  <IconScooter size={24} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[1.25rem] font-[900] tracking-[-0.4px] text-go-green">
                    {fee > 0 ? `Yetkazish: ${som(fee)}` : 'Yetkazish: bepul'}
                  </span>
                  {partner.min_order_amount > 0 && (
                    <span className="block text-[0.844rem] font-[600] text-go-bright">
                      kamida: {som(partner.min_order_amount)}
                    </span>
                  )}
                </span>
                <IconChevronRight size={26} className="text-go-green" />
              </button>
            )
          ) : (
            <div className="flex items-center gap-3 rounded-[20px] bg-[#FEF2F2] p-3.5">
              <IconLock size={22} className="shrink-0 text-[#DC2626]" />
              <span className="text-[0.875rem] font-[700] text-[#991B1B]">
                {partner.partner_type === 'SHOP' ? "Do'kon" : 'Muassasa'} hozir yopiq
                {hours ? ` · Ish vaqti: ${hours}` : ''}
              </span>
            </div>
          )}
          {open && out && (
            <Notice tone="warn" icon={<IconPin size={18} />} className="mt-3">
              Manzilingizga yetkazmaydi. Manzilni o&apos;zgartiring yoki «Olib ketishga»
              bo&apos;limidan foydalaning.
            </Notice>
          )}
        </div>
      </Page>

      <Tabs items={tabs} active={active} />

      <div className="pb-48 lg:pb-8">
        {menuQ.isLoading ? (
          <Page className="mt-5">
            <div className={grid}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="aspect-square rounded-[22px]" />
              ))}
            </div>
          </Page>
        ) : categories.length === 0 && sets.length === 0 ? (
          <EmptyState
            emoji="📋"
            title="Hozircha menyu mavjud emas"
            text="Restoran menyusi tez orada to'ldiriladi."
          />
        ) : (
          <>
            {sets.length > 0 && (
              <section id="cat-sets" className="pt-[22px]">
                <Page>
                  <h2 className={sectionTitle}>Setlar</h2>
                </Page>
                <div className="mx-auto w-full max-w-[720px] lg:max-w-[1180px] lg:px-6">
                  <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:px-0">
                    {sets.map((s) => (
                      <SetCard
                        key={s.uuid}
                        partner={partner}
                        set={s}
                        closed={!open}
                        onOpen={setSet}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {deals.length > 0 && (
              <section id="cat-deals" className="pt-[22px]">
                <Page>
                  <h2 className={sectionTitle}>Aksiyalar</h2>
                  <div className={grid}>
                    {deals.map((p) => (
                      <ProductCard
                        key={p.uuid}
                        partner={partner}
                        product={p}
                        closed={!open}
                        onOpen={setProduct}
                      />
                    ))}
                  </div>
                </Page>
              </section>
            )}

            {categories.map((c) => (
              <section key={c.uuid} id={`cat-${c.uuid}`} className="pt-[22px]">
                <Page>
                  <h2 className={sectionTitle}>{c.name}</h2>
                  <div className={grid}>
                    {c.products.map((p) => (
                      <ProductCard
                        key={p.uuid}
                        partner={partner}
                        product={p}
                        closed={!open}
                        onOpen={setProduct}
                      />
                    ))}
                  </div>
                </Page>
              </section>
            ))}
          </>
        )}
      </div>

      {open ? (
        <DeliveryProgressPanel
          total={subtotal}
          count={count}
          fee={fee}
          freeThreshold={partner.free_delivery_threshold}
          cartHref={`/cart/?partner=${partner.uuid}`}
          pickupAddress={pickup ? partner.address || partner.name : null}
        />
      ) : (
        <ClosedBar hours={hours} />
      )}

      <PartnerInfoSheet
        partner={partner}
        open={info}
        onClose={() => setInfo(false)}
        lat={lat}
        lng={lng}
      />
      <ProductSheet
        partner={partner}
        closed={!open}
        product={product}
        set={set}
        suggestions={allProducts}
        onClose={() => {
          setProduct(null)
          setSet(null)
        }}
        onOpenProduct={(p) => {
          setSet(null)
          setProduct(p)
        }}
      />
      <MenuSearchSheet
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        products={allProducts}
        onPick={setProduct}
      />
    </div>
  )
}
