import { useQuery } from '@tanstack/react-query'
import {
  fetchBanners,
  fetchBaseCategories,
  fetchMenu,
  fetchOrder,
  fetchOrders,
  fetchPartner,
  fetchPartners,
  fetchPromotions,
  fetchSets,
} from './api'
import { useSession } from './session'
import { isOrderActive, sortByNewest } from './status'
import type { PartnerType } from './types'

const MIN = 60 * 1000

export const usePartners = (partner_type?: PartnerType, category?: string) =>
  useQuery({
    queryKey: ['go', 'partners', partner_type || 'ALL', category || ''],
    queryFn: () => fetchPartners({ partner_type, category: category || undefined }),
    staleTime: 2 * MIN,
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

export const useOrder = (uuid?: string, poll = true) =>
  useQuery({
    queryKey: ['go', 'order', uuid],
    queryFn: () => fetchOrder(uuid!),
    enabled: !!uuid,
    refetchInterval: poll ? 15 * 1000 : false,
  })
