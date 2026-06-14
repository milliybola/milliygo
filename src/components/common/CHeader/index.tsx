import { Button, Flex, Input, Layout, Typography, message } from 'antd'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { memo, useContext, useEffect, useRef, useState } from 'react'
import { AuthContext } from '@/features/Account/auth/context/authContext'
import {
  PhoneOutlined,
  MailOutlined,
  SendOutlined,
  FacebookOutlined,
  InstagramOutlined,
  GlobalOutlined,
  SearchOutlined,
  EnvironmentOutlined,
  DownOutlined,
  ContainerOutlined,
  ShoppingOutlined,
  LoginOutlined,
  FireOutlined,
  LoadingOutlined,
} from '@ant-design/icons'
import request from '@/utils/axios'
import ChatDrawer from './components/ChatDrawer'
import NotificationPopover from './components/NotificationPopover'
import ProfileMenuPopover from './components/ProfileMenuPopover'
import HeaderMenuDrawer from './components/ResponsiveDrawer'
import LocationModal from './components/LocationModal'
import { useLocationStore } from '@/store/useLocationStore'
import { checkServiceArea } from '@/helpers/location-helper'
import dayjs from 'dayjs'
import 'dayjs/locale/ar'
import 'dayjs/locale/az'
import 'dayjs/locale/de'
import 'dayjs/locale/es'
import 'dayjs/locale/fr'
import 'dayjs/locale/hi'
import 'dayjs/locale/it'
import 'dayjs/locale/ja'
import 'dayjs/locale/kk'
import 'dayjs/locale/ko'
import 'dayjs/locale/pt'
import 'dayjs/locale/ru'
import 'dayjs/locale/tg'
import 'dayjs/locale/tk'
import 'dayjs/locale/tr'
import 'dayjs/locale/ur'
import 'dayjs/locale/uz-latn'
import 'dayjs/locale/zh-cn'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import logo from '/public/logo.png'
import telegram from '/public/telegram.png'
import facebook from '/public/facebook.png'
import instagram from '/public/instagram.png'
import { LocationService } from '@/services/location-service'

dayjs.extend(relativeTime)
dayjs.extend(customParseFormat)

interface authStore {
  isAuthenticated: boolean
}

import { useYMaps } from '@pbe/react-yandex-maps'

const CHeader = () => {
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false)
  const [scrolled, setScrolled] = useState<boolean>(false)
  const [searchFocused, setSearchFocused] = useState<boolean>(false)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false)

  // Search states
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<{ partners: any[]; products: any[] } | null>(null)
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  
  const router = useRouter()
  const { locale } = router
  const authContext = useContext(AuthContext)
  const openLogin = authContext?.openLogin
  const { authStore } = (authContext as { authStore: authStore }) || { authStore: { isAuthenticated: false } }
  const { isAuthenticated } = authStore
  const [dayjsLocale, setDayjsLocale] = useState<string>('uz-latn')
  const searchRef = useRef<HTMLInputElement>(null)

  // Click outside listener for closing desktop search results dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Debounced search API request
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults(null)
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res: any = await request({
          url: `/search/?q=${encodeURIComponent(searchQuery)}`,
          method: 'get',
        })
        if (res?.success) {
          setSearchResults(res.data)
        } else {
          setSearchResults(null)
        }
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults(null)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const { location, setLocation, setIsInServiceArea } = useLocationStore()
  const ymaps = useYMaps(['geocode'])

  useEffect(() => {
    setIsSignedIn(isAuthenticated)
  }, [isAuthenticated])

  useEffect(() => {
    const map: Record<string, string> = { uz: 'uz-latn', 'zh-CN': 'zh-cn', kz: 'kk' }
    setDayjsLocale(map[locale ?? ''] ?? locale ?? 'uz-latn')
  }, [locale])

  useEffect(() => {
    dayjs.locale(dayjsLocale)
  }, [dayjsLocale])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Geolocation check on mount
  useEffect(() => {
    if (!location && ymaps) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            const inArea = checkServiceArea(latitude, longitude)
            
            if (inArea) {
              try {
                const result = await ymaps.geocode([latitude, longitude])
                const firstGeoObject = result.geoObjects.get(0)
                const addr = firstGeoObject ? (firstGeoObject as any).getAddressLine() : 'Mening joylashuvim'
                
                setLocation({ lat: latitude, lng: longitude, address: addr })
                setIsInServiceArea(true)
                message.success('Joylashuv aniqlandi')
              } catch (error) {
                console.error('Initial geocoding error:', error)
                setIsLocationModalOpen(true)
              }
            } else {
              message.warning('Siz xizmat ko\'rsatish hududidan tashqaridasiz. Iltimos, hududni tanlang.')
              setIsLocationModalOpen(true)
            }
          },
          (error) => {
            console.error('Geolocation error:', error)
            setIsLocationModalOpen(true)
          }
        )
      } else {
        setIsLocationModalOpen(true)
      }
    }
  }, [location, setLocation, setIsInServiceArea, ymaps])

  return (
    <Layout.Header
      style={{ padding: 0, height: 'auto', background: 'transparent' }}
      className="sticky top-0 z-50 w-full"
    >
      {/* ── Milliy-Classic Top Bar ── */}
      <div className="hidden lg:block w-full bg-[#FAF9F6] border-b border-[#E5E7EB] overflow-hidden relative">
        <div className="absolute inset-0 milliy-pattern-bg opacity-[0.06] pointer-events-none" />
        <div className="container relative z-10">
          <div className="flex items-center justify-between h-[38px] text-[12px] font-medium text-gray-600">
            {/* Left */}
            <div className="flex items-center gap-6 ">
              <div className="flex items-center gap-2 h-[38px] text-[#C5A059] text-[13px] font-bold select-none">
                <FireOutlined style={{ fontSize: 14 }} />
                30 daqiqada yetkazib beramiz
              </div>
              <div className="w-px h-3 bg-[#E5E7EB]" />
              <a
                href="tel:+998904969007"
                className="flex items-center text-[13px] text-gray-600 gap-2 hover:text-[#C5A059] transition-all duration-200"
              >
                <PhoneOutlined style={{ fontSize: 14 }} />
                +998 90 496 90 07
              </a>
              <a
                href="mailto:info@milliyapp.uz"
                className="flex items-center text-[13px] text-gray-600 gap-2 hover:text-[#C5A059] transition-all duration-200"
              >
                <MailOutlined style={{ fontSize: 14 }} />
                info@milliyapp.uz
              </a>
            </div>

            {/* Right */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3.5">
                <a
                  href="https://t.me/milliygo_app"
                  aria-label="Telegram"
                  className="hover:opacity-100 transition-opacity opacity-75 filter grayscale brightness-50"
                >
                  <Image src={telegram} alt="Telegram" width={18} height={18} className="object-contain" />
                </a>
                <a
                  href="https://www.instagram.com/milliyapp/"
                  aria-label="Instagram"
                  className="hover:opacity-100 transition-opacity opacity-75 filter grayscale brightness-50"
                >
                  <Image src={instagram} alt="Instagram" width={18} height={18} className="object-contain" />
                </a>
              </div>
              <div className="w-px h-3 bg-[#E5E7EB]" />
              <button className="flex items-center gap-2 hover:text-[#C5A059] transition-all duration-200 group text-gray-600">
                <GlobalOutlined style={{ fontSize: 14 }} />
                <span className="text-[13px] font-semibold">O&#39;zbekcha</span>
                <DownOutlined
                  style={{ fontSize: 8 }}
                  className="opacity-50 group-hover:opacity-100 transition-opacity"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main NavBar ── */}
      <div
        className={`w-full bg-white transition-all duration-300 relative ${
          scrolled ? 'shadow-[0_1px_24px_rgba(0,0,0,0.07)]' : 'border-b border-[#efefed]'
        }`}
      >
        <div className="container">
          <div className="flex justify-between items-center gap-8 h-[68px]">
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link
                href="/"
                className=" flex items-center gap-2 flex-shrink-0 hover:opacity-70 transition-opacity duration-200 active:scale-95"
              >
                <Image
                  priority
                  width={34}
                  height={34}
                  src={logo}
                  alt="MilliyGo"
                  className="object-contain rounded-lg shadow-sm"
                />
                <Typography.Text className="pacifico-regular text-[22px] font-bold text-[#111]">
                  MilliyGo
                </Typography.Text>
              </Link>

              {/* Search */}
              <div className="relative w-full max-w-[400px]" ref={searchContainerRef}>
                <Input
                  prefix={
                    <SearchOutlined
                      className={` text-[14px] mr-3 flex-shrink-0 transition-colors duration-200 ${
                        searchFocused ? 'text-[#111]' : 'text-[#bbb]'
                      }`}
                    />
                  }
                  type="text"
                  placeholder="Restoran yoki taom qidiring..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  className="border-[#e5e5e3] min-w-[300px] w-full py-2 bg-transparent outline-none text-[13.5px] text-[#111] placeholder-[#bbb] font-[450] tracking-[-0.01em]"
                />

                {/* Dropdown Overlay */}
                {searchFocused && searchQuery.trim().length > 0 && (
                  <div className="absolute left-0 top-full mt-2 w-[480px] bg-white rounded-2xl border border-gray-100 shadow-[0_12px_40px_rgba(0,0,0,0.08)] z-50 overflow-hidden max-h-[480px] overflow-y-auto flex flex-col">
                    {searchQuery.trim().length < 2 ? (
                      <div className="p-4 text-center text-gray-400 text-[13px]">
                        Qidirish uchun kamida 2 ta belgi kiriting...
                      </div>
                    ) : isSearching ? (
                      <div className="p-8 flex items-center justify-center gap-2 text-gray-400 text-[13.5px]">
                        <LoadingOutlined className="text-blue-500 animate-spin" />
                        Qidirilmoqda...
                      </div>
                    ) : (!searchResults || (searchResults.partners.length === 0 && searchResults.products.length === 0)) ? (
                      <div className="p-8 text-center text-gray-400 text-[13.5px] flex flex-col items-center justify-center gap-2">
                        <SearchOutlined className="text-2xl text-gray-300" />
                        Hech narsa topilmadi
                      </div>
                    ) : (
                      <div className="flex flex-col py-2">
                        {/* Partners Section */}
                        {searchResults.partners.length > 0 && (
                          <div className="flex flex-col">
                            <div className="px-4 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                              Tashkilotlar
                            </div>
                            <div className="flex flex-col">
                              {searchResults.partners.map((partner: any) => {
                                const partnerUrl = partner.partner_type === 'SHOP'
                                  ? `/store/${partner.uuid}?id=${partner.id}`
                                  : `/restaurant/${partner.uuid}?id=${partner.id}`
                                return (
                                  <Link
                                    key={partner.uuid}
                                    href={partnerUrl}
                                    onClick={() => {
                                      setSearchFocused(false)
                                      setSearchQuery('')
                                    }}
                                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors duration-150 group"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden border border-gray-50 flex-shrink-0">
                                        <img
                                          src={partner.logo || '/placeholder-logo.png'}
                                          alt={partner.name}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/placeholder-logo.png'
                                          }}
                                        />
                                      </div>
                                      <div className="flex flex-col leading-tight">
                                        <span className="text-[13.5px] font-bold text-gray-900 group-hover:text-[#00D166] transition-colors">
                                          {partner.name}
                                        </span>
                                        <span className="text-[11px] text-gray-400 line-clamp-1 max-w-[240px]">
                                          {partner.address}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {partner.rating && (
                                        <span className="flex items-center gap-0.5 text-[11px] font-bold text-[#F59E0B]">
                                          ★ {partner.rating}
                                        </span>
                                      )}
                                      <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                        {partner.partner_type === 'SHOP' ? 'Do\'kon' : 'Restoran'}
                                      </span>
                                    </div>
                                  </Link>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Products Section */}
                        {searchResults.products.length > 0 && (
                          <div className="flex flex-col mt-2">
                            <div className="px-4 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                              Taomlar va Mahsulotlar
                            </div>
                            <div className="flex flex-col">
                              {searchResults.products.map((product: any) => {
                                const partnerUrl = product.partner_type === 'SHOP'
                                  ? `/store/${product.partner_uuid}?id=${product.partner_uuid}`
                                  : `/restaurant/${product.partner_uuid}?id=${product.partner_uuid}`
                                const formattedPrice = Number(product.price).toLocaleString('uz-UZ').replace(/,/g, ' ')
                                return (
                                  <Link
                                    key={product.uuid}
                                    href={partnerUrl}
                                    onClick={() => {
                                      setSearchFocused(false)
                                      setSearchQuery('')
                                    }}
                                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors duration-150 group"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden border border-gray-50 flex-shrink-0">
                                        <img
                                          src={product.main_image || '/placeholder-food.png'}
                                          alt={product.name}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/placeholder-food.png'
                                          }}
                                        />
                                      </div>
                                      <div className="flex flex-col leading-tight">
                                        <span className="text-[13.5px] font-bold text-gray-900 group-hover:text-[#00D166] transition-colors">
                                          {product.name}
                                        </span>
                                        <span className="text-[11px] text-gray-400">
                                          {product.partner_name} dan
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex flex-col items-end leading-tight">
                                      <span className="text-[13px] font-black text-gray-900">
                                        {formattedPrice} UZS
                                      </span>
                                      {product.discount > 0 && (
                                        <span className="text-[10px] text-green-600 font-bold">
                                          -{product.discount}%
                                        </span>
                                      )}
                                    </div>
                                  </Link>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Location */}
              <div
                onClick={() => setIsLocationModalOpen(true)}
                className="border-[#e5e5e3] cursor-pointer md:flex items-center gap-2.5 px-3 py-3 rounded-[16px] hover:border-[#b2dfdb] hover:bg-[#e0f2f1]/20 transition-all duration-200 group"
              >
                <span className="w-[30px] h-[30px] rounded-[10px] bg-[#e0f2f1] flex items-center justify-center flex-shrink-0">
                  <EnvironmentOutlined className="text-[13px] text-[#008080]" />
                </span>
                <div className="text-left leading-none max-w-[150px]">
                  <div className="text-[10px] text-[#008080]/60 font-semibold uppercase tracking-[0.05em] mb-[3px]">
                    Manzil
                  </div>
                  <div className="text-[13px] font-bold text-[#111] tracking-[-0.01em] truncate">
                    {location?.address || 'Manzilni tanlang'}
                  </div>
                </div>
                <DownOutlined className="text-[8px] text-[#ccc] group-hover:text-[#008080] transition-colors duration-200" />
              </div>

              {/* Vertical rule */}
              <div className="hidden lg:block h-7 w-px bg-[#ebebea]" />

              {/* Orders */}
              <Button
                onClick={() => router.push('/orders')}
                className="border-none hidden md:flex flex-col items-center gap-[5px] px-3 py-2 rounded-2xl hover:bg-[#f5f4f1] transition-colors duration-200 group min-w-[62px]"
              >
                <span className="w-[30px] h-[30px] rounded-[10px] bg-[#f5f4f1] group-hover:bg-white group-hover:shadow-[0_2px_10px_rgba(0,0,0,0.07)] flex items-center justify-center transition-all duration-200">
                  <ContainerOutlined className="text-[15px] text-[#666] group-hover:text-[#111] transition-colors duration-200" />
                </span>
                <span className="text-[10.5px] font-semibold text-[#999] group-hover:text-[#333] transition-colors duration-200 whitespace-nowrap leading-none">
                  Buyurtmalar
                </span>
              </Button>

              {/* Cart */}
              <Button
                onClick={() => router.push('/cart')}
                className="border-none hidden md:flex flex-col items-center gap-[5px] px-3 py-2 rounded-2xl hover:bg-[#f5f4f1] transition-colors duration-200 group min-w-[52px]"
              >
                <span className="relative w-[30px] h-[30px] rounded-[10px] bg-[#f5f4f1] group-hover:bg-white group-hover:shadow-[0_2px_10px_rgba(0,0,0,0.07)] flex items-center justify-center transition-all duration-200">
                  <ShoppingOutlined className="text-[15px] text-[#666] group-hover:text-[#111] transition-colors duration-200" />
                </span>
                <span className="text-[10.5px] font-semibold text-[#999] group-hover:text-[#333] transition-colors duration-200 leading-none">
                  Savat
                </span>
              </Button>

              {/* Vertical rule */}
              <div className="hidden lg:block h-7 w-px bg-[#ebebea]" />

              {/* Auth */}
              <div className="flex items-center gap-2">
                {isSignedIn ? (
                  <Flex align="center" gap={6}>
                    <div className="hidden sm:flex items-center gap-1">
                      <NotificationPopover light={true} />
                      <ChatDrawer light={true} />
                    </div>
                    <ProfileMenuPopover light={true} />
                  </Flex>
                ) : (
                  <Flex align="center" gap={6}>
                    <Button
                      onClick={() => {
                        openLogin?.()
                      }}
                      className="
                      relative overflow-hidden
                      flex items-center gap-2
                      bg-[#111] hover:bg-[#2a2a2a] active:bg-black active:scale-[0.97]
                      text-white text-[13px] font-semibold tracking-[-0.01em]
                      px-5 py-[0px] rounded-[13px]
                      transition-all duration-200 group
                      "
                    >
                      <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 bg-gradient-to-r from-transparent via-white/[0.2] to-transparent skew-x-12" />
                      <LoginOutlined className="text-[14px]" />
                      Kirish
                    </Button>

                    <Link href="/auth/login" className="sm:hidden">
                      <button className="w-9 h-9 bg-[#f5f4f1] hover:bg-[#ebebea] rounded-xl flex items-center justify-center transition-colors duration-200">
                        <LoginOutlined className="text-[16px] text-[#333]" />
                      </button>
                    </Link>
                  </Flex>
                )}

                {/* Mobile hamburger */}
                <div className="lg:hidden ml-1">
                  <HeaderMenuDrawer isSignedIn={isSignedIn} />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile search - Hidden on Home page fixed search */}
          {router.pathname !== '/' && (
            <div className="lg:hidden pb-3">
              <div
                onClick={() => router.push('/search')}
                className="flex items-center rounded-2xl px-4 py-[10px] bg-[#f5f4f1] transition-all duration-200 cursor-pointer"
              >
                <SearchOutlined
                  className="text-[14px] mr-3 flex-shrink-0 text-[#bbb]"
                />
                <input
                  type="text"
                  placeholder="Nima buyurtma qilamiz?"
                  readOnly
                  className="bg-transparent border-none outline-none w-full text-[13.5px] text-[#111] placeholder-[#bbb] font-[450] cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
        {/* Colorful Ikat Strip */}
        {/* <div className="w-full h-[6px] milliy-ikat-strip" /> */}
      </div>

      <LocationModal open={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} />
    </Layout.Header>
  )
}

export default memo(CHeader)