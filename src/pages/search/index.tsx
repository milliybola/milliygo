import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { Input, Typography } from 'antd'
import { ArrowLeftOutlined, SearchOutlined, LoadingOutlined, CloseCircleFilled } from '@ant-design/icons'
import request from '@/utils/axios'

const { Title, Text } = Typography

export async function getStaticProps(context: any) {
  let messages = {}
  try {
    if (context && context.locale) {
      messages = (await import(`../../locales/${context.locale}.json`)).default
    } else {
      messages = (await import(`../../locales/uz.json`)).default
    }
  } catch (err) {
    console.warn("Failed to load locales for", context?.locale)
  }
  return { props: { messages } }
}

export default function SearchPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ partners: any[]; products: any[] } | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<any>(null)

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
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
        console.error('Search page error:', error)
        setSearchResults(null)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-[#FAFBFC] pb-12">
      <Head>
        <title>Qidiruv - Milliy Go</title>
        <meta name="description" content="Tashkilotlar va taomlarni qidirish" />
      </Head>

      {/* Top Search Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-700 active:scale-95 transition-all"
        >
          <ArrowLeftOutlined className="text-[16px]" />
        </button>

        <div className="flex-1 relative flex items-center">
          <Input
            ref={inputRef}
            prefix={<SearchOutlined className="text-gray-400 mr-2 text-[15px]" />}
            placeholder="Restoran yoki taom qidiring..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border-gray-100 rounded-2xl py-2 px-3 text-[14px] text-gray-900 placeholder-gray-400 font-medium tracking-tight focus:bg-white focus:border-gray-300 transition-all"
            suffix={
              searchQuery && (
                <CloseCircleFilled
                  className="text-gray-300 hover:text-gray-400 cursor-pointer text-[14px]"
                  onClick={() => setSearchQuery('')}
                />
              )
            }
          />
        </div>
      </div>

      {/* Search Content */}
      <div className="px-4 py-4 max-w-xl mx-auto">
        {searchQuery.trim().length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-[14px] font-medium">
            Tashkilot yoki taom nomini yozing...
          </div>
        ) : searchQuery.trim().length < 2 ? (
          <div className="py-16 text-center text-gray-400 text-[14.5px] font-medium">
            Qidirish uchun kamida 2 ta belgi kiriting...
          </div>
        ) : isSearching ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-gray-400 text-[14.5px]">
            <LoadingOutlined className="text-blue-500 text-2xl animate-spin" />
            <span>Qidirilmoqda...</span>
          </div>
        ) : (!searchResults || (searchResults.partners.length === 0 && searchResults.products.length === 0)) ? (
          <div className="py-16 text-center text-gray-400 text-[14.5px] flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <SearchOutlined className="text-2xl text-gray-300" />
            </div>
            <span className="font-bold text-gray-800">Hech narsa topilmadi</span>
            <span className="text-[13px] text-gray-400 max-w-[200px]">Iltimos, so'rovni to'g'ri kiritganingizni tekshirib ko'ring.</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Partners Section */}
            {searchResults.partners.length > 0 && (
              <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-[0_4px_16px_rgba(0,0,0,0.01)]">
                <Title level={5} className="!m-0 text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
                  Kafe yoki Do'konlar
                </Title>
                <div className="divide-y divide-gray-50">
                  {searchResults.partners.map((partner) => {
                    const partnerUrl = partner.partner_type === 'SHOP'
                      ? `/store/${partner.uuid}?id=${partner.id}`
                      : `/restaurant/${partner.uuid}?id=${partner.id}`
                    return (
                      <Link
                        key={partner.uuid}
                        href={partnerUrl}
                        className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gray-50 overflow-hidden border border-gray-100 flex-shrink-0">
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
                            <span className="text-[14.5px] font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {partner.name}
                            </span>
                            <span className="text-[11.5px] text-gray-400 line-clamp-1 max-w-[220px] mt-0.5">
                              {partner.address}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {partner.rating && (
                            <span className="flex items-center gap-0.5 text-[12px] font-bold text-[#F59E0B]">
                              ★ {partner.rating}
                            </span>
                          )}
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-lg">
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
              <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-[0_4px_16px_rgba(0,0,0,0.01)]">
                <Title level={5} className="!m-0 text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
                  Taomlar va Mahsulotlar
                </Title>
                <div className="divide-y divide-gray-50">
                  {searchResults.products.map((product) => {
                    const partnerUrl = product.partner_type === 'SHOP'
                      ? `/store/${product.partner_uuid}?id=${product.partner_uuid}`
                      : `/restaurant/${product.partner_uuid}?id=${product.partner_uuid}`
                    const formattedPrice = Number(product.price).toLocaleString('uz-UZ').replace(/,/g, ' ')
                    return (
                      <Link
                        key={product.uuid}
                        href={partnerUrl}
                        className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gray-50 overflow-hidden border border-gray-100 flex-shrink-0">
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
                            <span className="text-[14.5px] font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {product.name}
                            </span>
                            <span className="text-[11.5px] text-gray-400 mt-0.5">
                              {product.partner_name} dan
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-[14px] font-black text-gray-900">
                            {formattedPrice} UZS
                          </span>
                          {product.discount > 0 && (
                            <span className="text-[11px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded-md">
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
    </div>
  )
}
