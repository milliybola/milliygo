import { Flex, Typography, Carousel, Button } from 'antd'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useRef } from 'react'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'

import { getRestaurantsList } from '../../api'
import { useRouter } from 'next/router'
import StarIcon from '@/components/icons/star'

const LightningIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M13 2L4.09 12.96C3.74 13.41 4.07 14 4.65 14H11L11 22L19.91 11.04C20.26 10.59 19.93 10 19.35 10H13L13 2Z"
      fill="#F59E0B"
    />
  </svg>
)

const ClockIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const FreeDeliveryIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#A855F7" />
    <path
      d="M8 12l3 3 5-5"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

function getStoreStatus(val: any) {
  if (val?.is_open === false) {
    return { isOpen: false, label: 'Yopiq' }
  }

  const opHours = val?.opening_hours || val?.opening_hour || val?.working_hours || val?.ish_vaqti

  if (opHours && typeof opHours === 'object') {
    const daysMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    const todayIndex = new Date().getDay()
    const currentDayName = daysMap[todayIndex]

    const isDayOpen = opHours[currentDayName] !== false
    const fromHour = opHours.from_hour || opHours.open_time
    const toHour = opHours.to_hour || opHours.close_time

    const formatTime = (t: string) => {
      if (!t) return ''
      const parts = String(t).split(':')
      return parts.slice(0, 2).join(':')
    }
    const timeRange =
      fromHour && toHour ? `${formatTime(fromHour)}-${formatTime(toHour)}` : undefined

    if (!isDayOpen) {
      return { isOpen: false, label: 'Bugun yopiq', timeRange: undefined }
    }

    if (fromHour && toHour) {
      try {
        const now = new Date()
        const currentMinutes = now.getHours() * 60 + now.getMinutes()

        const startParts = String(fromHour).split(':')
        const endParts = String(toHour).split(':')

        if (startParts.length >= 2 && endParts.length >= 2) {
          const startMinutes = parseInt(startParts[0], 10) * 60 + parseInt(startParts[1], 10)
          const endMinutes = parseInt(endParts[0], 10) * 60 + parseInt(endParts[1], 10)

          let isOpen = false
          if (endMinutes < startMinutes) {
            isOpen = currentMinutes >= startMinutes || currentMinutes <= endMinutes
          } else {
            isOpen = currentMinutes >= startMinutes && currentMinutes <= endMinutes
          }

          if (!isOpen) {
            return { isOpen: false, label: 'Yopiq', timeRange }
          }
          return { isOpen: true, label: 'Ochiq', timeRange }
        }
      } catch (e) {
        // ignore parsing errors
      }
    }
  }

  let startStr = ''
  let endStr = ''
  let originalStr = typeof opHours === 'string' ? opHours : ''

  const openTime = val?.open_time || val?.opening_time
  const closeTime = val?.close_time || val?.closing_time

  if (openTime && closeTime) {
    startStr = String(openTime).trim()
    endStr = String(closeTime).trim()
  } else if (originalStr) {
    const parts = originalStr.split(/[-–—]/)
    if (parts.length === 2) {
      startStr = parts[0].trim()
      endStr = parts[1].trim()
    }
  }

  if (startStr && endStr) {
    try {
      const now = new Date()
      const currentMinutes = now.getHours() * 60 + now.getMinutes()

      const startParts = startStr.split(':')
      const endParts = endStr.split(':')

      if (startParts.length >= 2 && endParts.length >= 2) {
        const startMinutes = parseInt(startParts[0], 10) * 60 + parseInt(startParts[1], 10)
        const endMinutes = parseInt(endParts[0], 10) * 60 + parseInt(endParts[1], 10)

        let isOpen = false
        if (endMinutes < startMinutes) {
          isOpen = currentMinutes >= startMinutes || currentMinutes <= endMinutes
        } else {
          isOpen = currentMinutes >= startMinutes && currentMinutes <= endMinutes
        }

        if (!isOpen) {
          return { isOpen: false, label: 'Yopiq', timeRange: `${startStr}-${endStr}` }
        }
        return { isOpen: true, label: 'Ochiq', timeRange: `${startStr}-${endStr}` }
      }
    } catch (e) {
      // ignore
    }
  }

  const isOpen = val?.is_open !== false
  return { isOpen, label: isOpen ? 'Ochiq' : 'Yopiq' }
}

import SkeletonCard from '@/components/common/SkeletonCard'

function StoreList() {
  const carouselRef = useRef<any>(null)
  const router = useRouter()

  const { data, isLoading } = useQuery({
    queryKey: ['restaurant-list'],
    queryFn: () => getRestaurantsList({ partner_type: 'SHOP' }),
  })

  const restaurants = data?.data?.partners || []
  const chunkedRestaurants = chunkArray(restaurants, 4)

  return (
    <div className="mb-8 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-end justify-between px-4 md:px-0">
        <div>
          <h2 className="section-title">Hamkor do'konlar</h2>
          <p className="section-subtitle">Eng yaqin va sifatli mahsulotlar</p>
        </div>

        <Link href="/store" className="mb-4 text-[14px] font-bold text-[#00D166] hover:underline">
          Hammasi
        </Link>
      </div>

      {/* Mobile Horizontal Scroll vs Desktop Grid */}
      <div className="md:hidden">
        <div className="hide-scrollbar flex gap-4 overflow-x-auto px-4 pb-4">
          {restaurants.map((val: any, i: number) => {
            const secureImage = val?.banner?.replace('http://', 'https://')
            const status = getStoreStatus(val)

            return (
              <Link
                key={'store-mobile-' + i}
                href={`/store/${val?.uuid}?id=${val?.id}`}
                className="flex w-[240px] shrink-0 flex-col gap-3"
              >
                <div className="premium-card relative h-[160px] w-full overflow-hidden">
                  {secureImage ? (
                    <img
                      src={secureImage}
                      alt={val?.name}
                      className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                        !status.isOpen ? 'contrast-[85%] grayscale-[50%]' : ''
                      }`}
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200" />
                  )}

                  {/* Closed overlay */}
                  {!status.isOpen && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1.5px]">
                      <span className="rounded-full bg-[#EF4444] px-3 py-1 text-[12px] font-extrabold uppercase tracking-wider text-white shadow-lg">
                        Hozir yopiq
                      </span>
                      {status.timeRange && (
                        <span className="mt-1 text-[10px] font-medium text-white/90">
                          Ish vaqti: {status.timeRange}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Delivery & Rating badge on image */}
                  <div className="absolute bottom-2 left-2 z-20 flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1 shadow-sm backdrop-blur-sm">
                    <LightningIcon />
                    <span className="text-[11px] font-bold text-[#333]">
                      {val?.delivery_time || '20 min'}
                    </span>
                    {val?.rating && (
                      <>
                        <span className="h-3 w-px bg-gray-300" />
                        <StarIcon style={{ fontSize: 10, color: '#F59E0B' }} />
                        <span className="text-[11px] font-extrabold text-[#333]">{val.rating}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1 px-1">
                  <span className="line-clamp-1 text-[15px] font-extrabold text-[#0c0c0c]">
                    {val?.name}
                  </span>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {status.timeRange && (
                      <span className="flex items-center gap-0.5 text-[12px] text-[#6B7280]">
                        <ClockIcon />
                        {status.timeRange}
                      </span>
                    )}
                    {!status.isOpen && (
                      <span className="text-[12px] font-bold text-[#EF4444]">
                        {status.label || 'Yopiq'}
                      </span>
                    )}
                  </div>

                  {(val?.discount || val?.free_delivery) && (
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                      {val?.discount && (
                        <span className="rounded-[6px] bg-[#DCFCE7] px-2 py-0.5 text-[10px] font-bold text-[#15803D]">
                          {val.discount}
                        </span>
                      )}
                      {val?.free_delivery && (
                        <span className="flex items-center gap-1 rounded-full bg-[#F3E8FF] px-2 py-0.5 text-[10px] font-bold text-[#7C3AED]">
                          <FreeDeliveryIcon />
                          Bepul
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Carousel for Desktop */}
      <div className="hidden px-4 md:block md:px-0">
        {!isLoading && chunkedRestaurants.length > 0 && (
          <div className="group relative">
            <Carousel ref={carouselRef} dots={false} infinite={false}>
              {chunkedRestaurants.map((group, slideIndex) => (
                <div key={slideIndex}>
                  <div className="grid grid-cols-4 gap-6">
                    {group.map((val: any, i: number) => {
                      const secureImage = val?.banner?.replace('http://', 'https://')
                      const status = getStoreStatus(val)

                      return (
                        <Link
                          key={'store-desktop-' + slideIndex + '-' + i}
                          href={`/store/${val?.uuid}?id=${val?.id}`}
                          className="group flex flex-col gap-3"
                        >
                          <div className="premium-card group relative h-[200px] w-full overflow-hidden">
                            {secureImage ? (
                              <img
                                src={secureImage}
                                alt={val?.name}
                                className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                                  !status.isOpen ? 'contrast-[85%] grayscale-[50%]' : ''
                                }`}
                              />
                            ) : (
                              <div className="h-full w-full bg-gray-100" />
                            )}

                            {/* Closed overlay */}
                            {!status.isOpen && (
                              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1.5px]">
                                <span className="rounded-full bg-[#EF4444] px-3.5 py-1.5 text-[13px] font-extrabold uppercase tracking-wider text-white shadow-lg">
                                  Hozir yopiq
                                </span>
                                {status.timeRange && (
                                  <span className="mt-1 text-[11px] font-medium text-white/90">
                                    Ish vaqti: {status.timeRange}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-0.5 px-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="line-clamp-1 text-[16px] font-bold text-[#0c0c0c] transition-colors hover:text-[#00D166]">
                                {val?.name}
                              </span>
                              {val?.rating && (
                                <span className="flex shrink-0 items-center gap-1 text-[13px] font-bold text-[#0c0c0c]">
                                  <StarIcon style={{ color: '#F59E0B' }} />
                                  {val.rating}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5">
                              <LightningIcon />
                              <span className="text-[13px] text-[#6B7280]">
                                {val?.delivery_time || '15–30 daqiqa'}
                              </span>
                              {status.timeRange && (
                                <>
                                  <span className="text-[#D1D5DB]">•</span>
                                  <span className="flex items-center gap-0.5 text-[12px] text-[#6B7280]">
                                    <ClockIcon />
                                    {status.timeRange}
                                  </span>
                                </>
                              )}
                              {!status.isOpen && (
                                <>
                                  <span className="text-[#D1D5DB]">•</span>
                                  <span className="text-[12px] font-bold text-[#EF4444]">
                                    {status.label || 'Yopiq'}
                                  </span>
                                </>
                              )}
                            </div>

                            {(val?.discount || val?.free_delivery) && (
                              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                {val?.discount && (
                                  <span className="rounded-[6px] bg-[#DCFCE7] px-2 py-0.5 text-[11px] font-bold text-[#15803D]">
                                    {val.discount}
                                  </span>
                                )}
                                {val?.free_delivery && (
                                  <span className="flex items-center gap-1 rounded-full bg-[#F3E8FF] px-2.5 py-0.5 text-[11px] font-bold text-[#7C3AED]">
                                    <FreeDeliveryIcon />
                                    Bepul yetkazish
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </Carousel>

            <button
              onClick={() => carouselRef.current?.prev()}
              className="absolute -left-5 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
            >
              <LeftOutlined />
            </button>
            <button
              onClick={() => carouselRef.current?.next()}
              className="absolute -right-5 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
            >
              <RightOutlined />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default StoreList
