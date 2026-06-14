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
      <footer className="mt-auto bg-white border-t border-gray-100 pt-16 pb-8 relative overflow-hidden text-gray-600 shadow-[0_-10px_30px_rgba(0,0,0,0.015)]">
        {/* Colorful Ikat Strip at the top of footer */}
        <div className="absolute top-0 left-0 w-full h-[6px] milliy-ikat-strip z-20" />
        
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 milliy-pattern-bg opacity-[0.08] -translate-y-1/2 translate-x-1/2 rounded-full" />
        
        <div className="container relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

            {/* Brand Section */}
            <div className="flex flex-col gap-5">
              <Link href="/" className="flex items-center gap-2 group">
                <Image
                  src="/logo.png"
                  width={32}
                  height={32}
                  alt="MilliyGo Logo"
                  className="object-contain rounded-lg shadow-sm transition-transform group-hover:scale-105"
                />
                <span className="pacifico-regular text-2xl font-bold text-gray-900 group-hover:text-[#C5A059] transition-colors">MilliyGo</span>
              </Link>
              <p className="text-[13.5px] text-gray-500 leading-relaxed">
                G'allaorolda kafe, restoran va do'konlardan tezkor yetkazib berish xizmati.
              </p>
              <div className="flex items-center gap-4">
                <a href="https://t.me/milliygo_app" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 border border-gray-200 text-gray-500 hover:text-[#C5A059] hover:border-[#C5A059] transition-all duration-200 shadow-sm">
                  <SendOutlined className="text-[16px]" />
                </a>
                <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 border border-gray-200 text-gray-500 hover:text-[#C5A059] hover:border-[#C5A059] transition-all duration-200 shadow-sm">
                  <FacebookOutlined className="text-[16px]" />
                </a>
                <a href="https://www.instagram.com/milliyapp/" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 border border-gray-200 text-gray-500 hover:text-[#C5A059] hover:border-[#C5A059] transition-all duration-200 shadow-sm">
                  <InstagramOutlined className="text-[16px]" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col gap-5">
              <h4 className="text-[14px] font-bold text-[#C5A059] uppercase tracking-wider">Kompaniya</h4>
              <div className="flex flex-col gap-3">
                <Link href="/" className="text-[14px] text-gray-500 hover:text-gray-900 transition-colors">Bosh sahifa</Link>
                <Link href="/orders" className="text-[14px] text-gray-500 hover:text-gray-900 transition-colors">Buyurtmalar tarixi</Link>
                <Link href="/cart" className="text-[14px] text-gray-500 hover:text-gray-900 transition-colors">Savatcha</Link>
                <Link href="/faq" className="text-[14px] text-gray-500 hover:text-gray-900 transition-colors">Savol-javoblar (FAQ)</Link>
              </div>
            </div>

            {/* Legal */}
            <div className="flex flex-col gap-5">
              <h4 className="text-[14px] font-bold text-[#C5A059] uppercase tracking-wider">Huquqiy</h4>
              <div className="flex flex-col gap-3">
                <Link href="/privacy" className="text-[14px] text-gray-500 hover:text-gray-900 transition-colors">Maxfiylik siyosati</Link>
                <Link href="/terms-of-use" className="text-[14px] text-gray-500 hover:text-gray-900 transition-colors">Foydalanish shartlari</Link>
              </div>
            </div>

            {/* Download Apps */}
            <div className="flex flex-col gap-5">
              <h4 className="text-[14px] font-bold text-[#C5A059] uppercase tracking-wider">Ilovani yuklab oling</h4>
              <div className="flex flex-col gap-3">
                <a href="#" className="flex items-center gap-3 bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors shadow-sm">
                  <AppleFilled className="text-[24px] text-gray-800" />
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-semibold opacity-70">App Store</span>
                    <span className="text-[14px] font-bold leading-none">Yuklab olish</span>
                  </div>
                </a>
                <a href="#" className="flex items-center gap-3 bg-gray-50 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors shadow-sm">
                  <svg width="22" height="24" viewBox="0 0 28 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.61385 1.22554C1.13799 1.72844 0.874962 2.51809 0.874962 3.52132V27.2114C0.874962 28.2146 1.13799 29.0042 1.61385 29.5071L1.77018 29.655L15.3976 15.9493V15.675L1.77018 1.07755L1.61385 1.22554Z" fill="#3BCCFF" />
                    <path d="M19.9961 20.596L15.3979 15.95V15.6755L19.9961 11.0294L20.216 11.1563L25.5458 14.2048C27.0687 15.0716 27.0687 16.4932 25.5458 17.36L20.216 20.4691L19.9961 20.596Z" fill="#FFC100" />
                    <path d="M20.216 20.469L15.3978 15.6757L1.61383 29.5073C2.15783 30.0824 3.0769 30.1586 4.0883 29.5878L20.216 20.469Z" fill="#F90C28" />
                    <path d="M20.216 11.0294L4.0883 1.9103C3.0769 1.33958 2.15783 1.4158 1.61383 1.99088L15.3978 15.6757L20.216 11.0294Z" fill="#00D75D" />
                  </svg>
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-semibold opacity-70">Google Play</span>
                    <span className="text-[14px] font-bold leading-none">Yuklab olish</span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-[13px] text-gray-500">
              © 2026 MilliyGo. Barcha huquqlar himoyalangan.
            </div>
            <div className="flex flex-wrap items-center gap-8">
              <a href="tel:+998904969007" className="flex items-center gap-2 text-[13px] text-gray-500 hover:text-[#C5A059] transition-colors">
                <PhoneOutlined className="text-gray-400" />
                +998 90 496 90 07
              </a>
              <a href="mailto:info@milliyapp.uz" className="flex items-center gap-2 text-[13px] text-gray-500 hover:text-[#C5A059] transition-colors">
                <MailOutlined className="text-gray-400" />
                info@milliyapp.uz
              </a>
            </div>
          </div>
        </div>
      </footer>
      <div className="h-2 w-full milliy-ikat-strip" />
    </>
  )
}

export default CFooter