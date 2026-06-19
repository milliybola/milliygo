import { useRouter } from 'next/router'
import { useContext, useEffect, useState, type FC, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { Accessibility } from 'accessibility'

import CFooter from './CFooter'
import CHeader from './CHeader'
import BottomNavigation from './BottomNavigation'
import { AuthContext } from '@/features/Account/auth/context/authContext'
import { useTelegram } from '@/hooks/useTelegram'

const CLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const t = useTranslations()
  const { pathname } = useRouter()
  const authContext = useContext(AuthContext)
  const [isMobile, setIsMobile] = useState(false)

  const { user: tgUser, initData, isReady, logs, addLog } = useTelegram()
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const authStore = authContext?.authStore
  const isAuthenticated = authStore?.isAuthenticated

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!isReady || isAuthenticated || !authContext?.telegramLogin) return

    if (tgUser && tgUser.id && !isLoggingIn) {
      const handleTelegramAutoLogin = async () => {
        setIsLoggingIn(true)
        addLog(`Login boshlandi: ${tgUser.id}`)

        try {
          // SSR xavfsiz bo'lishi uchun localStorage'ni tekshirib ishlatamiz
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
          }

          await authContext.telegramLogin({
            telegram_id: String(tgUser.id),
            first_name: tgUser.first_name,
            last_name: tgUser.last_name || '',
            username: tgUser.username || '',
            init_data: initData,
            auth_date: Math.floor(Date.now() / 1000),
          })

          addLog('Muvaffaqiyatli kirildi!')
        } catch (err: any) {
          addLog(`KIRISHDA XATO: ${err.message}`)
        } finally {
          setIsLoggingIn(false)
        }
      }

      handleTelegramAutoLogin()
    }
  }, [isReady, tgUser, isAuthenticated, authContext, initData, isLoggingIn])

  // Accessibility
  useEffect(() => {
    if (typeof window === 'undefined') return
    const accessibility = new Accessibility({
      textPixelMode: true,
      labels: {
        menuTitle: t('accessibility.menuTitle'),
        increaseText: t('accessibility.increaseText'),
        decreaseText: t('accessibility.decreaseText'),
        invertColors: t('accessibility.invertColors'),
      },
      icon: {
        img: 'visibility',
        color: '#ffffff',
        backgroundColor: 'rgba(255, 255, 255, 0.33)',
      },
    })
    return () => accessibility?.destroy?.()
  }, [t])

  const noLayoutPages = ['login', 'get-token-my-id', 'register-guide', 'register-contractor']
  const shouldShowLayout = !noLayoutPages.some((page) => pathname.includes(page))

  if (!shouldShowLayout) return <>{children}</>

  return (
    <div className={`flex min-h-screen flex-col bg-white ${isMobile ? 'tma-container' : ''}`}>
      {/* Milliy-Classic Top Strip */}
      <div className="z-[100] h-1.5 w-full bg-[#0052B4] shadow-sm" />

      {!isMobile && <CHeader />}

      <main className={`flex-grow ${isMobile ? 'pb-24' : 'bg-white'}`}>
        <div className="relative">{children}</div>
      </main>

      <CFooter />
      {isMobile && <BottomNavigation />}
    </div>
  )
}

export default CLayout
