import { useYMaps } from '@pbe/react-yandex-maps'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import LocationPicker from '../components/LocationPicker'
import NotificationBell from '../components/NotificationBell'
import { checkServiceArea } from '@/helpers/location-helper'
import { useNeighborhoods } from '@/hooks/useNeighborhoods'
import { useLocationStore } from '@/store/useLocationStore'
import { cartCount, cartsOfType, useCart } from '../lib/cart'
import { useHydrated, useSession, useUi, useUserLocation } from '../lib/session'
import { cx } from '../lib/utils'
import { SUPPORT_PHONE, SUPPORT_PHONE_DISPLAY } from './GoFooter'
import {
  IconCart,
  IconChevronDown,
  IconChevronRight,
  IconPin,
  IconSearch,
  IconUser,
} from '../ui/icons'

export function Logo({ className, tagline = true }: { className?: string; tagline?: boolean }) {
  return (
    <Link
      href="/"
      className={cx('flex shrink-0 items-center gap-2.5 no-underline', className)}
      aria-label="MilliyGo — bosh sahifa"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/go/logo.png" alt="" className="h-10 w-10 rounded-full object-cover" />
      <span className="flex flex-col">
        <span className="text-[1.25rem] font-[900] leading-[1.1] tracking-[-0.6px] text-[#1B1F2E]">
          MilliyGo
        </span>
        {tagline && (
          <span className="mt-px block text-[0.594rem] font-[500] uppercase leading-[1.1] tracking-[1.6px] text-[#5B7896] lg:hidden xl:block">
            Tez yetkazish
          </span>
        )}
      </span>
    </Link>
  )
}

/** Ilovadagi manzil kartasi: yashil pin, "Yetkazish manzili", manzil va (ma'lum bo'lsa) yetkazish vaqti */
export function LocationCard({ eta, className }: { eta?: string | null; className?: string }) {
  const { address, hasLocation, inServiceArea } = useUserLocation()
  const setOpen = useUi((s) => s.setLocationOpen)
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cx(
        'flex w-full cursor-pointer items-center gap-2 rounded-[16px] border border-solid border-go-line bg-[#F8F9FB] py-[5px] pl-2 pr-1.5 text-left',
        className
      )}
    >
      <span
        className={cx(
          'flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full',
          hasLocation && !inServiceArea ? 'bg-[#FEF2F2] text-go-red' : 'bg-[#E7F6EC] text-go-bright'
        )}
      >
        <IconPin size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[0.625rem] font-[500] leading-[1.1] text-[#8A94A6]">
          Yetkazish manzili
        </span>
        <span
          className={cx(
            'flex items-center gap-0.5 text-[0.844rem] font-[800] leading-[1.2] tracking-[-0.1px]',
            hasLocation ? 'text-[#111827]' : 'text-go-bright'
          )}
        >
          <span className="truncate">
            {hasLocation ? address || 'Tanlangan manzil' : 'Manzilni tanlang'}
          </span>
          <IconChevronDown size={16} className="shrink-0 text-go-muted" />
        </span>
      </span>
      {eta && (
        <span className="flex shrink-0 items-center gap-0.5 rounded-[14px] bg-[#E7F6EC] py-1 pl-[9px] pr-[3px] text-[0.75rem] font-[800] text-go-green">
          {eta}
          <IconChevronRight size={15} />
        </span>
      )}
    </button>
  )
}
export function LocationPill({ compact, boxed }: { compact?: boolean; boxed?: boolean }) {
  const { address, hasLocation, inServiceArea } = useUserLocation()
  const setOpen = useUi((s) => s.setLocationOpen)
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cx(
        'flex min-h-[44px] min-w-0 max-w-full cursor-pointer items-center gap-2 text-left',
        boxed
          ? 'h-[52px] w-full rounded-full border border-solid border-go-line bg-white py-1 pl-1 pr-3.5 hover:border-go-green'
          : 'rounded-full border-0 bg-transparent p-0'
      )}
    >
      <span
        className={cx(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          hasLocation && !inServiceArea ? 'bg-[#FEF2F2] text-go-red' : 'bg-go-soft text-go-green'
        )}
      >
        <IconPin size={20} />
      </span>
      <span className="min-w-0">
        {!compact && (
          <span className="block whitespace-nowrap text-[0.75rem] leading-tight text-go-muted">
            Yetkazish manzili
          </span>
        )}
        <span className="flex items-center gap-1 text-[0.9375rem] font-[800] leading-tight text-go-ink">
          <span className="truncate">
            {hasLocation ? address || 'Tanlangan manzil' : 'Manzilni tanlang'}
          </span>
          <IconChevronDown size={16} className="shrink-0" />
        </span>
      </span>
    </button>
  )
}

export function SearchPill({
  className,
  placeholder,
}: {
  className?: string
  placeholder?: string
}) {
  return (
    <Link
      href="/search/"
      className={cx(
        'flex min-h-[48px] items-center gap-2.5 rounded-full bg-go-chip px-5 text-[0.9375rem] text-go-hint no-underline hover:bg-[#ECEDF0] lg:h-[52px]',
        className
      )}
    >
      <IconSearch size={20} className="shrink-0 text-go-ink" />
      <span className="truncate">{placeholder || 'Taom, restoran yoki mahsulot qidirish...'}</span>
    </Link>
  )
}

function useTotalCartCount() {
  const carts = useCart((s) => s.carts)
  const hydrated = useHydrated()
  if (!hydrated) return 0
  // Har bir maskan (savat) 1 ta: nechta maskandan buyurtma yig'ilgan
  return [...cartsOfType(carts, 'RESTAURANT'), ...cartsOfType(carts, 'SHOP')].filter(
    (c) => cartCount(c) > 0
  ).length
}

/** Birinchi kirishda: brauzer joylashuvi xizmat hududida bo'lsa — avtomatik manzil */
function useAutoLocate() {
  const { location, setLocation, setIsInServiceArea } = useLocationStore()
  const ymaps = useYMaps(['geocode'])
  const { neighborhoods, isLoading } = useNeighborhoods()
  const tried = useRef(false)
  useEffect(() => {
    if (
      tried.current ||
      location ||
      !ymaps ||
      isLoading ||
      typeof navigator === 'undefined' ||
      !navigator.geolocation
    )
      return
    tried.current = true
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        if (!checkServiceArea(latitude, longitude, neighborhoods)) return
        let address = 'Mening joylashuvim'
        try {
          const res: any = await ymaps.geocode([latitude, longitude], { results: 1 })
          address = res.geoObjects.get(0)?.getAddressLine?.() || address
        } catch {
          /* manzil nomisiz qoladi */
        }
        setLocation({ lat: latitude, lng: longitude, address })
        setIsInServiceArea(true)
      },
      () => undefined,
      { timeout: 8000 }
    )
  }, [location, ymaps, isLoading, neighborhoods, setLocation, setIsInServiceArea])
}

const NAV = [
  { href: '/restaurants/', label: 'Taomlar', match: ['/restaurants', '/restaurant'] },
  { href: '/store/', label: "Do'konlar", match: ['/store'] },
  { href: '/restaurants/?mode=pickup', label: 'Olib ketish', match: [] as string[] },
  { href: '/orders/', label: 'Buyurtmalar', match: ['/orders'] },
]

export default function GoHeader({ hideOnMobile }: { hideOnMobile?: boolean } = {}) {
  const { pathname, asPath } = useRouter()
  const { isAuthenticated, profile, openLogin } = useSession()
  const { locationOpen, setLocationOpen } = useUi()
  const count = useTotalCartCount()
  useAutoLocate()

  const hydrated = useHydrated()
  const path = hydrated ? asPath : pathname
  const isActive = (n: (typeof NAV)[number]) =>
    n.href.includes('mode=pickup')
      ? path.includes('mode=pickup')
      : !path.includes('mode=pickup') &&
        n.match.some((m) => pathname === m || pathname.startsWith(m + '/'))

  return (
    <>
      <header
        className={cx(
          'sticky top-0 z-[70] border-0 border-b border-solid border-go-line bg-white/95 backdrop-blur lg:border-0',
          hideOnMobile && 'hidden lg:block'
        )}
      >
        <div className="mx-auto flex h-[60px] w-full max-w-[720px] items-center gap-2 px-4 lg:h-[76px] lg:max-w-[1180px] lg:gap-4 lg:px-6">
          <Logo />
          <div className="hidden min-w-0 lg:block lg:w-[250px] lg:shrink-0 xl:w-[280px]">
            <LocationPill boxed />
          </div>
          <SearchPill className="hidden min-w-0 flex-1 lg:flex" />{' '}
          <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0 lg:gap-3">
            <Link
              href="/cart/"
              aria-label={`Savat${count ? `, ${count} ta savat` : ''}`}
              className={cx(
                'relative hidden h-11 items-center gap-2 rounded-full px-5 text-[0.938rem] font-[800] no-underline lg:flex',
                count ? 'bg-go-gold text-go-ink' : 'bg-go-chip text-go-ink'
              )}
            >
              <IconCart size={20} />
              <span className="hidden lg:inline">Savat</span>
              {count > 0 && (
                <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-go-ink px-1.5 text-[0.75rem] text-white">
                  {count}
                </span>
              )}
            </Link>
            <NotificationBell />
            {isAuthenticated ? (
              <Link
                href="/profile/"
                aria-label="Profil"
                className="flex h-[38px] w-[38px] items-center justify-center overflow-hidden rounded-full bg-[#1F2937] text-[1rem] font-[900] text-white no-underline lg:h-11 lg:w-11"
              >
                {profile?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar} alt="" className="h-full w-full object-cover" />
                ) : profile?.full_name ? (
                  profile.full_name.trim()[0]?.toUpperCase()
                ) : (
                  <IconUser size={19} />
                )}
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  aria-label="Kirish"
                  onClick={openLogin}
                  className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full border-0 bg-[#1F2937] text-white lg:hidden"
                >
                  <IconUser size={19} />
                </button>
                <button
                  type="button"
                  onClick={openLogin}
                  className="hidden h-11 cursor-pointer items-center rounded-full border-0 bg-go-green px-4 text-[0.938rem] font-[800] text-white lg:flex"
                >
                  Kirish
                </button>
              </>
            )}
          </div>
        </div>
        {pathname !== '/' && (
          <div className="mx-auto w-full max-w-[720px] px-4 pb-1.5 lg:hidden lg:max-w-[1180px]">
            <LocationPill />
          </div>
        )}
      </header>
      <div
        className={cx(
          'border-0 border-b border-solid border-go-line bg-white',
          hideOnMobile ? 'hidden lg:block' : 'hidden lg:block'
        )}
      >
        <nav
          className="mx-auto flex h-12 w-full max-w-[1180px] items-stretch gap-1 px-6"
          aria-label="Asosiy bo'limlar"
        >
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cx(
                'relative flex items-center whitespace-nowrap px-4 text-[0.938rem] font-[700] no-underline transition-colors',
                isActive(n) ? 'text-go-green' : 'text-[#374151] hover:text-go-green'
              )}
            >
              {n.label}
              {isActive(n) && (
                <span className="absolute inset-x-4 bottom-0 h-[3px] rounded-t-[3px] bg-go-green" />
              )}
            </Link>
          ))}
          <span className="ml-auto flex items-center gap-2 text-[0.844rem] text-go-muted">
            Yordam:
            <a
              href={`tel:${SUPPORT_PHONE}`}
              className="font-[800] text-go-ink no-underline hover:text-go-green"
            >
              {SUPPORT_PHONE_DISPLAY}
            </a>
          </span>
        </nav>
      </div>{' '}
      <LocationPicker open={locationOpen} onClose={() => setLocationOpen(false)} />
    </>
  )
}

export { useTotalCartCount }
