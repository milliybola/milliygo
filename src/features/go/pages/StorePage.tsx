import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import {
  StoreBottomBar,
  StoreCategoryGrid,
  StoreNoteCard,
  StoreProductGrid,
  StoreProductRow,
  StoreProductSheet,
  StoreSearchSheet,
  StoreSimpleBar,
  StoreTopBar,
  S,
} from '../components/store/StoreKit'
import { useCart } from '../lib/cart'
import { useMenu, usePartner, usePromotions } from '../lib/queries'
import { useRouteId } from '../lib/route'
import { useHydrated, useUserLocation } from '../lib/session'
import type { Product } from '../lib/types'
import { cx, formatSum } from '../lib/utils'
import { IconArrowRight, IconBasket } from '../ui/icons'
import { Button, Skeleton } from '../ui/primitives'

type View = { kind: 'home' } | { kind: 'all' } | { kind: 'category'; index: number }

/** Superapp `_EmptyState` */
function StoreEmpty({
  title,
  subtitle,
  action,
  onAction,
}: {
  title: string
  subtitle: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div className="flex flex-col items-center px-8 py-12 text-center">
      <span
        className="flex h-[72px] w-[72px] items-center justify-center rounded-full"
        style={{ background: S.tile, color: S.muted }}
      >
        <IconBasket size={34} />
      </span>
      <h3 className="m-0 mt-3.5 text-[1.0625rem] font-[800] text-[#111]">{title}</h3>
      <p className="m-0 mt-1.5 text-[0.844rem] leading-[1.4]" style={{ color: S.muted }}>
        {subtitle}
      </p>
      {action && (
        <Button className="mt-4" onClick={onAction}>
          {action}
        </Button>
      )}
    </div>
  )
}

function CatalogSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[720px] px-4 pt-3.5 lg:max-w-[1180px] lg:px-6">
      {[0, 1].map((r) => (
        <div key={r} className="mb-2.5 grid grid-cols-3 gap-2.5">
          {[0, 1, 2].map((c) => (
            <Skeleton key={c} className="h-[118px] rounded-[20px]" />
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * Supermarket sahifasi — superapp `StoreDetailPage` bilan 1:1:
 * sarlavha · qidiruv (tepada qotadi) · bepul yetkazish eslatmasi · toifalar to'ri (7 + "Barcha toifalar") ·
 * "Chegirmalar va aksiyalar" va har toifa bo'yicha mahsulot qatorlari · oltin savat tugmasi va bepul yetkazish paneli.
 */
export default function StorePage() {
  const id = useRouteId('store')
  const router = useRouter()
  const hydrated = useHydrated()
  const { lat, lng } = useUserLocation()
  const partnerQ = usePartner(id)
  const menuQ = useMenu(id)
  const promosQ = usePromotions(id)
  const refreshPartner = useCart((s) => s.refreshPartner)
  const [product, setProduct] = useState<Product | null>(null)
  const [view, setView] = useState<View>({ kind: 'home' })
  const [searchOpen, setSearchOpen] = useState(false)
  const [showTop, setShowTop] = useState(false)

  const partner = partnerQ.data
  useEffect(() => {
    if (partner) refreshPartner(partner)
  }, [partner, refreshPartner])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [view])

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 900)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const categories = useMemo(() => {
    const promos = promosQ.data?.data || []
    const byProduct = new Map<string, (typeof promos)[number]>()
    promos.forEach((pr) => pr.products.forEach((pid) => byProduct.set(pid, pr)))
    return (menuQ.data?.categories || [])
      .map((c) => ({
        ...c,
        products: c.products.map((p) =>
          p.promotion || !byProduct.has(p.uuid) ? p : { ...p, promotion: byProduct.get(p.uuid)! }
        ),
      }))
      .filter((c) => c.products.length > 0)
  }, [menuQ.data, promosQ.data])
  const allProducts = useMemo(() => categories.flatMap((c) => c.products), [categories])
  const discounted = useMemo(
    () => allProducts.filter((p) => p.final_price < p.price),
    [allProducts]
  )

  const back = () => {
    if (view.kind !== 'home') setView({ kind: 'home' })
    else if (window.history.length > 1) router.back()
    else router.push('/store/')
  }

  if (!id || partnerQ.isLoading || !hydrated) {
    return (
      <div>
        <div className="h-[124px]" />
        <CatalogSkeleton />
      </div>
    )
  }
  if (partnerQ.isError || !partner) {
    return (
      <StoreEmpty
        title="Do'kon topilmadi"
        subtitle="Havola eskirgan yoki do'kon vaqtincha faol emas."
        action="Do'konlarga qaytish"
        onAction={() => router.push('/store/')}
      />
    )
  }

  const sheets = (
    <>
      <StoreProductSheet
        partner={partner}
        product={product}
        suggestions={allProducts}
        onClose={() => setProduct(null)}
        onOpenProduct={setProduct}
      />
      <StoreSearchSheet
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        partner={partner}
        items={allProducts}
        onPick={(p) => {
          setSearchOpen(false)
          setProduct(p)
        }}
      />
    </>
  )

  // ── Toifa ichi: tepada chiplar, ostida 3 ustunli to'r ──
  if (view.kind === 'category' && categories[view.index]) {
    const cat = categories[view.index]
    return (
      <div className="pb-40">
        <Head>
          <title>{`${cat.name} — ${partner.name}`}</title>
        </Head>
        <StoreSimpleBar title={cat.name} onBack={back}>
          <div className="no-scrollbar flex h-[50px] gap-2 overflow-x-auto px-4 pb-2.5 pt-1">
            {categories.map((c, i) => {
              const on = i === view.index
              return (
                <button
                  key={c.uuid}
                  type="button"
                  onClick={() => setView({ kind: 'category', index: i })}
                  className={cx(
                    'shrink-0 cursor-pointer whitespace-nowrap rounded-[18px] border-0 px-3.5 text-[0.844rem] font-[600]',
                    on ? 'text-white' : 'text-[#111]'
                  )}
                  style={{ background: on ? S.ink : S.tile }}
                >
                  {c.name}
                </button>
              )
            })}
          </div>
        </StoreSimpleBar>
        <div className="mx-auto w-full max-w-[720px] px-4 pt-1.5 lg:max-w-[1180px] lg:px-6">
          <StoreProductGrid partner={partner} items={cat.products} onOpen={setProduct} />
        </div>
        <StoreBottomBar partner={partner} lat={lat} lng={lng} />
        {sheets}
      </div>
    )
  }

  // ── Barcha toifalar ──
  if (view.kind === 'all') {
    return (
      <div className="pb-40">
        <Head>
          <title>{`Barcha toifalar — ${partner.name}`}</title>
        </Head>
        <StoreSimpleBar
          title="Barcha toifalar"
          onBack={back}
          onSearch={() => setSearchOpen(true)}
        />
        <div className="mx-auto w-full max-w-[720px] px-4 pt-2 lg:max-w-[1180px] lg:px-6">
          <StoreCategoryGrid
            categories={categories}
            onOpen={(i) => setView({ kind: 'category', index: i })}
          />
        </div>
        <StoreBottomBar partner={partner} lat={lat} lng={lng} />
        {sheets}
      </div>
    )
  }

  // ── Do'kon sahifasi ──
  const threshold = partner.free_delivery_threshold
  return (
    <div className="pb-[170px]">
      <Head>
        <title>{`${partner.name} — MilliyGo`}</title>
      </Head>
      <StoreTopBar
        partner={partner}
        lat={lat}
        lng={lng}
        onBack={back}
        onSearch={() => setSearchOpen(true)}
      />
      {threshold > 0 && (
        <div className="mx-auto w-full max-w-[720px] px-4 pt-1 lg:max-w-[1180px] lg:px-6">
          <StoreNoteCard text={`${formatSum(threshold)} so'mdan buyurtmada yetkazish bepul`} />
        </div>
      )}

      {menuQ.isLoading ? (
        <CatalogSkeleton />
      ) : menuQ.isError ? (
        <StoreEmpty
          title="Katalogni yuklab bo'lmadi"
          subtitle="Internetni tekshirib, qaytadan urinib ko'ring"
          action="Qayta urinish"
          onAction={() => menuQ.refetch()}
        />
      ) : categories.length === 0 ? (
        <StoreEmpty
          title="Mahsulotlar hali qo'shilmagan"
          subtitle="Do'kon katalogi tez orada to'ldiriladi"
        />
      ) : (
        <>
          <div className="mx-auto w-full max-w-[720px] px-4 pt-3.5 lg:max-w-[1180px] lg:px-6">
            <StoreCategoryGrid
              categories={categories}
              limit={7}
              onOpen={(i) => setView({ kind: 'category', index: i })}
              onAll={() => setView({ kind: 'all' })}
            />
          </div>
          <StoreProductRow
            title="Chegirmalar va aksiyalar"
            partner={partner}
            items={discounted}
            onOpen={setProduct}
          />
          {categories.map((c, i) => (
            <StoreProductRow
              key={c.uuid}
              title={c.name}
              partner={partner}
              items={c.products}
              onOpen={setProduct}
              onSeeAll={() => setView({ kind: 'category', index: i })}
            />
          ))}
        </>
      )}

      {/* ↑ Tepaga */}
      <button
        type="button"
        aria-label="Tepaga"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={cx(
          'fixed bottom-[110px] left-4 z-[61] flex h-[52px] w-[52px] cursor-pointer items-center justify-center rounded-full border-0 bg-white text-[#111] shadow-[0_4px_12px_rgba(0,0,0,0.18)] transition-transform duration-200',
          showTop ? 'scale-100' : 'scale-0'
        )}
      >
        <IconArrowRight size={24} className="-rotate-90" />
      </button>

      <StoreBottomBar partner={partner} lat={lat} lng={lng} />
      {sheets}
    </div>
  )
}
