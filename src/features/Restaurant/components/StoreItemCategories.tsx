import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import { Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { getStoreItemCategories } from '../api'
import { useCategoryScrollStore } from '../store/categoryScrollStore'

import { ICategory } from '../../Main/types'

const StoreItemCategories = () => {
  const router = useRouter()
  const { slug } = router.query

  // local state yo'q — store dan o'qiymiz
  const { activeCategoryId, triggerScroll } = useCategoryScrollStore()

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['item-base-categories', slug],
    queryFn: () => getStoreItemCategories({ id: slug as string }),
    enabled: !!slug,
  })

  const categoryList: ICategory[] = (categoriesData?.data?.categories || []).filter(
    (cat: ICategory) => cat.is_active !== false
  )

  const handleCategoryClick = (id: number | null) => {
    // triggerScroll: activeCategoryId ni set qiladi + scrollTrigger ni oshiradi
    // StoreItemDetails useEffect scrollTrigger ni ko'rib scroll qiladi
    triggerScroll(id)
  }

  return (
    <div className="z-30 lg:sticky lg:top-24">
      <div className="hidden lg:block">
        <Button
          onClick={() => router.back()}
          className="mb-4 h-11 w-full rounded-xl border-gray-200 text-gray-600 hover:text-gray-900"
          icon={<ArrowLeftOutlined />}
        >
          Orqaga qaytish
        </Button>
      </div>

      {!categoriesLoading && categoryList.length > 0 && (
        <div className="lg:rounded-2xl lg:border lg:border-gray-100 lg:bg-white lg:p-3 lg:shadow-sm">
          <p className="mb-3 hidden px-3 text-[11px] font-bold uppercase tracking-widest text-gray-400 lg:block">
            Kategoriyalar
          </p>

          <style>{`
                        .no-scrollbar::-webkit-scrollbar { display: none; }
                        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                    `}</style>

          <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:px-0 lg:pb-0">
            <button
              onClick={() => handleCategoryClick(null)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-left text-[13px] font-semibold transition-all duration-200 lg:w-full lg:rounded-xl lg:border-none lg:px-3 lg:py-2.5 lg:text-[14px] ${
                activeCategoryId === null
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Hammasi
            </button>

            {categoryList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-left text-[13px] font-semibold transition-all duration-200 lg:w-full lg:rounded-xl lg:border-none lg:px-3 lg:py-2.5 lg:text-[14px] ${
                  activeCategoryId === cat.id
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat.category_details?.name || cat.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default StoreItemCategories
