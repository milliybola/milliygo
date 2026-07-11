import type { IPlatformReview, ListResponse, Placement, Region } from '@/types'
import request from '@/utils/axios'
import requestBack from '@/utils/ruquestBack'
import { QueryFunctionContext } from '@tanstack/react-query'
import {
  IAirportsAll,
  IBackgroundVideos,
  ICulturalHeritageSite,
  IEvents,
  IExpertAdvice,
  IInstagramContent,
  ILocationList,
  IPilgrimage,
  IRailwayTicket,
  ISearchAirport,
  ITopDestination,
  ITopDestinationShort,
  IPartnerResponse,
  ICategoryResponse,
  IAdsBannerResponse,
} from '../types'
import requestTour from '@/utils/tourRequest'

export async function getBaseCategories({
  partner_type,
}: {
  partner_type: string
}): Promise<ICategoryResponse> {
  const res: ICategoryResponse = await request({
    url: '/base-categories/',
    method: 'get',
    params: { partner_type },
  })

  return res
}

export async function getRestaurantsList({
  partner_type,
}: {
  partner_type: string
}): Promise<IPartnerResponse> {
  const res: IPartnerResponse = await request({
    url: '/partner/',
    method: 'get',
    params: { partner_type },
  })

  return res
}

export async function getAdsBanner(): Promise<IAdsBannerResponse> {
  const res: IAdsBannerResponse = await request({
    url: '/promotions/promos/',
    method: 'get',
  })

  return res
}

export async function getRegion(id: number): Promise<Region> {
  const res: Region = await request({
    url: `/regions/regions/${id}/`,
    method: 'get',
  })

  return res
}

export async function getPlacements(params?: any): Promise<ListResponse<Placement[]>> {
  const res: ListResponse<Placement[]> = await request({
    url: '/placements/placements/',
    method: 'get',
    params,
  })

  return res
}

export async function getPlatformReviews(): Promise<ListResponse<IPlatformReview[]>> {
  const res: ListResponse<IPlatformReview[]> = await request({
    url: '/base/platform-review/',
    method: 'get',
  })

  return res
}

export async function getRailwayList(params: {
  search?: string
  is_top?: number
}): Promise<ListResponse<IRailwayTicket[]>> {
  const res: ListResponse<IRailwayTicket[]> = await request({
    url: '/tickets/railway-stations/',
    method: 'get',
    params,
  })

  return res
}

export async function getVideoBackground(): Promise<ListResponse<IBackgroundVideos[]>> {
  const res: ListResponse<IBackgroundVideos[]> = await request({
    url: '/site-content/background_video_main_page/',
    method: 'get',
  })

  return res
}

export async function getBestDestinations(): Promise<ListResponse<ITopDestinationShort[]>> {
  const res: ListResponse<ITopDestinationShort[]> = await request({
    url: '/site-content/top_destinations/',
    method: 'get',
  })

  return res
}

export async function getPilgrimage(): Promise<ListResponse<IPilgrimage[]>> {
  const res: ListResponse<IPilgrimage[]> = await requestTour({
    url: '/tourist/tours/?is_pilgrimage_tourism=true',
    method: 'get',
  })

  return res
}

export async function getCulturalHeritageList(
  params?: Record<string, any>
): Promise<ListResponse<ICulturalHeritageSite[]>> {
  const res: ListResponse<ICulturalHeritageSite[]> = await request({
    url: '/integrations/cultural/heritage/museum/list/',
    method: 'get',
    params,
  })

  return res
}

export async function getExpertAdvice(params?: any): Promise<ListResponse<IExpertAdvice[]>> {
  const res: ListResponse<IExpertAdvice[]> = await request({
    url: '/site-content/expert_advice/',
    method: 'get',
    params,
  })

  return res
}

export async function getLocationsList(): Promise<ILocationList> {
  const res: ILocationList = await request({
    url: '/integrations/autoticket/location/list/',
    method: 'get',
  })

  return res
}

export async function getAirportsList(params?: {
  search?: string
}): Promise<ListResponse<ISearchAirport[]>> {
  const res: ListResponse<ISearchAirport[]> = await request({
    url: '/integrations/centrumair/airports',
    method: 'get',
    params,
  })

  return res
}

export async function getAirportAll(params?: { cityCode?: string }): Promise<IAirportsAll[]> {
  const res: IAirportsAll[] = await requestBack({
    url: '/airline-aggregator/api/airport/all',
    method: 'get',
    params,
  })

  return res
}

export async function getDestination({ slug }: { slug: string }): Promise<ITopDestination> {
  const res: ITopDestination = await request({
    url: `/site-content/top_destinations/${slug}/`,
    method: 'get',
  })

  return res
}

export async function getEvents({
  signal,
}: QueryFunctionContext): Promise<ListResponse<IEvents[]>> {
  const res: ListResponse<IEvents[]> = await request({
    url: '/site-content/events/',
    method: 'get',
    signal,
  })

  return res
}
