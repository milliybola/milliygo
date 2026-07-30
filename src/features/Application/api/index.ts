import request from '@/utils/axios'

export interface IApplicationInfo {
  id: number
  name: string
  short_description?: string
  description: string
  phone_number: string
  additional_phone_number: string
  short_phone_number: string
  email: string
  address: string
  website: string
  android_application_url: string
  ios_application_url: string
  instagram_url: string
  telegram_url: string
  facebook_url: string
  delivery_time?: string
  rating?: string
  number_of_partner?: number
  privacy_policy?: string
  created_at?: string
  updated_at?: string
}

export interface IApplicationInfoResponse {
  count: number
  next: string | null
  previous: string | null
  results: IApplicationInfo[]
}

export async function getApplicationInfo(): Promise<IApplicationInfoResponse> {
  return request({
    url: '/application/',
    method: 'get',
  })
}
