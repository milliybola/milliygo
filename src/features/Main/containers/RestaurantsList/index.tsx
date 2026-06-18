import { Flex, Typography } from 'antd'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { getBaseCategories } from '../../api'
import { ICategory, IPartner } from '../../types'

const StarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

const RiderIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#6B7280"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="5.5" cy="17.5" r="2.5" />
    <circle cx="18.5" cy="17.5" r="2.5" />
    <path d="M8 17.5h7" />
    <path d="M15 6h2l2 5" />
    <path d="M9 6l1.5 5H19" />
    <path d="M5.5 15l2-6h5" />
  </svg>
)

const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill={filled ? '#ef4444' : 'none'}
    stroke={filled ? '#ef4444' : '#9CA3AF'}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const FilterIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="11" y1="18" x2="13" y2="18" />
  </svg>
)

const ChevronDown = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
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

function RestaurantsList() {
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set())

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['base-categories'],
    queryFn: () => getBaseCategories({ partner_type: 'RESTAURANT' }),
  })

  const categoryList: ICategory[] = categoriesData?.data?.categories || []

  const filteredRestaurants: IPartner[] = activeCategory
    ? categoryList.find((c: ICategory) => c.id === activeCategory)?.partners || []
    : Array.from(
        new Map(
          categoryList.flatMap((c: ICategory) => c.partners || []).map((r: IPartner) => [r.id, r])
        ).values()
      )

  const toggleLike = (e: React.MouseEvent, id: number) => {
    e.preventDefault()
    e.stopPropagation()
    setLikedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="mb-10 flex flex-col gap-6">
      {/* Title */}
      <div className="px-4 md:px-0">
        <h2 className="section-title">Saralangan restoranlar</h2>
        <p className="section-subtitle">Eng mazali taomlar faqat bizda</p>
      </div>

      {/* Category filter bar */}
      {!categoriesLoading && categoryList.length > 0 && (
        <div className="px-4 md:px-0">
          <div className="cat-scroll hide-scrollbar flex items-center gap-3 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveCategory(null)}
              className={`whitespace-nowrap rounded-xl border px-4 py-2 text-[14px] font-bold transition-all duration-200 ${
                activeCategory === null
                  ? 'border-[#0c0c0c] bg-[#0c0c0c] text-white shadow-md'
                  : 'border-[#E5E7EB] bg-white text-[#374151]'
              }`}
            >
              Hammasi
            </button>

            {categoryList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                className={`whitespace-nowrap rounded-xl border px-4 py-2 text-[14px] font-bold transition-all duration-200 ${
                  activeCategory === cat.id
                    ? 'border-[#0c0c0c] bg-[#0c0c0c] text-white shadow-md'
                    : 'border-[#E5E7EB] bg-white text-[#374151]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {categoriesLoading ? (
        <div className="grid grid-cols-2 gap-4 px-4 sm:grid-cols-2 md:px-0 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredRestaurants.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F3F4F6]">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <line x1="4" y1="4" x2="20" y2="20" stroke="#9CA3AF" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[17px] font-bold text-[#0c0c0c]">
              Bu kategoriyada restoranlar topilmadi
            </span>
            <span className="text-[14px] text-[#6B7280]">
              Boshqa kategoriyani tanlang yoki filtrni olib tashlang
            </span>
          </div>
          <button
            onClick={() => setActiveCategory(null)}
            className="mt-1 rounded-[12px] bg-[#0c0c0c] px-6 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#00D166]"
          >
            Hammasini ko'rish
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-7 px-4 sm:grid-cols-2 md:px-0 lg:grid-cols-3">
          {!categoriesLoading &&
            filteredRestaurants.map((val: IPartner, i: number) => {
              const secureImage = val?.banner?.replace('http://', 'https://')
              const isLiked = likedIds.has(val?.id ?? i)
              const status = getStoreStatus(val)

              return (
                <Link
                  key={'restaurant-item-' + i}
                  href={`/restaurant/${val?.uuid}?id=${val?.id}`}
                  className="group flex flex-col gap-3"
                >
                  {/* Image */}
                  <div className="relative h-[185px] w-full overflow-hidden rounded-[16px] bg-[#F3F4F6]">
                    {secureImage && (
                      <img
                        src={secureImage}
                        alt={val?.name || 'Restaurant'}
                        className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                          !status.isOpen ? 'contrast-[85%] grayscale-[50%]' : ''
                        }`}
                      />
                    )}
                    <button
                      onClick={(e) => toggleLike(e, val?.id ?? i)}
                      className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-transform hover:scale-110"
                    >
                      <HeartIcon filled={isLiked} />
                    </button>

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

                  {/* Info */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="line-clamp-1 text-[15px] font-bold text-[#0c0c0c] transition-colors group-hover:text-[#00D166]">
                        {val?.name}
                      </span>
                      {val?.rating && (
                        <span className="flex shrink-0 items-center gap-1 text-[13px] font-semibold text-[#0c0c0c]">
                          <StarIcon />
                          {val.rating}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <RiderIcon />
                      <span className="text-[13px] text-[#6B7280]">
                        {val?.delivery_time || '15–25 daqiqa'}
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
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
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
      )}
    </div>
  )
}

export default RestaurantsList
