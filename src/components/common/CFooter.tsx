import Link from 'next/link'
import Image from 'next/image'
import {
  AppleFilled,
  FacebookOutlined,
  InstagramOutlined,
  MailOutlined,
  PhoneOutlined,
  SendOutlined,
} from '@ant-design/icons'

const CFooter = () => {
  return (
    <>
      <footer className="relative mt-auto overflow-hidden border-t border-gray-100 bg-white pb-28 pt-8 text-gray-600 shadow-[0_-10px_30px_rgba(0,0,0,0.015)] md:pb-8 md:pt-16">
        {/* Colorful Ikat Strip at the top of footer */}
        <div className="milliy-ikat-strip absolute left-0 top-0 z-20 h-[6px] w-full" />

        {/* Subtle background decoration */}
        <div className="milliy-pattern-bg absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full opacity-[0.08]" />

        <div className="container relative z-10">
          {/* Desktop/Tablet version (hidden on mobile) */}
          <div className="mb-12 hidden grid-cols-2 gap-12 md:grid lg:grid-cols-4">
            {/* Brand Section */}
            <div className="flex flex-col gap-5">
              <Link href="/" className="group flex items-center gap-2">
                <Image
                  src="/logo.png"
                  width={32}
                  height={32}
                  alt="MilliyGo Logo"
                  className="rounded-lg object-contain shadow-sm transition-transform group-hover:scale-105"
                />
                <span className="pacifico-regular text-2xl font-bold text-gray-900 transition-colors group-hover:text-[#C5A059]">
                  MilliyGo
                </span>
              </Link>
              <p className="text-[13.5px] leading-relaxed text-gray-500">
                G'allaorolda kafe, restoran va do'konlardan tezkor yetkazib berish xizmati.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="https://t.me/milliygo_app"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#24A1DE]/10 text-[#24A1DE] shadow-sm transition-all duration-200 hover:bg-[#24A1DE] hover:text-white"
                >
                  <SendOutlined className="text-[16px]" />
                </a>
                <a
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1877F2]/10 text-[#1877F2] shadow-sm transition-all duration-200 hover:bg-[#1877F2] hover:text-white"
                >
                  <FacebookOutlined className="text-[16px]" />
                </a>
                <a
                  href="https://www.instagram.com/milliyapp/"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E1306C]/10 text-[#E1306C] shadow-sm transition-all duration-200 hover:bg-gradient-to-tr hover:from-[#F9CE34] hover:via-[#EE2A7B] hover:to-[#6228D7] hover:text-white"
                >
                  <InstagramOutlined className="text-[16px]" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col gap-5">
              <h4 className="text-[14px] font-bold uppercase tracking-wider text-[#C5A059]">
                Kompaniya
              </h4>
              <div className="flex flex-col gap-3">
                <Link
                  href="/"
                  className="text-[14px] text-gray-500 transition-colors hover:text-gray-900"
                >
                  Bosh sahifa
                </Link>
                <Link
                  href="/orders"
                  className="text-[14px] text-gray-500 transition-colors hover:text-gray-900"
                >
                  Buyurtmalar tarixi
                </Link>
                <Link
                  href="/cart"
                  className="text-[14px] text-gray-500 transition-colors hover:text-gray-900"
                >
                  Savatcha
                </Link>
                <Link
                  href="/faq"
                  className="text-[14px] text-gray-500 transition-colors hover:text-gray-900"
                >
                  Savol-javoblar (FAQ)
                </Link>
              </div>
            </div>

            {/* Legal */}
            <div className="flex flex-col gap-5">
              <h4 className="text-[14px] font-bold uppercase tracking-wider text-[#C5A059]">
                Huquqiy
              </h4>
              <div className="flex flex-col gap-3">
                <Link
                  href="/privacy"
                  className="text-[14px] text-gray-500 transition-colors hover:text-gray-900"
                >
                  Maxfiylik siyosati
                </Link>
                <Link
                  href="/terms-of-use"
                  className="text-[14px] text-gray-500 transition-colors hover:text-gray-900"
                >
                  Foydalanish shartlari
                </Link>
              </div>
            </div>

            {/* Download Apps */}
            <div className="flex flex-col gap-5">
              <h4 className="text-[14px] font-bold uppercase tracking-wider text-[#C5A059]">
                Ilovani yuklab oling
              </h4>
              <div className="flex flex-col gap-3">
                {/* <a href="#" className="flex items-center gap-3 bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors shadow-sm">
                  <AppleFilled className="text-[24px] text-gray-800" />
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-semibold opacity-70">App Store</span>
                    <span className="text-[14px] font-bold leading-none">Yuklab olish</span>
                  </div>
                </a> */}
                <a
                  href="#"
                  className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-700 shadow-sm transition-colors hover:bg-gray-100"
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
                      fill="#3BCCFF"
                    />
                    <path
                      d="M19.9961 20.596L15.3979 15.95V15.6755L19.9961 11.0294L20.216 11.1563L25.5458 14.2048C27.0687 15.0716 27.0687 16.4932 25.5458 17.36L20.216 20.4691L19.9961 20.596Z"
                      fill="#FFC100"
                    />
                    <path
                      d="M20.216 20.469L15.3978 15.6757L1.61383 29.5073C2.15783 30.0824 3.0769 30.1586 4.0883 29.5878L20.216 20.469Z"
                      fill="#F90C28"
                    />
                    <path
                      d="M20.216 11.0294L4.0883 1.9103C3.0769 1.33958 2.15783 1.4158 1.61383 1.99088L15.3978 15.6757L20.216 11.0294Z"
                      fill="#00D75D"
                    />
                  </svg>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-semibold uppercase opacity-70">
                      Google Play
                    </span>
                    <span className="text-[14px] font-bold leading-none">
                      Yuklab olish (Tez kunda)
                    </span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Mobile version (hidden on desktop/tablet) */}
          <div className="mb-6 flex flex-col items-center gap-4 text-center md:hidden">
            {/* Logo and Brand Name */}
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                width={26}
                height={26}
                alt="MilliyGo Logo"
                className="rounded-lg object-contain"
              />
              <span className="pacifico-regular text-lg font-bold text-gray-900">MilliyGo</span>
            </div>

            {/* Slogan */}
            <p className="-mt-2 max-w-[280px] text-[12px] leading-tight text-gray-400">
              Tezkor va oson yetkazib berish xizmati
            </p>

            {/* Links Row */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-2 text-[12px] font-semibold text-gray-500">
              <Link href="/" className="transition-colors hover:text-gray-900">
                Bosh sahifa
              </Link>
              <span className="text-[10px] text-gray-300">•</span>
              <Link href="/orders" className="transition-colors hover:text-gray-900">
                Buyurtmalar
              </Link>
              <span className="text-[10px] text-gray-300">•</span>
              <Link href="/cart" className="transition-colors hover:text-gray-900">
                Savatcha
              </Link>
              <span className="text-[10px] text-gray-300">•</span>
              <Link href="/faq" className="transition-colors hover:text-gray-900">
                FAQ
              </Link>
              <span className="text-[10px] text-gray-300">•</span>
              <Link href="/privacy" className="transition-colors hover:text-gray-900">
                Maxfiylik
              </Link>
              <span className="text-[10px] text-gray-300">•</span>
              <Link href="/terms-of-use" className="transition-colors hover:text-gray-900">
                Shartlar
              </Link>
            </div>

            {/* Social media icons */}
            <div className="mt-1 flex items-center gap-4">
              <a
                href="https://t.me/milliygo_app"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#24A1DE]/10 text-[#24A1DE] shadow-sm transition-all duration-200 hover:bg-[#24A1DE] hover:text-white"
              >
                <SendOutlined className="text-[13px]" />
              </a>
              <a
                href="#"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1877F2]/10 text-[#1877F2] shadow-sm transition-all duration-200 hover:bg-[#1877F2] hover:text-white"
              >
                <FacebookOutlined className="text-[13px]" />
              </a>
              <a
                href="https://www.instagram.com/milliyapp/"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E1306C]/10 text-[#E1306C] shadow-sm transition-all duration-200 hover:bg-gradient-to-tr hover:from-[#F9CE34] hover:via-[#EE2A7B] hover:to-[#6228D7] hover:text-white"
              >
                <InstagramOutlined className="text-[13px]" />
              </a>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 md:flex-row">
            <div className="text-center text-[11px] text-gray-400 md:text-[13px] md:text-gray-500">
              © 2026 MilliyGo. Barcha huquqlar himoyalangan.
            </div>
            <div className="flex flex-col items-center gap-3 text-[12px] sm:flex-row sm:gap-8 md:text-[13px]">
              <a
                href="tel:+998904969007"
                className="flex items-center gap-2 text-gray-500 transition-colors hover:text-[#C5A059]"
              >
                <PhoneOutlined className="text-gray-400" />
                +998 90 496 90 07
              </a>
              <a
                href="mailto:info@milliyapp.uz"
                className="flex items-center gap-2 text-gray-500 transition-colors hover:text-[#C5A059]"
              >
                <MailOutlined className="text-gray-400" />
                info@milliyapp.uz
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
