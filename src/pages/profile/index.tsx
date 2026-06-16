import React, { useContext } from 'react'
import { useTranslations } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import { getAccountMe } from '@/features/Account/api'
import { AuthContext } from '@/features/Account/auth/context/authContext'
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HistoryOutlined,
  EnvironmentOutlined,
  GiftOutlined,
  QuestionCircleOutlined,
  LogoutOutlined,
  RightOutlined,
  VerifiedOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import { Skeleton, Avatar, Button, Modal } from 'antd'
import { useRouter } from 'next/router'
import { useTelegram } from '@/hooks/useTelegram'

export async function getStaticProps(context: any) {
  let messages = {}
  try {
    if (context && context.locale) {
      messages = (await import(`../../locales/${context.locale}.json`)).default
    } else {
      messages = (await import(`../../locales/uz.json`)).default
    }
  } catch (err) {
    console.warn('Failed to load locales for', context?.locale)
  }
  return { props: { messages } }
}

const ProfilePage = () => {
  const t = useTranslations()
  const router = useRouter()
  const { user: tgUser } = useTelegram()
  const authContext = useContext(AuthContext)
  const logOut = authContext?.logOut

  const { data: userData, isLoading } = useQuery({
    queryKey: ['account-me'],
    queryFn: getAccountMe,
  })

  const user = userData as any

  const menuItems = [
    { icon: <HistoryOutlined />, label: 'Mening buyurtmalarim', link: '/orders' },
    { icon: <EnvironmentOutlined />, label: 'Manzillarim', link: '#' },
    { icon: <GiftOutlined />, label: 'Promokodlar', link: '#' },
    { icon: <QuestionCircleOutlined />, label: 'Yordam markazi', link: '#' },
  ]

  const handleLogout = () => {
    Modal.confirm({
      title: 'Chiqish',
      content: 'Haqiqatan ham hisobingizdan chiqmoqchimisiz?',
      okText: 'Ha, chiqaman',
      cancelText: 'Bekor qilish',
      okButtonProps: { danger: true },
      onOk: () => {
        logOut?.()
        router.push('/')
      },
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] px-4 py-8">
        <div className="mx-auto max-w-xl space-y-6">
          <div className="flex flex-col items-center gap-4 rounded-[32px] border border-gray-50 bg-white p-6 shadow-sm">
            <Skeleton.Avatar active size={100} shape="circle" />
            <Skeleton.Input active size="large" />
          </div>
          <div className="space-y-4 rounded-[24px] bg-white p-4 shadow-sm">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} active paragraph={{ rows: 1 }} avatar />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-24">
      <div className="animate-fade-up mx-auto max-w-xl px-4 pt-6">
        {/* Header Information Card */}
        <div className="relative mb-6 flex flex-col items-center overflow-hidden rounded-[32px] border border-white bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
          {/* Background Decorative Element */}
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#FFD600]/10 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-[#00D166]/5 blur-2xl" />

          <div className="relative mb-4">
            <Avatar
              src={user?.avatar}
              size={100}
              icon={<UserOutlined />}
              className="border-4 border-white bg-gray-100 shadow-xl"
            />
            {user?.is_verified && (
              <div className="absolute bottom-1 right-1 flex items-center justify-center rounded-full border-2 border-white bg-[#00D166] p-1 text-white">
                <VerifiedOutlined className="text-[12px]" />
              </div>
            )}
          </div>

          <h1 className="mb-1 text-[22px] font-black text-[#111]">
            {user?.full_name || 'Foydalanuvchi'}
          </h1>
          <p className="text-[14px] font-medium text-gray-400">{user?.phone_number}</p>

          <div className="mt-4 flex gap-4">
            <div className="flex flex-col items-center rounded-2xl bg-gray-50 px-4 py-2">
              <span className="text-[12px] text-gray-400">Status</span>
              <span className="text-[14px] font-bold capitalize text-[#00D166]">
                {user?.status === 'active' ? 'Faol' : 'Nofaol'}
              </span>
            </div>
            <div className="flex flex-col items-center rounded-2xl bg-gray-50 px-4 py-2">
              <span className="text-[12px] text-gray-400">Status</span>
              <span className="text-[14px] font-bold capitalize text-gray-900">
                Eng yaxshi xaridor
              </span>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="mb-6 rounded-[28px] border border-gray-50 bg-white p-2 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="mb-1 border-b border-gray-50 px-4 py-3">
            <span className="text-[13px] font-extrabold uppercase tracking-widest text-gray-400">
              Ma'lumotlar
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-4 px-4 py-3 transition-colors active:bg-gray-50">
              <div className="bg-blue-50 text-blue-500 flex h-10 w-10 items-center justify-center rounded-xl">
                <MailOutlined className="text-lg" />
              </div>
              <div className="flex flex-1 flex-col">
                <span className="text-[12px] text-gray-400">Elektron pochta</span>
                <span className="text-[14px] font-bold text-gray-900">
                  {user?.email || 'Biriktirilmagan'}
                </span>
              </div>
            </div>

            {tgUser && (
              <div className="flex items-center gap-4 px-4 py-3 transition-colors active:bg-gray-50">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                  <UserOutlined className="text-lg" />
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="text-[12px] text-gray-400">Telegram ID</span>
                  <span className="text-[14px] font-bold text-gray-900">{tgUser.id}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 px-4 py-3 transition-colors active:bg-gray-50">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-500">
                <CalendarOutlined className="text-lg" />
              </div>
              <div className="flex flex-1 flex-col">
                <span className="text-[12px] text-gray-400">Ro'yxatdan o'tilgan sana</span>
                <span className="text-[14px] font-bold text-gray-900">{user?.date_joined}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="mb-6 rounded-[28px] border border-gray-50 bg-white p-2 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="mb-1 border-b border-gray-50 px-4 py-3">
            <span className="text-[13px] font-extrabold uppercase tracking-widest text-gray-400">
              Sozlamalar
            </span>
          </div>
          <div className="space-y-1">
            {menuItems.map((item, idx) => (
              <div
                key={idx}
                onClick={() => router.push(item.link)}
                className="group flex cursor-pointer items-center gap-4 rounded-[20px] px-4 py-3 transition-all hover:bg-[#F8F9FA] active:scale-[0.99]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-500 transition-colors group-hover:bg-[#FFD600] group-hover:text-black">
                  {item.icon}
                </div>
                <span className="flex-1 text-[15px] font-bold text-gray-800">{item.label}</span>
                <RightOutlined className="text-gray-300 group-hover:text-gray-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-red-50 bg-white font-extrabold text-red-500 shadow-sm transition-all active:scale-[0.98] active:bg-red-50"
        >
          <LogoutOutlined />
          HISOBDAN CHIQISH
        </button>
      </div>
    </main>
  )
}

export default ProfilePage
