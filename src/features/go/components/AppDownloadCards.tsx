import type { ReactNode } from 'react'
import { Page, SectionTitle } from '../ui/primitives'

export const PLAY_MARKET_URL = 'https://play.google.com/store/apps/details?id=uz.milliyapp.milliygo'
export const APP_STORE_URL = 'https://apps.apple.com/app/id6836199595'
/** iOS ilova App Store'da chiqqach `true` qiling (2026-11-21: sahifa hali 404 — tekshiruvda) */
const APP_STORE_LIVE = false

function GooglePlayLogo() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
      <path
        fill="#00D7FE"
        d="M3.6 1.8c-.3.3-.5.8-.5 1.4v17.6c0 .6.2 1.1.5 1.4l.1.1L13.5 12v-.2L3.7 1.7z"
      />
      <path
        fill="#FFCE00"
        d="M16.8 15.3 13.5 12v-.2l3.3-3.3.1.1 3.9 2.2c1.1.6 1.1 1.7 0 2.3l-3.9 2.2z"
      />
      <path fill="#FF3A44" d="M16.9 15.2 13.5 11.9 3.6 21.8c.4.4 1 .4 1.7.1l11.6-6.7" />
      <path fill="#00F076" d="M16.9 8.6 5.3 1.9c-.7-.4-1.3-.3-1.7.1l9.9 9.9z" />
    </svg>
  )
}

function AppleLogo() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" fill="currentColor">
      <path d="M16.37 12.6c-.02-2.33 1.9-3.45 1.99-3.5-1.08-1.59-2.77-1.8-3.37-1.83-1.43-.15-2.8.84-3.53.84-.73 0-1.85-.82-3.04-.8-1.56.02-3 .91-3.81 2.31-1.62 2.82-.41 7 1.17 9.29.77 1.12 1.69 2.38 2.9 2.33 1.16-.05 1.6-.75 3.01-.75 1.4 0 1.8.75 3.03.73 1.25-.02 2.04-1.14 2.81-2.26.88-1.3 1.25-2.55 1.27-2.62-.03-.01-2.43-.93-2.43-3.74zM14.06 5.75c.64-.78 1.08-1.86.96-2.94-.93.04-2.05.62-2.71 1.4-.6.69-1.12 1.79-.98 2.85 1.04.08 2.09-.53 2.73-1.31z" />
    </svg>
  )
}

function StoreCard({
  href,
  logo,
  caption,
  store,
}: {
  /** null — hali chiqmagan: «Tez kunda», bosilmaydi */
  href: string | null
  logo: ReactNode
  caption: string
  store: string
}) {
  if (href === null) {
    return (
      <div
        aria-disabled="true"
        className="flex h-[64px] items-center gap-3 rounded-[18px] bg-[#111]/55 px-4 text-white"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center">{logo}</span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-[0.688rem] font-[500] text-white/80">Tez kunda</span>
          <span className="block truncate text-[1.125rem] font-[800] tracking-[-0.2px]">
            {store}
          </span>
        </span>
      </div>
    )
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-[64px] items-center gap-3 rounded-[18px] bg-[#111] px-4 text-white no-underline transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center">{logo}</span>
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-[0.688rem] font-[500] text-white/75">{caption}</span>
        <span className="block truncate text-[1.125rem] font-[800] tracking-[-0.2px]">{store}</span>
      </span>
    </a>
  )
}

/** Bosh sahifa: MilliyGo ilovasini Play Market va App Store'dan yuklab olish */
export default function AppDownloadCards() {
  return (
    <section className="mt-6">
      <Page>
        <SectionTitle>Ilovani yuklab oling</SectionTitle>
        <div className="rounded-[22px] bg-go-soft p-3.5 lg:flex lg:items-center lg:gap-6 lg:p-5">
          <div className="mb-3 lg:mb-0 lg:flex-1">
            <div className="text-[0.969rem] font-[800] text-[#111]">MilliyGo — telefoningizda</div>
            <div className="mt-0.5 text-[0.781rem] leading-[1.35] text-[#4B5563]">
              Buyurtma holati haqida bildirishnoma va bir necha bosishda buyurtma
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5 lg:w-[440px] lg:gap-3">
            <StoreCard
              href={PLAY_MARKET_URL}
              logo={<GooglePlayLogo />}
              caption="Yuklab oling"
              store="Google Play"
            />
            <StoreCard
              href={APP_STORE_LIVE ? APP_STORE_URL : null}
              logo={<AppleLogo />}
              caption="Yuklab oling"
              store="App Store"
            />
          </div>
        </div>
      </Page>
    </section>
  )
}
