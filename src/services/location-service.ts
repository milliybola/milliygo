import axios from 'axios'
import { YANDEX_API_KEY } from '@/constants/api-keys'
import request from '@/utils/axios'

export interface YandexAddressOption {
  label: string
  value: string
  coords: [number, number]
}

export interface PopularLocation {
  uuid: string
  name: string
  location_type: string
  location_type_display: string
  address: string
  orientir?: string
  latitude: string
  longitude: string
}

export interface PopularLocationsResponse {
  success: boolean
  data: {
    count: number
    locations: PopularLocation[]
  }
}

export const LocationService = {
  getPopularLocations: async (params?: {
    search?: string
    location_type?: string
    page?: number
  }): Promise<PopularLocationsResponse> => {
    return request({
      url: '/locations/',
      method: 'get',
      params,
    })
  },

  reverseGeocode: async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await axios.get(
        `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_API_KEY}&geocode=${lng},${lat}&format=json&lang=uz_UZ`
      )
      const featureMember = response.data.response.GeoObjectCollection.featureMember[0]
      if (featureMember) {
        const geoObject = featureMember.GeoObject
        const metaData = geoObject.metaDataProperty.GeocoderMetaData
        return metaData.text || geoObject.name + (geoObject.description ? ', ' + geoObject.description : '')
      }
      return 'Noma\'lum manzil'
    } catch (error) {
      console.error('Geocoding error:', error)
      return 'Manzilni aniqlab bo\'lmadi'
    }
  },

  searchAddress: async (query: string): Promise<YandexAddressOption[]> => {
    if (!query || query.length < 3) return []
    try {
      const response = await axios.get(
        `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_API_KEY}&geocode=${encodeURIComponent(query)}&format=json&lang=uz_UZ&results=5`
      )
      const members = response.data.response.GeoObjectCollection.featureMember
      return members.map((m: any) => {
        const coordsStr = m.GeoObject.Point.pos.split(' ')
        return {
          label: m.GeoObject.metaDataProperty.GeocoderMetaData.text,
          value: m.GeoObject.metaDataProperty.GeocoderMetaData.text,
          coords: [parseFloat(coordsStr[1]), parseFloat(coordsStr[0])] as [number, number],
        }
      })
    } catch (error) {
      console.error('Search error:', error)
      return []
    }
  }
}
