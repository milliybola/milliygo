import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchBanners,
  fetchBaseCategories,
  deleteNotification,
  fetchMenu,
  fetchNotifications,
  fetchOrder,
  fetchOrders,
  fetchPartner,
  fetchPartners,
  fetchPromotions,
  fetchPublicOrder,
  fetchSets,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from './api'
import { useSession } from './session'
import { isOrderActive, sortByNewest } from './status'
import type { PartnerFilters, PartnerType } from './types'

const MIN = 60 * 1000

export const usePartners = (
  partner_type?: PartnerType,
  category?: string,
  filters: PartnerFilters = {}
) =>
  useQuery({
    queryKey: ['go', 'partners', partner_type || 'ALL', category || '', filters],
    queryFn: () => fetchPartners({ partner_type, category: category || undefined, ...filters }),
    staleTime: 2 * MIN,
    // Filtr almashganda ro'yxat yo'qolib qolmasligi uchun avvalgi natija ko'rsatib turiladi
    placeholderData: keepPreviousData,
  })

export const usePartner = (uuid?: string) =>
  useQuery({
    queryKey: ['go', 'partner', uuid],
    queryFn: () => fetchPartner(uuid!),
    enabled: !!uuid,
    staleTime: 2 * MIN,
  })

export const useMenu = (uuid?: string) =>
  useQuery({
    queryKey: ['go', 'menu', uuid],
    queryFn: () => fetchMenu(uuid!),
    enabled: !!uuid,
    staleTime: 2 * MIN,
  })

export const useSets = (uuid?: string) =>
  useQuery({
    queryKey: ['go', 'sets', uuid],
    queryFn: () => fetchSets(uuid!),
    enabled: !!uuid,
    staleTime: 5 * MIN,
  })

export const usePromotions = (uuid?: string) =>
  useQuery({
    queryKey: ['go', 'promotions', uuid],
    queryFn: () => fetchPromotions(uuid!),
    enabled: !!uuid,
    staleTime: 5 * MIN,
  })

export const useBanners = (partner_type?: PartnerType) =>
  useQuery({
    queryKey: ['go', 'banners', partner_type || 'ALL'],
    queryFn: () => fetchBanners(partner_type),
    staleTime: 5 * MIN,
  })

export const useBaseCategories = (partner_type: PartnerType) =>
  useQuery({
    queryKey: ['go', 'base-categories', partner_type],
    queryFn: () => fetchBaseCategories(partner_type),
    staleTime: 10 * MIN,
  })

export function useOrders(opts?: { poll?: boolean }) {
  const { isAuthenticated } = useSession()
  const q = useQuery({
    queryKey: ['go', 'orders'],
    queryFn: fetchOrders,
    enabled: isAuthenticated,
    refetchInterval: opts?.poll ? 30 * 1000 : false,
  })
  const all = sortByNewest(q.data || [])
  return { ...q, orders: all, active: all.filter(isOrderActive), isAuthenticated }
}

/** Ulashilgan havola: kirishsiz kuzatuv. Buyurtma yakunlansa (410) yangilash to'xtaydi. */
export const usePublicOrder = (uuid?: string, enabled = true) =>
  useQuery({
    queryKey: ['go', 'public-order', uuid],
    queryFn: () => fetchPublicOrder(uuid!),
    enabled: !!uuid && enabled,
    retry: 1,
    refetchInterval: (query) => (query.state.data?.state === 'ok' ? 15 * 1000 : false),
  })

export const useOrder = (uuid?: string, poll = true) =>
  useQuery({
    queryKey: ['go', 'order', uuid],
    queryFn: () => fetchOrder(uuid!),
    enabled: !!uuid,
    refetchInterval: poll ? 15 * 1000 : false,
  })

// ── Bildirishnomalar ─────────────────────────────────────────────────────────
const NOTIFICATIONS_KEY = ['go', 'notifications'] as const

/** Qo'ng'iroqcha belgisi: har 60 soniyada va oynaga qaytilganda yangilanadi */
export const useUnreadCount = () => {
  const { isAuthenticated } = useSession()
  return useQuery({
    queryKey: [...NOTIFICATIONS_KEY, 'unread'],
    queryFn: fetchUnreadCount,
    enabled: isAuthenticated,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
    staleTime: 15 * 1000,
  })
}

/** Ro'yxat faqat ochilganda yuklanadi (`enabled`) — belgi uchun alohida yengil so'rov bor */
export const useNotifications = (enabled: boolean) =>
  useQuery({
    queryKey: [...NOTIFICATIONS_KEY, 'list'],
    queryFn: () => fetchNotifications({ limit: 30 }),
    enabled,
    staleTime: 10 * 1000,
  })

export function useNotificationActions() {
  const qc = useQueryClient()
  const refresh = () => qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY })
  const read = useMutation({ mutationFn: markNotificationRead, onSuccess: refresh })
  const readAll = useMutation({ mutationFn: markAllNotificationsRead, onSuccess: refresh })
  const remove = useMutation({ mutationFn: deleteNotification, onSuccess: refresh })
  return { read, readAll, remove, refresh }
}
