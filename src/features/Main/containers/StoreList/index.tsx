import { Flex, Typography, Carousel, Button } from 'antd'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useRef } from 'react'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'

import { getRestaurantsList } from '../../api'
import { useRouter } from 'next/router'

const LightningIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#F59E0B" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 2L4.09 12.96C3.74 13.41 4.07 14 4.65 14H11L11 22L19.91 11.04C20.26 10.59 19.93 10 19.35 10H13L13 2Z"
      fill="#F59E0B" />
  </svg>
)

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

import SkeletonCard from '@/components/common/SkeletonCard'

function StoreList() {
  const carouselRef = useRef<any>(null)
  const router = useRouter()

  const { data, isLoading } = useQuery({
    queryKey: ['restaurant-list'],
    queryFn: () => getRestaurantsList({ partner_type: "SHOP" }),
  })

  const restaurants = data?.data?.partners || []
  const chunkedRestaurants = chunkArray(restaurants, 4)

  return (
    <div className="mb-8 flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-end px-4 md:px-0">
        <div>
          <h2 className="section-title">Hamkor do'konlar</h2>
          <p className="section-subtitle">Eng yaqin va sifatli mahsulotlar</p>
        </div>

        <Link href="/store" className="text-[14px] font-bold text-[#00D166] mb-4 hover:underline">
          Hammasi
        </Link>
      </div>

      {/* Mobile Horizontal Scroll vs Desktop Grid */}
      <div className="md:hidden">
        <div className="flex gap-4 overflow-x-auto px-4 pb-4 hide-scrollbar">
          {restaurants.map((val: any, i: number) => {
            const secureImage = val?.banner?.replace('http://', 'https://')
            return (
              <Link
                key={'store-mobile-' + i}
                href={`/store/${val?.uuid}?id=${val?.id}`}
                className="flex flex-col gap-3 shrink-0 w-[240px]"
              >
                <div className="premium-card relative h-[160px] w-full overflow-hidden">
                  {secureImage ? (
                    <img
                      src={secureImage}
                      alt={val?.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200" />
                  )}
                  {/* Delivery time badge on image */}
                  <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                    <LightningIcon />
                    <span className="text-[11px] font-bold text-[#333]">{val?.delivery_time || '20 min'}</span>
                  </div>
                </div>
                <span className="text-[15px] font-extrabold text-[#0c0c0c] px-1">{val?.name}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Carousel for Desktop */}
      <div className="hidden md:block px-4 md:px-0">
        {!isLoading && chunkedRestaurants.length > 0 && (
          <div className="relative group">
            <Carousel ref={carouselRef} dots={false} infinite={false}>
              {chunkedRestaurants.map((group, slideIndex) => (
                <div key={slideIndex}>
                  <div className="grid grid-cols-4 gap-6">
                    {group.map((val: any, i: number) => {
                      const secureImage = val?.banner?.replace('http://', 'https://')
                      return (
                        <Link
                          key={'store-desktop-' + slideIndex + '-' + i}
                          href={`/store/${val?.uuid}?id=${val?.id}`}
                          className="flex flex-col gap-3"
                        >
                          <div className="premium-card relative h-[200px] w-full overflow-hidden group">
                            {secureImage ? (
                              <img
                                src={secureImage}
                                alt={val?.name}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="h-full w-full bg-gray-100" />
                            )}
                          </div>
                          <div className="flex flex-col gap-0.5 px-1">
                            <span className="text-[16px] font-bold text-[#0c0c0c] hover:text-[#00D166] transition-colors">
                              {val?.name}
                            </span>
                            <div className="flex items-center gap-1">
                              <LightningIcon />
                              <span className="text-[13px] text-[#6B7280]">
                                {val?.delivery_time || '15–30 daqiqa'}
                              </span>
                            </div>
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
              className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <LeftOutlined />
            </button>
            <button
              onClick={() => carouselRef.current?.next()}
              className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
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