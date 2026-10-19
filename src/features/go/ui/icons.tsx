import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }

const base = ({ size = 20, ...rest }: P) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...rest,
})

export const IconPin = (p: P) => (
  <svg {...base(p)}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)
export const IconSearch = (p: P) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)
export const IconCart = (p: P) => (
  <svg {...base(p)}>
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="18" cy="20" r="1.4" />
    <path d="M2.5 3h2.6l2.4 11.4a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.5L21.5 8H6.1" />
  </svg>
)
export const IconBag = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 8h14l-1 12H6L5 8z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
)
export const IconWalk = (p: P) => (
  <svg {...base(p)}>
    <circle cx="13" cy="4" r="2" />
    <path d="m9 21 2.5-6.5L14 17v4M7 12l2-4 4 1 2.5 3.5H18M11.5 14.5 10 9" />
  </svg>
)
export const IconScooter = (p: P) => (
  <svg {...base(p)}>
    <circle cx="6" cy="17" r="2.5" />
    <circle cx="18" cy="17" r="2.5" />
    <path d="M8.5 17h7M15 6h2l2.5 8.5M15 6l-3 8H8.5L7 10H3" />
  </svg>
)
export const IconStar = ({ filled = true, ...p }: P & { filled?: boolean }) => (
  <svg {...base(p)} fill={filled ? 'currentColor' : 'none'} strokeWidth={filled ? 0 : 2}>
    <path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9L12 2.8z" />
  </svg>
)
export const IconClock = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
)
export const IconPlus = (p: P) => (
  <svg {...base(p)} strokeWidth={2.6}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)
export const IconMinus = (p: P) => (
  <svg {...base(p)} strokeWidth={2.6}>
    <path d="M5 12h14" />
  </svg>
)
export const IconChevronRight = (p: P) => (
  <svg {...base(p)}>
    <path d="m9 6 6 6-6 6" />
  </svg>
)
export const IconChevronDown = (p: P) => (
  <svg {...base(p)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
)
export const IconBack = (p: P) => (
  <svg {...base(p)}>
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </svg>
)
export const IconClose = (p: P) => (
  <svg {...base(p)}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)
export const IconHome = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9.5z" />
  </svg>
)
export const IconUser = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
)
export const IconReceipt = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2V3z" />
    <path d="M9 8h6M9 12h6" />
  </svg>
)
export const IconPhone = (p: P) => (
  <svg {...base(p)}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
  </svg>
)
export const IconNavigate = (p: P) => (
  <svg {...base(p)}>
    <path d="m3 11 19-9-9 19-2-8-8-2z" />
  </svg>
)
export const IconCopy = (p: P) => (
  <svg {...base(p)}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
  </svg>
)
export const IconTrash = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15" />
  </svg>
)
export const IconStore = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 9 4.5 4h15L21 9M3 9v11h18V9M3 9h18M9 20v-6h6v6" />
  </svg>
)
export const IconGift = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="8" width="18" height="5" rx="1" />
    <path d="M5 13v8h14v-8M12 8v13M12 8S10.5 3 8 4s0 4 4 4zm0 0s1.5-5 4-4 0 4-4 4z" />
  </svg>
)
export const IconInfo = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </svg>
)
export const IconLock = (p: P) => (
  <svg {...base(p)}>
    <rect x="4" y="10" width="16" height="11" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
)
export const IconChat = (p: P) => (
  <svg {...base(p)}>
    <path d="M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z" />
  </svg>
)
export const IconCash = (p: P) => (
  <svg {...base(p)}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="2.5" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
)
export const IconCheck = (p: P) => (
  <svg {...base(p)} strokeWidth={2.6}>
    <path d="m5 12 5 5L20 7" />
  </svg>
)
export const IconLogout = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
)
export const IconShare = (p: P) => (
  <svg {...base(p)}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
  </svg>
)
export const IconTelegram = (p: P) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M21.9 4.3 18.7 19.5c-.2 1-.9 1.3-1.7.8l-4.8-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2l-11 6.9-4.7-1.5c-1-.3-1-1 .2-1.5L20.6 3c.9-.3 1.6.2 1.3 1.3z" />
  </svg>
)

export const IconBolt = (p: P) => (
  <svg {...base(p)} fill="currentColor" strokeWidth={0}>
    <path d="M13.5 2 5 13.5h5.5L9.5 22 19 9.8h-5.7L13.5 2z" />
  </svg>
)
export const IconGrid = (p: P) => (
  <svg {...base(p)} fill="currentColor" strokeWidth={0}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
  </svg>
)
export const IconBell = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </svg>
)
export const IconBellRing = (p: P) => (
  <svg {...base(p)} fill="currentColor" strokeWidth={0}>
    <path d="M12 2.5a1.5 1.5 0 0 1 1.5 1.5v.6A6 6 0 0 1 18 10.5c0 4.5 2 6 2 6H4s2-1.5 2-6a6 6 0 0 1 4.5-5.9V4A1.5 1.5 0 0 1 12 2.5zM10 19h4a2 2 0 0 1-4 0z" />
  </svg>
)
export const IconSliders = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2" />
    <circle cx="9" cy="17" r="2" />
  </svg>
)
export const IconArrowRight = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)
export const IconHeart = ({ filled, ...p }: P & { filled?: boolean }) => (
  <svg {...base(p)} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20.5s-8-4.8-8-10.6A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 2.9c0 5.8-8 10.6-8 10.6z" />
  </svg>
)
export const IconTaxi = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 16V11l1.7-4.2A2 2 0 0 1 8.6 5.5h6.8a2 2 0 0 1 1.9 1.3L19 11v5H5zM5 11h14" />
    <circle cx="8" cy="16.5" r="1.3" />
    <circle cx="16" cy="16.5" r="1.3" />
    <path d="M10 3.5h4" />
  </svg>
)
export const IconBasket = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 10h18l-1.7 9a2 2 0 0 1-2 1.6H6.7a2 2 0 0 1-2-1.6L3 10zM8 10l3-6M16 10l-3-6" />
  </svg>
)
export const IconPill = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-45 12 12)" />
    <path d="m9 9 6 6" />
  </svg>
)
export const IconTruck = (p: P) => (
  <svg {...base(p)}>
    <path d="M2.5 6.5h11v10h-11zM13.5 10h4l3 3v3.5h-7" />
    <circle cx="7" cy="17.5" r="1.7" />
    <circle cx="17" cy="17.5" r="1.7" />
  </svg>
)

export const IconMore = (p: P) => (
  <svg {...base(p)} fill="currentColor" strokeWidth={0}>
    <circle cx="12" cy="5" r="1.9" />
    <circle cx="12" cy="12" r="1.9" />
    <circle cx="12" cy="19" r="1.9" />
  </svg>
)
export const IconCelebrate = (p: P) => (
  <svg {...base(p)}>
    <path d="m4 20 4.5-12 7.5 7.5L4 20z" />
    <path d="M14 4v2M19 9h2M17 3l-1 1.5M20.5 13l-1.5-.5" />
  </svg>
)

export const IconMoon = (p: P) => (
  <svg {...base(p)} fill="currentColor" strokeWidth={0}>
    <path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1z" />
  </svg>
)
export const IconTag = (p: P) => (
  <svg {...base(p)} fill="currentColor" strokeWidth={0}>
    <path d="M21.4 11.6 12.4 2.6A2 2 0 0 0 11 2H4a2 2 0 0 0-2 2v7c0 .5.2 1 .6 1.4l9 9a2 2 0 0 0 2.8 0l7-7a2 2 0 0 0 0-2.8zM6.5 8A1.5 1.5 0 1 1 6.5 5a1.5 1.5 0 0 1 0 3z" />
  </svg>
)
