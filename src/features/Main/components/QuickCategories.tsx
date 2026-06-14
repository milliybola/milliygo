import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { getBaseCategories } from '../api'
import { ICategory } from '../types'
import { Skeleton } from 'antd'

const QuickCategories = () => {
  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['base-categories-quick'],
    queryFn: () => getBaseCategories({ partner_type: 'RESTAURANT' }),
  })

  const categories: ICategory[] = categoriesData?.data?.categories || []

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto px-4 md:px-0 py-2 hide-scrollbar">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2 shrink-0">
            <Skeleton.Avatar active size={64} shape="circle" />
            <Skeleton.Button active size="small" style={{ width: 40 }} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-5 overflow-x-auto px-4 md:px-0 py-4 hide-scrollbar">
      {categories.map((cat) => {
        // Find first partner logo as a placeholder icon if no category image exists
        const iconSrc = cat?.logo || '/placeholder-icon.png'
        
        return (
          <div key={cat.id} className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer active:scale-95 transition-transform">
            <div className="w-[68px] h-[68px] rounded-2xl overflow-hidden bg-white shadow-sm border border-[#f0f0f0] flex items-center justify-center p-1 group-hover:shadow-md transition-shadow">
               <img 
                 src={iconSrc.replace('http://', 'https://')} 
                 alt={cat.name} 
                 className="w-full h-full object-cover rounded-xl"
               />
            </div>
            <span className="text-[12px] font-bold text-[#333] tracking-tight">{cat.name}</span>
          </div>
        )
      })}
    </div>
  )
}

export default QuickCategories
