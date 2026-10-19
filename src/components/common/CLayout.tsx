import { useRouter } from 'next/router'
import { useContext, useEffect, useRef, type FC, type ReactNode } from 'react'

import { AuthContext } from '@/features/Account/auth/context/authContext'
import BottomNav from '@/features/go/layout/BottomNav'
import GoFooter from '@/features/go/layout/GoFooter'
import GoHeader from '@/features/go/layout/GoHeader'
import { useTelegram } from '@/hooks/useTelegram'

const NO_LAYOUT = ['login', 'get-token-my-id', 'register-guide', 'register-contractor']

/** Pastki menyu ko'rinmaydigan sahifalar — ularda o'z sticky harakat paneli bor */
function hidesBottomNav(pathname: string, hasId: boolean) {
  if (
    pathname === '/' ||
    pathname === '/orders' ||
    pathname === '/orders/' ||
    pathname.startsWith('/profile')
  )
    return true
  if (pathname.startsWith('/restaurant/') || pathname === '/restaurant') return true
  if (pathname === '/store' && hasId) return true
  if (pathname.startsWith('/store/')) return true
  return ['/orders/track'].some((p) => pathname === p || pathname.startsWith(p + '/'))
}

const CLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const { pathname, query } = useRouter()
  const authContext = useContext(AuthContext)
  const { user: tgUser, initData, isReady } = useTelegram()
  const loggingIn = useRef(false)
  const isAuthenticated = authContext?.authStore?.isAuthenticated

  // Telegram Mini App ichida — avtomatik kirish
  useEffect(() => {
    if (
      !isReady ||
      isAuthenticated ||
      !authContext?.telegramLogin ||
      !tgUser?.id ||
      loggingIn.current
    )
      return
    loggingIn.current = true
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    Promise.resolve(
      authContext.telegramLogin({
        telegram_id: String(tgUser.id),
        first_name: tgUser.first_name,
        last_name: tgUser.last_name || '',
        username: tgUser.username || '',
        init_data: initData,
        auth_date: Math.floor(Date.now() / 1000),
      })
    )
      .catch(() => undefined)
      .finally(() => {
        loggingIn.current = false
      })
  }, [isReady, tgUser, isAuthenticated, authContext, initData])

  if (NO_LAYOUT.some((p) => pathname.includes(p))) return <>{children}</>

  const hideBottom = hidesBottomNav(pathname, !!query.id)
  // Restoran sahifasida telefon/planshetda superapp'dagidek o'z yuqori paneli bor (umumiy sarlavha yashiriladi)
  const isDetail =
    pathname === '/restaurant' ||
    pathname.startsWith('/restaurant/') ||
    // Taomlar / Do'konlar ro'yxati ham o'z (superapp) sarlavhasiga ega
    pathname === '/cart' ||
    pathname === '/profile' ||
    pathname === '/profile/edit' ||
    pathname === '/profile/' ||
    pathname === '/orders' ||
    pathname === '/orders/' ||
    pathname === '/checkout' ||
    pathname === '/orders/track' ||
    pathname === '/restaurants' ||
    pathname === '/restaurants/' ||
    // Do'konlar ro'yxati va do'kon sahifasi (o'z tepa paneli bor)
    pathname === '/store' ||
    pathname.startsWith('/store/')

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <GoHeader hideOnMobile={isDetail} />
      <main
        className={
          pathname === '/' ||
          pathname === '/orders' ||
          pathname === '/orders/' ||
          pathname.startsWith('/profile')
            ? 'flex-grow pb-4 lg:pb-0'
            : hideBottom
              ? 'flex-grow pb-28 lg:pb-0'
              : 'flex-grow pb-24 lg:pb-0'
        }
      >
        {children}
      </main>
      <GoFooter />
      {!hideBottom && <BottomNav />}
    </div>
  )
}

export default CLayout
