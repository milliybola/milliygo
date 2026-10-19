import { message } from 'antd'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { setCookie } from 'cookies-next'
import { useContext, useSyncExternalStore } from 'react'
import { create } from 'zustand'
import { AuthContext } from '@/features/Account/auth/context/authContext'
import { useAuthStore } from '@/features/Account/auth/store/authStore'
import { useLocationStore } from '@/store/useLocationStore'
import { fetchMe } from './api'
import type { UserProfile } from './types'

/** Umumiy UI holati: manzil tanlash oynasi */
export const useUi = create<{ locationOpen: boolean; setLocationOpen: (v: boolean) => void }>(
  (set) => ({
    locationOpen: false,
    setLocationOpen: (locationOpen) => set({ locationOpen }),
  })
)

const noopSubscribe = () => () => undefined

/** Serverda va gidratatsiya paytida false, keyin true (localStorage'ga tayanuvchi UI uchun) */
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  )
}

const STORAGE_EVENT = 'go-storage'

/** localStorage / sessionStorage qiymatini kuzatuvchi hook (gidratatsiyaga xavfsiz) */
export function useStorageValue(key: string, area: 'local' | 'session' = 'local'): string | null {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener('storage', cb)
      window.addEventListener(STORAGE_EVENT, cb)
      return () => {
        window.removeEventListener('storage', cb)
        window.removeEventListener(STORAGE_EVENT, cb)
      }
    },
    () => {
      try {
        return (area === 'local' ? localStorage : sessionStorage).getItem(key)
      } catch {
        return null
      }
    },
    () => null
  )
}

export function writeStorage(
  key: string,
  value: string | null,
  area: 'local' | 'session' = 'local'
) {
  try {
    const st = area === 'local' ? localStorage : sessionStorage
    if (value === null) st.removeItem(key)
    else st.setItem(key, value)
  } catch {
    /* saqlab bo'lmadi */
  }
  window.dispatchEvent(new Event(STORAGE_EVENT))
}

export function useSession() {
  const ctx = useContext(AuthContext)
  const isAuthenticated = !!useAuthStore((s) => s.isAuthenticated)
  const hydrated = useHydrated()
  const authed = hydrated && isAuthenticated
  const me = useQuery<UserProfile | null>({
    queryKey: ['go', 'me'],
    queryFn: fetchMe,
    enabled: authed,
    staleTime: 5 * 60 * 1000,
  })
  return {
    isAuthenticated: authed,
    profile: me.data ?? null,
    loadingProfile: me.isLoading,
    openLogin: () => ctx?.setLoginModalOpen?.(true),
    logOut: () => ctx?.logOut?.(),
  }
}

/** Login javobidan keyin: tokenlarni saqlash, profilni olish, auth store'ni yangilash */
export function useCompleteLogin() {
  const qc = useQueryClient()
  const login = useAuthStore((s) => s.login)
  return async (tokens: { access: string | null; refresh: string | null; user: any }) => {
    if (!tokens.access) throw new Error('Server token qaytarmadi')
    localStorage.setItem('access_token', tokens.access)
    if (tokens.refresh) localStorage.setItem('refresh_token', tokens.refresh)
    let user = tokens.user
    try {
      const me = await fetchMe()
      if (me) user = { ...(user || {}), ...me }
    } catch {
      /* profil keyin yuklanadi */
    }
    const safe = user || {}
    const { user_permissions: _perm, ...short } = safe
    setCookie('userInfo', short)
    login(safe)
    qc.invalidateQueries({ queryKey: ['go'] })
  }
}

export function useUserLocation() {
  const location = useLocationStore((s) => s.location)
  const inArea = useLocationStore((s) => s.isInServiceArea)
  const hydrated = useHydrated()
  const loc = hydrated ? location : null
  return {
    lat: loc?.lat ?? null,
    lng: loc?.lng ?? null,
    address: loc?.address ?? null,
    hasLocation: !!loc,
    inServiceArea: hydrated ? inArea : false,
  }
}

/** Manzil tanlanmagan bo'lsa — savatga qo'shishga yo'l qo'ymaydi: ogohlantiradi va manzil tanlash oynasini ochadi */
export function useRequireLocation() {
  const { hasLocation } = useUserLocation()
  const setOpen = useUi((s) => s.setLocationOpen)
  return () => {
    if (hasLocation) return true
    message.warning('Avval yetkazib berish manzilini tanlang')
    setOpen(true)
    return false
  }
}
