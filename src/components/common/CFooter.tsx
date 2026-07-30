import Link from 'next/link'
import Image from 'next/image'
import {
  FacebookOutlined,
  InstagramOutlined,
  MailOutlined,
  PhoneOutlined,
  SendOutlined,
} from '@ant-design/icons'
import { useApplicationInfo } from '@/features/Application/hooks/useApplicationInfo'

const CFooter = () => {
  const { info: applicationInfo } = useApplicationInfo()

  return (
    <>
      <footer className="relative mt-auto overflow-hidden bg-gradient-to-b from-[#0A192F] via-[#0B1E38] to-[#081527] pb-28 pt-10 text-gray-400 md:pb-10 md:pt-16">
        {/* Colorful Ikat Strip at the top of footer */}
        <div className="milliy-ikat-strip absolute left-0 top-0 z-20 h-[6px] w-full" />

        {/* Subtle background decoration */}
        <div className="milliy-girih-blueprint pointer-events-none absolute inset-0 opacity-40" />
        <div className="milliy-pattern-bg absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full opacity-[0.06]" />

        <div className="container relative z-10">
          {/* App Download CTA banner */}
          <div className="mb-10 flex flex-col items-center gap-5 rounded-3xl border border-[#C5A059]/25 bg-white/[0.03] p-6 text-center backdrop-blur-sm sm:p-8 md:mb-14 md:flex-row md:justify-between md:text-left">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#C5A059]">
                MilliyGo ilovasi
              </span>
              <h3 className="text-[19px] font-black leading-snug text-white sm:text-[22px]">
                Buyurtma berish uchun ilovani yuklab oling
              </h3>
              <p className="max-w-md text-[13.5px] leading-relaxed text-gray-400">
                {applicationInfo.number_of_partner
                  ? `${applicationInfo.number_of_partner}+ restoran va do'kondan tezkor yetkazib berish — endi cho'ntagingizda.`
                  : "Restoran va do'konlardan tezkor yetkazib berish — endi cho'ntagingizda."}
              </p>
            </div>

            <div className="flex flex-shrink-0 items-center gap-3">
              <a
                href={applicationInfo.android_application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl bg-[#C5A059] px-5 py-3 text-[#0A192F] shadow-[0_8px_24px_rgba(197,160,89,0.25)] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#E5C583]"
              >
                <svg
                  width="22"
                  height="24"
                  viewBox="0 0 28 30"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.61385 1.22554C1.13799 1.72844 0.874962 2.51809 0.874962 3.52132V27.2114C0.874962 28.2146 1.13799 29.0042 1.61385 29.5071L1.77018 29.655L15.3976 15.9493V15.675L1.77018 1.07755L1.61385 1.22554Z"
                    fill="#0A192F"
                  />
                  <path
                    d="M19.9961 20.596L15.3979 15.95V15.6755L19.9961 11.0294L20.216 11.1563L25.5458 14.2048C27.0687 15.0716 27.0687 16.4932 25.5458 17.36L20.216 20.4691L19.9961 20.596Z"
                    fill="#0A192F"
                  />
                  <path
                    d="M20.216 20.469L15.3978 15.6757L1.61383 29.5073C2.15783 30.0824 3.0769 30.1586 4.0883 29.5878L20.216 20.469Z"
                    fill="#0A192F"
                  />
                  <path
                    d="M20.216 11.0294L4.0883 1.9103C3.0769 1.33958 2.15783 1.4158 1.61383 1.99088L15.3978 15.6757L20.216 11.0294Z"
                    fill="#0A192F"
                  />
                </svg>
                <div className="flex flex-col leading-none">
                  <span className="text-[9px] font-semibold uppercase opacity-70">Google Play</span>
                  <span className="mt-0.5 text-[14px] font-black">Yuklab olish</span>
                </div>
              </a>
            </div>
          </div>

          {/* Desktop/Tablet version (hidden on mobile) */}
          <div className="mb-12 hidden grid-cols-3 gap-12 md:grid">
            {/* Brand Section */}
            <div className="flex flex-col gap-5">
              <Link href="/" className="group flex items-center gap-3">
                <Image
                  src="/logo.png"
                  width={40}
                  height={40}
                  alt="MilliyGo Logo"
                  className="rounded-xl object-contain shadow-md transition-transform group-hover:scale-105"
                />
                <span className="pacifico-regular text-2xl font-bold text-white transition-colors group-hover:text-[#C5A059]">
                  {applicationInfo.name}
                </span>
              </Link>
              <p className="text-[13.5px] leading-relaxed text-gray-400">
                {applicationInfo.description ||
                  "G'allaorolda kafe, restoran va do'konlardan tezkor yetkazib berish xizmati."}
              </p>
              <div className="flex items-center gap-3">
                {applicationInfo.telegram_url && (
                  <a
                    href={applicationInfo.telegram_url}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#24A1DE]/15 text-[#4FB8EA] ring-1 ring-white/5 transition-all duration-200 hover:bg-[#24A1DE] hover:text-white"
                  >
                    <SendOutlined className="text-[16px]" />
                  </a>
                )}
                {applicationInfo.facebook_url && (
                  <a
                    href={applicationInfo.facebook_url}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2]/15 text-[#5B9BF5] ring-1 ring-white/5 transition-all duration-200 hover:bg-[#1877F2] hover:text-white"
                  >
                    <FacebookOutlined className="text-[16px]" />
                  </a>
                )}
                {applicationInfo.instagram_url && (
                  <a
                    href={applicationInfo.instagram_url}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E1306C]/15 text-[#F0679A] ring-1 ring-white/5 transition-all duration-200 hover:bg-gradient-to-tr hover:from-[#F9CE34] hover:via-[#EE2A7B] hover:to-[#6228D7] hover:text-white"
                  >
                    <InstagramOutlined className="text-[16px]" />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col gap-5">
              <h4 className="text-[13px] font-bold uppercase tracking-wider text-[#C5A059]">
                Kompaniya
              </h4>
              <div className="flex flex-col gap-3">
                <Link
                  href="/"
                  className="text-[14px] text-gray-400 transition-colors hover:text-white"
                >
                  Bosh sahifa
                </Link>
                <Link
                  href="/orders"
                  className="text-[14px] text-gray-400 transition-colors hover:text-white"
                >
                  Buyurtmalar tarixi
                </Link>
                <Link
                  href="/cart"
                  className="text-[14px] text-gray-400 transition-colors hover:text-white"
                >
                  Savatcha
                </Link>
                <Link
                  href="/faq"
                  className="text-[14px] text-gray-400 transition-colors hover:text-white"
                >
                  Savol-javoblar (FAQ)
                </Link>
              </div>
            </div>

            {/* Legal */}
            <div className="flex flex-col gap-5">
              <h4 className="text-[13px] font-bold uppercase tracking-wider text-[#C5A059]">
                Huquqiy
              </h4>
              <div className="flex flex-col gap-3">
                <Link
                  href="/privacy"
                  className="text-[14px] text-gray-400 transition-colors hover:text-white"
                >
                  Maxfiylik siyosati
                </Link>
                <Link
                  href="/terms-of-use"
                  className="text-[14px] text-gray-400 transition-colors hover:text-white"
                >
                  Foydalanish shartlari
                </Link>
                {applicationInfo.address && (
                  <span className="mt-2 flex items-start gap-2 text-[13px] text-gray-500">
                    {applicationInfo.address}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Mobile version (hidden on desktop/tablet) */}
          <div className="mb-6 flex flex-col items-center gap-4 text-center md:hidden">
            {/* Logo and Brand Name */}
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                width={32}
                height={32}
                alt="MilliyGo Logo"
                className="rounded-lg object-contain shadow-md"
              />
              <span className="pacifico-regular text-lg font-bold text-white">
                {applicationInfo.name}
              </span>
            </div>

            {/* Slogan */}
            <p className="-mt-2 max-w-[280px] text-[12px] leading-tight text-gray-500">
              Tezkor va oson yetkazib berish xizmati
            </p>

            {/* Links Row */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-2 text-[12px] font-semibold text-gray-400">
              <Link href="/" className="transition-colors hover:text-white">
                Bosh sahifa
              </Link>
              <span className="text-[10px] text-gray-600">•</span>
              <Link href="/orders" className="transition-colors hover:text-white">
                Buyurtmalar
              </Link>
              <span className="text-[10px] text-gray-600">•</span>
              <Link href="/cart" className="transition-colors hover:text-white">
                Savatcha
              </Link>
              <span className="text-[10px] text-gray-600">•</span>
              <Link href="/faq" className="transition-colors hover:text-white">
                FAQ
              </Link>
              <span className="text-[10px] text-gray-600">•</span>
              <Link href="/privacy" className="transition-colors hover:text-white">
                Maxfiylik
              </Link>
              <span className="text-[10px] text-gray-600">•</span>
              <Link href="/terms-of-use" className="transition-colors hover:text-white">
                Shartlar
              </Link>
            </div>

            {/* Social media icons */}
            <div className="mt-1 flex items-center gap-3">
              {applicationInfo.telegram_url && (
                <a
                  href={applicationInfo.telegram_url}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#24A1DE]/15 text-[#4FB8EA] ring-1 ring-white/5 transition-all duration-200 hover:bg-[#24A1DE] hover:text-white"
                >
                  <SendOutlined className="text-[13px]" />
                </a>
              )}
              {applicationInfo.facebook_url && (
                <a
                  href={applicationInfo.facebook_url}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1877F2]/15 text-[#5B9BF5] ring-1 ring-white/5 transition-all duration-200 hover:bg-[#1877F2] hover:text-white"
                >
                  <FacebookOutlined className="text-[13px]" />
                </a>
              )}
              {applicationInfo.instagram_url && (
                <a
                  href={applicationInfo.instagram_url}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E1306C]/15 text-[#F0679A] ring-1 ring-white/5 transition-all duration-200 hover:bg-gradient-to-tr hover:from-[#F9CE34] hover:via-[#EE2A7B] hover:to-[#6228D7] hover:text-white"
                >
                  <InstagramOutlined className="text-[13px]" />
                </a>
              )}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 md:flex-row">
            <div className="text-center text-[11px] text-gray-500 md:text-[13px]">
              © {new Date().getFullYear()} {applicationInfo.name}. Barcha huquqlar himoyalangan.
            </div>
            <div className="flex flex-col items-center gap-3 text-[12px] sm:flex-row sm:gap-8 md:text-[13px]">
              <a
                href={`tel:${applicationInfo.phone_number}`}
                className="flex items-center gap-2 text-gray-400 transition-colors hover:text-[#C5A059]"
              >
                <PhoneOutlined className="text-gray-500" />
                {applicationInfo.phone_number}
              </a>
              <a
                href={`mailto:${applicationInfo.email}`}
                className="flex items-center gap-2 text-gray-400 transition-colors hover:text-[#C5A059]"
              >
                <MailOutlined className="text-gray-500" />
                {applicationInfo.email}
              </a>
            </div>
          </div>
        </div>
      </footer>
      <div className="milliy-ikat-strip h-2 w-full" />
    </>
  )
}

export default CFooter
