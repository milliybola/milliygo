import { IUploadedFile, TourAgent } from '@/features/FindTours/types'
import { Region } from '@/types'

export interface IRailwayTicket {
  id: number
  name: string
  code: string
}

export interface IContentFile {
  id: number
  is_main: boolean
  file_path: string
}

export interface IBackgroundVideos {
  id: number
  video: string
  is_active: boolean
  preview_image: string
}

export interface ITopDestinationShort {
  id: number
  images: IContentFile[]
  title: string
  status: boolean
  slug: string
}

export interface IPilgrimage {
  id: number
  name: string
  price: string
  price_after_discount: string
  description: string
  average_rating: number | string | null
  tour_agent: TourAgent
  images: IUploadedFile[]
  discount: number
  regions: Region[]
  min_number_people: number
  max_number_people: number
  format_type: string
  title: string
  content: string
}

export interface ITopDestination {
  id: number
  images: IContentFile[]
  title: string
  status: boolean
  slug: string
  description: string
  youtube_url: string
  front_data: any
  district: any
  region: Region
  created_at: string
  updated_at: string
  place_attractions: any[]
}

export interface IInstagramContent {
  id: number
  title: string
  description: string
  url: string
  image: string
  is_active: boolean
}

export interface IExpertAdvice {
  id: number
  slug: string
  title: string
  description: string
  image: string | null
  content: string
  status: boolean
}
export interface ICulturalHeritageSite {
  id: number
  nomi: string
  nomi_uz: string
  nomi_ru: string
  nomi_en: string
  tasnifi_uz: string
  tasnifi_ru: string
  tasnifi_en: string
  manzili: string
  manzili_uz: string
  manzili_ru: string
  manzili_en: string
  tasnifi: string
  ish_vaqti: string
  rasmi: string
  lat: number
  lang: number
  event_id: string
  comment: string
  ball: number
  passporti: string
}
export interface ICulturalHeritageSiteTariffs {
  id: number
  tarifName: string
  eventId: number
  eventName: string
  palaceName: string
  eventSessionId: number
  eventSessionName: string
  price: number
  color: string
}

export interface ILocation {
  id: number
  name: string
  name_uz: string
  name_en: string
  code: number
}

export interface IBusStation {
  id: number
  location_id: number
  name: string
  name_uz: string
  name_en: string
  code: number
}

export interface ILocationList {
  locations: {
    from: ILocation[]
    to: ILocation[]
  }
  stations: {
    from: IBusStation[]
    to: IBusStation[]
  }
  settings: {
    active_days: number
  }
}

export interface IAirportsAll {
  cityCode: string
  cityName: string
  countryName: string
  airports: AirportsType[]
}

type AirportsType = {
  id: number
  code: string
  cityCode: string
  name: string
  timeZone: string
  countryCode: string
  status: boolean
}

export interface ISearchAirport {
  code: string
  id: number
  name: string
  region: number
  region_name: string
}

export interface IEvents {
  id: number
  slug: string
  name: string
  description: string
  date: string
  location: string
  image: string
  organizer: string
}

export interface IPartner {
  id: number
  uuid: string
  name: string
  banner: string
  delivery_time: string
  rating?: string | number
  discount?: string
  free_delivery?: boolean
  description?: string
  address?: string
  logo?: string
  slug?: string
  phone?: string
  email?: string | null
  location_lat?: number
  location_long?: number
  is_open?: boolean
  partner_type?: string
}

export interface IPartnerResponse {
  data: {
    partners: IPartner[]
  }
}

export interface ICategory {
  id: number
  uuid: string
  name: string
  category_type?: string
  description?: string
  logo?: string
  is_active?: boolean
  category_details?: { name: string; logo?: string; uuid?: string }
  partners: IPartner[]
  products?: any[]
}

export interface ICategoryResponse {
  success: boolean
  data: {
    categories: ICategory[]
  }
}

export interface IAdsBanner {
  id: number
  title: string
  description: string
  image: string
  is_active: boolean
  partner_details: IPartner
  start_date: string
  end_date: string
}

export interface IAdsBannerResponse {
  success: boolean
  data: IAdsBanner[]
}
