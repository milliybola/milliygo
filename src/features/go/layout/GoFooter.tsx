import Link from 'next/link'
import { Logo } from './GoHeader'

export const SUPPORT_PHONE = '+998904969007'
export const SUPPORT_PHONE_DISPLAY = '+998 90 496 90 07'
export const SUPPORT_TELEGRAM = 'https://t.me/MilliyAppAdmin'

export default function GoFooter() {
  return (
    <footer className="mt-10 hidden border-0 border-t border-solid border-go-line bg-white lg:block">
      <div className="mx-auto grid w-full max-w-[720px] grid-cols-4 gap-8 px-6 py-10 text-[0.875rem] lg:max-w-[1180px]">
        <div className="col-span-2">
          <Logo />
          <p className="mb-0 mt-3 max-w-[360px] leading-relaxed text-go-muted">
            Restoranlardan taomlar va do&apos;konlardan mahsulotlarni tez yetkazib beramiz yoki
            o&apos;zingiz olib ketasiz.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-[800] text-go-ink">Xizmatlar</span>
          <Link href="/restaurants/" className="text-go-muted no-underline hover:text-go-green">
            Taomlar
          </Link>
          <Link href="/store/" className="text-go-muted no-underline hover:text-go-green">
            Do&apos;konlar
          </Link>
          <Link
            href="/restaurants/?mode=pickup"
            className="text-go-muted no-underline hover:text-go-green"
          >
            Olib ketish
          </Link>
          <Link href="/orders/" className="text-go-muted no-underline hover:text-go-green">
            Buyurtmalarim
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-[800] text-go-ink">Yordam</span>
          <a
            href={`tel:${SUPPORT_PHONE}`}
            className="text-go-muted no-underline hover:text-go-green"
          >
            {SUPPORT_PHONE_DISPLAY}
          </a>
          <a
            href={SUPPORT_TELEGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="text-go-muted no-underline hover:text-go-green"
          >
            Telegram orqali yozish
          </a>
          <Link href="/faq/" className="text-go-muted no-underline hover:text-go-green">
            Savol-javoblar
          </Link>
          <Link href="/privacy/" className="text-go-muted no-underline hover:text-go-green">
            Maxfiylik siyosati
          </Link>
          <Link href="/terms-of-use/" className="text-go-muted no-underline hover:text-go-green">
            Foydalanish shartlari
          </Link>
        </div>
      </div>
      <div className="border-0 border-t border-solid border-go-line py-4 text-center text-[0.8125rem] text-go-muted">
        © {new Date().getFullYear()} MilliyGo
      </div>
    </footer>
  )
}
