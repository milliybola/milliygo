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
  const [searchResults, setSearchResults] = useState<{ partners: any[]; products: any[] } | null>(
    null
  )
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const router = useRouter()
  const { locale } = router
  const authContext = useContext(AuthContext)
  const openLogin = authContext?.openLogin
  const { authStore } = (authContext as { authStore: authStore }) || {
    authStore: { isAuthenticated: false },
  }
  const { isAuthenticated } = authStore
  const [dayjsLocale, setDayjsLocale] = useState<string>('uz-latn')
  const searchRef = useRef<HTMLInputElement>(null)

  // Click outside listener for closing desktop search results dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
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
                const addr = firstGeoObject
                  ? (firstGeoObject as any).getAddressLine()
                  : 'Mening joylashuvim'

                setLocation({ lat: latitude, lng: longitude, address: addr })
                setIsInServiceArea(true)
                message.success('Joylashuv aniqlandi')
              } catch (error) {
                console.error('Initial geocoding error:', error)
                setIsLocationModalOpen(true)
              }
            } else {
              message.warning(
                "Siz xizmat ko'rsatish hududidan tashqaridasiz. Iltimos, hududni tanlang."
              )
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
      <div className="relative hidden w-full overflow-hidden border-b border-[#E5E7EB] bg-[#FAF9F6] lg:block">
        <div className="milliy-pattern-bg pointer-events-none absolute inset-0 opacity-[0.06]" />
        <div className="container relative z-10">
          <div className="flex h-[38px] items-center justify-between text-[12px] font-medium text-gray-600">
            {/* Left */}
            <div className="flex items-center gap-6">
              <div className="flex h-[38px] select-none items-center gap-2 text-[13px] font-bold text-[#C5A059]">
                <FireOutlined style={{ fontSize: 14 }} />
                30 daqiqada yetkazib beramiz
              </div>
              <div className="h-3 w-px bg-[#E5E7EB]" />
              <a
                href="tel:+998904969007"
                className="flex items-center gap-2 text-[13px] text-gray-600 transition-all duration-200 hover:text-[#C5A059]"
              >
                <PhoneOutlined style={{ fontSize: 14 }} />
                +998 90 496 90 07
              </a>
              <a
                href="mailto:info@milliyapp.uz"
                className="flex items-center gap-2 text-[13px] text-gray-600 transition-all duration-200 hover:text-[#C5A059]"
              >
                <MailOutlined style={{ fontSize: 14 }} />
                info@milliyapp.uz
              </a>
            </div>

            {/* Right */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3.5">
                <a href="https://t.me/milliygo_app" aria-label="Telegram" className="">
                  <Image
                    src={telegram}
                    alt="Telegram"
                    width={18}
                    height={18}
                    className="object-contain"
                  />
                </a>
                <a href="https://www.instagram.com/milliyapp/" aria-label="Instagram" className="">
                  <Image
                    src={instagram}
                    alt="Instagram"
                    width={18}
                    height={18}
                    className="object-contain"
                  />
                </a>
              </div>
              <div className="h-3 w-px bg-[#E5E7EB]" />
              <button className="group flex items-center gap-2 text-gray-600 transition-all duration-200 hover:text-[#C5A059]">
                <GlobalOutlined style={{ fontSize: 14 }} />
                <span className="text-[13px] font-semibold">O&#39;zbekcha</span>
                <DownOutlined
                  style={{ fontSize: 8 }}
                  className="opacity-50 transition-opacity group-hover:opacity-100"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main NavBar ── */}
      <div
        className={`relative w-full bg-white transition-all duration-300 ${
          scrolled ? 'shadow-[0_1px_24px_rgba(0,0,0,0.07)]' : 'border-b border-[#efefed]'
        }`}
      >
        <div className="container">
          <div className="flex h-[68px] items-center justify-between gap-8">
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link
                href="/"
                className="flex flex-shrink-0 items-center gap-2 transition-opacity duration-200 hover:opacity-70 active:scale-95"
              >
                <Image
                  priority
                  width={34}
                  height={34}
                  src={logo}
                  alt="MilliyGo"
                  className="rounded-lg object-contain shadow-sm"
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
                      className={`mr-3 flex-shrink-0 text-[14px] transition-colors duration-200 ${
                        searchFocused ? 'text-[#111]' : 'text-[#bbb]'
                      }`}
                    />
                  }
                  type="text"
                  placeholder="Restoran yoki taom qidiring..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  className="w-full min-w-[300px] border-[#e5e5e3] bg-transparent py-2 text-[13.5px] font-[450] tracking-[-0.01em] text-[#111] placeholder-[#bbb] outline-none"
                />

                {/* Dropdown Overlay */}
                {searchFocused && searchQuery.trim().length > 0 && (
                  <div className="absolute left-0 top-full z-50 mt-2 flex max-h-[480px] w-[480px] flex-col overflow-hidden overflow-y-auto rounded-2xl border border-gray-100 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
                    {searchQuery.trim().length < 2 ? (
                      <div className="p-4 text-center text-[13px] text-gray-400">
                        Qidirish uchun kamida 2 ta belgi kiriting...
                      </div>
                    ) : isSearching ? (
                      <div className="flex items-center justify-center gap-2 p-8 text-[13.5px] text-gray-400">
                        <LoadingOutlined className="text-blue-500 animate-spin" />
                        Qidirilmoqda...
                      </div>
                    ) : !searchResults ||
                      (searchResults.partners.length === 0 &&
                        searchResults.products.length === 0) ? (
                      <div className="flex flex-col items-center justify-center gap-2 p-8 text-center text-[13.5px] text-gray-400">
                        <SearchOutlined className="text-2xl text-gray-300" />
                        Hech narsa topilmadi
                      </div>
                    ) : (
                      <div className="flex flex-col py-2">
                        {/* Partners Section */}
                        {searchResults.partners.length > 0 && (
                          <div className="flex flex-col">
                            <div className="bg-gray-50/50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                              Tashkilotlar
                            </div>
                            <div className="flex flex-col">
                              {searchResults.partners.map((partner: any) => {
                                const partnerUrl =
                                  partner.partner_type === 'SHOP'
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
                                    className="group flex items-center justify-between px-4 py-3 transition-colors duration-150 hover:bg-gray-50"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl border border-gray-50 bg-gray-100">
                                        <img
                                          src={partner.logo || '/placeholder-logo.png'}
                                          alt={partner.name}
                                          className="h-full w-full object-cover"
                                          onError={(e) => {
                                            ;(e.target as HTMLImageElement).src =
                                              '/placeholder-logo.png'
                                          }}
                                        />
                                      </div>
                                      <div className="flex flex-col leading-tight">
                                        <span className="text-[13.5px] font-bold text-gray-900 transition-colors group-hover:text-[#00D166]">
                                          {partner.name}
                                        </span>
                                        <span className="line-clamp-1 max-w-[240px] text-[11px] text-gray-400">
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
                                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-400">
                                        {partner.partner_type === 'SHOP' ? "Do'kon" : 'Restoran'}
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
                          <div className="mt-2 flex flex-col">
                            <div className="bg-gray-50/50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                              Taomlar va Mahsulotlar
                            </div>
                            <div className="flex flex-col">
                              {searchResults.products.map((product: any) => {
                                const partnerUrl =
                                  product.partner_type === 'SHOP'
                                    ? `/store/${product.partner_uuid}?id=${product.partner_uuid}`
                                    : `/restaurant/${product.partner_uuid}?id=${product.partner_uuid}`
                                const formattedPrice = Number(product.price)
                                  .toLocaleString('uz-UZ')
                                  .replace(/,/g, ' ')
                                return (
                                  <Link
                                    key={product.uuid}
                                    href={partnerUrl}
                                    onClick={() => {
                                      setSearchFocused(false)
                                      setSearchQuery('')
                                    }}
                                    className="group flex items-center justify-between px-4 py-3 transition-colors duration-150 hover:bg-gray-50"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl border border-gray-50 bg-gray-100">
                                        <img
                                          src={product.main_image || '/placeholder-food.png'}
                                          alt={product.name}
                                          className="h-full w-full object-cover"
                                          onError={(e) => {
                                            ;(e.target as HTMLImageElement).src =
                                              '/placeholder-food.png'
                                          }}
                                        />
                                      </div>
                                      <div className="flex flex-col leading-tight">
                                        <span className="text-[13.5px] font-bold text-gray-900 transition-colors group-hover:text-[#00D166]">
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
                                        <span className="text-[10px] font-bold text-green-600">
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
                className="group cursor-pointer items-center gap-2.5 rounded-[16px] border-[#e5e5e3] px-3 py-3 transition-all duration-200 hover:border-[#b2dfdb] hover:bg-[#e0f2f1]/20 md:flex"
              >
                <span className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-[10px] bg-[#e0f2f1]">
                  <EnvironmentOutlined className="text-[13px] text-[#008080]" />
                </span>
                <div className="max-w-[150px] text-left leading-none">
                  <div className="mb-[3px] text-[10px] font-semibold uppercase tracking-[0.05em] text-[#008080]/60">
                    Manzil
                  </div>
                  <div className="truncate text-[13px] font-bold tracking-[-0.01em] text-[#111]">
                    {location?.address || 'Manzilni tanlang'}
                  </div>
                </div>
                <DownOutlined className="text-[8px] text-[#ccc] transition-colors duration-200 group-hover:text-[#008080]" />
              </div>

              {/* Vertical rule */}
              <div className="hidden h-7 w-px bg-[#ebebea] lg:block" />

              {/* Orders */}
              <Button
                onClick={() => router.push('/orders')}
                className="group hidden min-w-[62px] flex-col items-center gap-[5px] rounded-2xl border-none px-3 py-2 transition-colors duration-200 hover:bg-[#f5f4f1] md:flex"
              >
                <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[10px] bg-[#f5f4f1] transition-all duration-200 group-hover:bg-white group-hover:shadow-[0_2px_10px_rgba(0,0,0,0.07)]">
                  <ContainerOutlined className="text-[15px] text-[#666] transition-colors duration-200 group-hover:text-[#111]" />
                </span>
                <span className="whitespace-nowrap text-[10.5px] font-semibold leading-none text-[#999] transition-colors duration-200 group-hover:text-[#333]">
                  Buyurtmalar
                </span>
              </Button>

              {/* Cart */}
              <Button
                onClick={() => router.push('/cart')}
                className="group hidden min-w-[52px] flex-col items-center gap-[5px] rounded-2xl border-none px-3 py-2 transition-colors duration-200 hover:bg-[#f5f4f1] md:flex"
              >
                <span className="relative flex h-[30px] w-[30px] items-center justify-center rounded-[10px] bg-[#f5f4f1] transition-all duration-200 group-hover:bg-white group-hover:shadow-[0_2px_10px_rgba(0,0,0,0.07)]">
                  <ShoppingOutlined className="text-[15px] text-[#666] transition-colors duration-200 group-hover:text-[#111]" />
                </span>
                <span className="text-[10.5px] font-semibold leading-none text-[#999] transition-colors duration-200 group-hover:text-[#333]">
                  Savat
                </span>
              </Button>

              {/* Vertical rule */}
              <div className="hidden h-7 w-px bg-[#ebebea] lg:block" />

              {/* Auth */}
              <div className="flex items-center gap-2">
                {isSignedIn ? (
                  <Flex align="center" gap={6}>
                    <div className="hidden items-center gap-1 sm:flex">
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
                      className="group relative flex items-center gap-2 overflow-hidden rounded-[13px] bg-[#111] px-5 py-[0px] text-[13px] font-semibold tracking-[-0.01em] text-white transition-all duration-200 hover:bg-[#2a2a2a] active:scale-[0.97] active:bg-black"
                    >
                      <span className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/[0.2] to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                      <LoginOutlined className="text-[14px]" />
                      Kirish
                    </Button>

                    <Link href="/auth/login" className="sm:hidden">
                      <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5f4f1] transition-colors duration-200 hover:bg-[#ebebea]">
                        <LoginOutlined className="text-[16px] text-[#333]" />
                      </button>
                    </Link>
                  </Flex>
                )}

                {/* Mobile hamburger */}
                <div className="ml-1 lg:hidden">
                  <HeaderMenuDrawer isSignedIn={isSignedIn} />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile search - Hidden on Home page fixed search */}
          {router.pathname !== '/' && (
            <div className="pb-3 lg:hidden">
              <div
                onClick={() => router.push('/search')}
                className="flex cursor-pointer items-center rounded-2xl bg-[#f5f4f1] px-4 py-[10px] transition-all duration-200"
              >
                <SearchOutlined className="mr-3 flex-shrink-0 text-[14px] text-[#bbb]" />
                <input
                  type="text"
                  placeholder="Nima buyurtma qilamiz?"
                  readOnly
                  className="w-full cursor-pointer border-none bg-transparent text-[13.5px] font-[450] text-[#111] placeholder-[#bbb] outline-none"
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
