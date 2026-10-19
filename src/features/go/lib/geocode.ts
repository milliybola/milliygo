/** Koordinata → manzil matni (superapp `getAddressFromCoords` o'rnida): Yandex → OpenStreetMap → zaxira */
export interface AddressText {
  title: string
  subtitle: string
}

async function viaYandex(ymaps: any, lat: number, lng: number): Promise<string | null> {
  if (!ymaps?.geocode) return null
  try {
    const res: any = await ymaps.geocode([lat, lng], { results: 1 })
    return res.geoObjects.get(0)?.getAddressLine?.() || null
  } catch {
    return null
  }
}

async function viaNominatim(lat: number, lng: number): Promise<string | null> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 6000)
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&accept-language=uz`,
      { signal: ctrl.signal }
    )
    if (!res.ok) return null
    const j = await res.json()
    const a = j?.address || {}
    const city = a.city || a.town || a.village || a.suburb || a.county || ''
    const street = [a.road, a.house_number].filter(Boolean).join(' ')
    const title = [city, street].filter(Boolean).join(', ')
    return title || null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export async function reverseGeocode(lat: number, lng: number, ymaps?: any): Promise<string> {
  return (await viaYandex(ymaps, lat, lng)) || (await viaNominatim(lat, lng)) || "Noma'lum joy"
}
