import { useQuery } from '@tanstack/react-query'
import { getApplicationInfo, IApplicationInfo } from '../api'

// Sahifada bugungacha ishlatilib kelingan qattiq (hardcoded) qiymatlar —
// /application/ endpointi ishlamay qolsa (masalan hozirgi 401 holati),
// sayt ko'rinishi o'zgarmasligi uchun zaxira sifatida ishlatiladi.
export const FALLBACK_APPLICATION_INFO: IApplicationInfo = {
  id: 0,
  name: 'MilliyGo',
  description:
    "MilliyGo — G'allaorolda restoran, kafe va do'konlardan tezkor yetkazib berish xizmati.",
  phone_number: '+998904969007',
  additional_phone_number: '',
  short_phone_number: '',
  email: 'info@milliyapp.uz',
  address: "G'allaorol",
  website: '',
  android_application_url: 'https://play.google.com/store/apps/details?id=uz.milliyapp.milliygo',
  ios_application_url: '',
  instagram_url: 'https://www.instagram.com/milliyapp/',
  telegram_url: 'https://t.me/milliygo_app',
  facebook_url: '',
}

export function useApplicationInfo() {
  const { data, isLoading } = useQuery({
    queryKey: ['application-info'],
    queryFn: getApplicationInfo,
    staleTime: 60 * 60 * 1000,
    retry: 1,
  })

  const info: IApplicationInfo = data?.results?.[0] || FALLBACK_APPLICATION_INFO

  return { info, isLoading }
}
