import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCart } from '../lib/cart'
import { useHydrated } from '../lib/session'
import { cx } from '../lib/utils'

type NavIconName = 'home' | 'pickup' | 'basket' | 'profile'

const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

/**
 * Superapp'dagi MilliyGo belgilari (FoodNavIcon): klosh, soyabonli choyxona, savat, do'ppili odam.
 * Har birining ikki holati: kontur (tanlanmagan) va to'ldirilgan (tanlangan).
 */
function NavIcon({
  name,
  filled,
  size = 28,
}: {
  name: NavIconName
  filled: boolean
  size?: number
}) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', 'aria-hidden': true } as const
  if (!filled) {
    switch (name) {
      case 'home':
        return (
          <svg {...common}>
            <path {...S} d="M2.8 18.4h18.4" />
            <path {...S} d="M4.6 18.4a7.4 7.4 0 0 1 14.8 0" />
            <path {...S} d="M12 11V9.2" />
            <circle {...S} cx="12" cy="7.6" r="1.4" />
            <path {...S} d="M8.2 15.4a4.4 4.4 0 0 1 2.4-2.6" />
          </svg>
        )
      case 'pickup':
        return (
          <svg {...common}>
            <path {...S} d="M3.4 9.4 5 4.6h14l1.6 4.8" />
            <path
              {...S}
              d="M3.4 9.4a2.15 2.15 0 0 0 4.3 0a2.15 2.15 0 0 0 4.3 0a2.15 2.15 0 0 0 4.3 0a2.15 2.15 0 0 0 4.3 0"
            />
            <path {...S} d="M5 12v7.2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V12" />
            <path {...S} d="M9.8 20.2v-3.4a2.2 2.2 0 0 1 4.4 0v3.4" />
          </svg>
        )
      case 'basket':
        return (
          <svg {...common}>
            <path {...S} d="M3.2 9.6h17.6l-1.7 9.2a2 2 0 0 1-2 1.6H6.9a2 2 0 0 1-2-1.6z" />
            <path {...S} d="M7.6 9.6 10.6 4M16.4 9.6 13.4 4" />
            <path {...S} d="M9.4 13.2v3.6M12 13.2v3.6M14.6 13.2v3.6" />
          </svg>
        )
      default:
        return (
          <svg {...common}>
            <path {...S} d="M8.3 6.4 9 3.6h6l.7 2.8z" />
            <path {...S} d="M8.6 7.6a3.5 3.5 0 1 0 6.8 0" />
            <path {...S} d="M4.8 20.4c.8-3.7 3.6-5.8 7.2-5.8s6.4 2.1 7.2 5.8" />
          </svg>
        )
    }
  }
  switch (name) {
    case 'home':
      return (
        <svg {...common} fill="currentColor">
          <path
            fillRule="evenodd"
            d="M12 9.6a8 8 0 0 1 8 7.6H4a8 8 0 0 1 8-7.6zM8.6 15.2a.8.8 0 0 0 1.5.5a3.6 3.6 0 0 1 1.9-2a.8.8 0 1 0-.6-1.5a5.2 5.2 0 0 0-2.8 3z"
          />
          <path d="M2.6 17.8h18.8a1 1 0 0 1 0 2H2.6a1 1 0 0 1 0-2z" />
          <path d="M11.2 8.4h1.6v1.6h-1.6z" />
          <circle cx="12" cy="7" r="1.9" />
        </svg>
      )
    case 'pickup':
      return (
        <svg {...common} fill="currentColor">
          <path d="M4.3 4.2a1 1 0 0 1 .9-.6h13.6a1 1 0 0 1 .9.6l1.8 5a3.1 3.1 0 0 1-5.6 1.9a3.1 3.1 0 0 1-3.9 1a3.1 3.1 0 0 1-1-.9a3.1 3.1 0 0 1-5.6-.1a3.1 3.1 0 0 1-2.9-1.9z" />
          <path
            fillRule="evenodd"
            d="M4.9 12.7a4 4 0 0 0 3-.3a4 4 0 0 0 4.1.6a4 4 0 0 0 4.1-.6a4 4 0 0 0 3 .3v6.6a1.9 1.9 0 0 1-1.9 1.9H6.8a1.9 1.9 0 0 1-1.9-1.9zM12 15.2a2.2 2.2 0 0 0-2.2 2.2v3.8h4.4v-3.8a2.2 2.2 0 0 0-2.2-2.2z"
          />
        </svg>
      )
    case 'basket':
      return (
        <svg {...common} fill="currentColor">
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth={1.9}
            strokeLinecap="round"
            d="M7.6 9.2 10.6 3.8M16.4 9.2 13.4 3.8"
          />
          <path
            fillRule="evenodd"
            d="M3.4 8.6h17.2a1 1 0 0 1 1 1.2l-1.8 9.3a2.6 2.6 0 0 1-2.6 2.1H7a2.6 2.6 0 0 1-2.6-2.1L2.5 9.8a1 1 0 0 1 .9-1.2zM8.6 12.6h1.6v4.8H8.6zM11.2 12.6h1.6v4.8h-1.6zM13.8 12.6h1.6v4.8h-1.6z"
          />
        </svg>
      )
    default:
      return (
        <svg {...common} fill="currentColor">
          <path d="M8.7 2.9h6.6a.8.8 0 0 1 .8.6l.7 2.8a.6.6 0 0 1-.6.7H7.8a.6.6 0 0 1-.6-.7l.7-2.8a.8.8 0 0 1 .8-.6z" />
          <path d="M8.1 8h7.8a3.9 3.9 0 1 1-7.8 0z" />
          <path d="M4.3 20.3C5 16.2 8.1 13.9 12 13.9s7 2.3 7.7 6.4a1.1 1.1 0 0 1-1.1 1.3H5.4a1.1 1.1 0 0 1-1.1-1.3z" />
        </svg>
      )
  }
}

/** Telefon uchun pastki menyu — superapp'dagi `_FoodBottomNav` bilan bir xil (Taomlar bo'limi) */
export default function BottomNav() {
  const { pathname, asPath } = useRouter()
  const hydrated = useHydrated()
  const isStore = pathname.startsWith('/store')
  // Savatlari bor maskanlar soni (mahsulotlar emas); do'kon va taom savatlari aralashmaydi
  const badge = useCart((s) =>
    hydrated
      ? Object.values(s.carts).filter(
          (c) => c.lines.length > 0 && (c.partner.partner_type === 'SHOP') === isStore
        ).length
      : 0
  )
  // Statik eksportda server asPath'da ?mode= yo'q — gidratatsiya mos tushishi uchun faqat mijozda hisoblaymiz
  const pickup = hydrated && asPath.includes('mode=pickup')

  const items: {
    href: string
    label: string
    icon: NavIconName
    active: boolean
    badge?: number
  }[] = [
    {
      href: '/',
      label: 'Bosh sahifa',
      icon: 'home',
      active: pathname === '/' || ((pathname.startsWith('/restaurant') || isStore) && !pickup),
    },
    // Do'konlarda olib ketish yo'q
    ...(isStore
      ? []
      : [
          {
            href: '/restaurants/?mode=pickup',
            label: 'Olib ketishga',
            icon: 'pickup' as const,
            active: pathname.startsWith('/restaurant') && pickup,
          },
        ]),
    { href: '/cart/', label: 'Savat', icon: 'basket', active: pathname.startsWith('/cart'), badge },
    {
      href: '/profile/',
      label: 'Profil',
      icon: 'profile',
      active: pathname.startsWith('/profile') || pathname.startsWith('/orders'),
    },
  ]

  return (
    <nav
      aria-label="Pastki menyu"
      className="fixed inset-x-0 bottom-0 z-[65] border-0 border-t border-solid border-[#F0F1F3] bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_12px_rgba(0,0,0,0.04)] lg:hidden"
    >
      <div className="flex h-[66px]">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            aria-current={it.active ? 'page' : undefined}
            className={cx(
              'flex flex-1 flex-col items-center justify-center no-underline',
              it.active ? 'text-go-green' : 'text-[#8A94A3]'
            )}
          >
            <span className="relative flex h-8 w-11 items-center justify-center">
              <NavIcon name={it.icon} filled={it.active} />
              {!!it.badge && (
                <span className="absolute -right-0.5 -top-[5px] flex h-[18px] min-w-[18px] items-center justify-center rounded-[9px] border-[1.5px] border-solid border-white bg-go-red px-1 text-[0.625rem] font-[800] leading-none text-white">
                  {it.badge > 99 ? '99+' : it.badge}
                </span>
              )}
            </span>
            <span className={cx('mt-1 text-[0.75rem]', it.active ? 'font-[800]' : 'font-[500]')}>
              {it.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
