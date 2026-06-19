import React from 'react'
import { message } from 'antd'

interface IComingSoonItem {
  id: string
  name: string
  icon: React.ReactNode
  bgColorClass: string
  iconColorClass: string
}

const ServicesSelector = () => {
  const handleServiceClick = (item: IComingSoonItem) => {
    message.info({
      content: `"${item.name}" xizmati tez kunda ishga tushiriladi!`,
      icon: <span className="text-lg">🚀</span>,
      duration: 3,
      style: {
        marginTop: '10vh',
      },
    })
  }

  const services: IComingSoonItem[] = [
    {
      id: 'delivery',
      name: 'Yetkazib berish',
      bgColorClass: 'bg-purple-50/70 border border-purple-100/50 hover:border-purple-200',
      iconColorClass: 'text-purple-500',
      icon: (
        <svg
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
    },
    {
      id: 'cargo',
      name: 'Kargo(yuk)',
      bgColorClass: 'bg-red-50/70 border border-red-100/50 hover:border-red-200',
      iconColorClass: 'text-red-500',
      icon: (
        <svg
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16V6a1 1 0 00-1-1H3a1 1 0 00-1 1v10a1 1 0 001 1h1m10-1h3m3 0a3 3 0 003-3v-3l-3-3h-6m6 6h1m-4-6V5a1 1 0 00-1-1h-2"
          />
        </svg>
      ),
    },
    {
      id: 'taxi',
      name: 'Taxi',
      bgColorClass: 'bg-amber-50/70 border border-amber-100/50 hover:border-amber-200',
      iconColorClass: 'text-amber-500',
      icon: (
        <svg
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 10l2-4h10l2 4M3 10h18v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 14h.01M17 14h.01" />
        </svg>
      ),
    },
    {
      id: 'market',
      name: 'Market',
      bgColorClass: 'bg-cyan-50/70 border border-cyan-100/50 hover:border-cyan-200',
      iconColorClass: 'text-cyan-500',
      icon: (
        <svg
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      id: 'services',
      name: 'Maishiy Xizmatlar',
      bgColorClass: 'bg-blue-50/70 border border-blue-100/50 hover:border-blue-200',
      iconColorClass: 'text-blue-500',
      icon: (
        <svg
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: 'jobs',
      name: "Ish va turli xil e'lonlari",
      bgColorClass: 'bg-slate-50/70 border border-slate-100/50 hover:border-slate-200',
      iconColorClass: 'text-slate-500',
      icon: (
        <svg
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
          />
        </svg>
      ),
    },
  ]

  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-x-2 gap-y-5 px-4 md:grid-cols-6 md:gap-6 md:px-0">
        {services.map((item) => {
          return (
            <div
              key={item.id}
              onClick={() => handleServiceClick(item)}
              className="group flex cursor-pointer flex-col items-center gap-2 transition-transform active:scale-95"
            >
              {/* Icon Container */}
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl p-1.5 shadow-sm transition-all duration-300 md:h-16 md:w-16 ${item.bgColorClass} ${item.iconColorClass}`}
              >
                {item.icon}
              </div>

              {/* Name */}
              <span className="max-w-[80px] text-center text-[11px] font-bold leading-tight text-gray-600 transition-colors group-hover:text-gray-900 md:max-w-none md:text-[12px]">
                {item.name}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ServicesSelector
