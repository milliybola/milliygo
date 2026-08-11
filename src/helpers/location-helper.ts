import { SERVICE_AREA } from '@/constants/location'

/**
 * Checks if a point is inside a polygon using the Ray Casting algorithm.
 * coordinates: [lng, lat][]
 * point: [lng, lat]
 */
export const isPointInPolygon = (point: [number, number], polygon: number[][]) => {
  const x = point[0]
  const y = point[1]
  let inside = false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0]
    const yi = polygon[i][1]
    const xj = polygon[j][0]
    const yj = polygon[j][1]

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }

  return inside
}

/**
 * Checks whether a point falls inside any of the real neighborhoods
 * (mahalla) polygons fetched from /locations/neighborhoods/.
 */
export const isPointInNeighborhoods = (
  lat: number,
  lng: number,
  neighborhoods?: { coordinates?: number[][][] }[] | null
): boolean => {
  if (!neighborhoods || neighborhoods.length === 0) return false

  return neighborhoods.some((n) => {
    const outerRing = n?.coordinates?.[0]
    if (!outerRing || outerRing.length < 3) return false
    return isPointInPolygon([lng, lat], outerRing)
  })
}

export const checkServiceArea = (
  lat: number,
  lng: number,
  neighborhoods?: { coordinates?: number[][][] }[] | null
) => {
  // Haqiqiy mahalla chegaralari yuklangan bo'lsa — shulardan foydalanamiz.
  // Hali yuklanmagan yoki so'rov muvaffaqiyatsiz bo'lsa — eski statik
  // chegaradan (SERVICE_AREA) zaxira sifatida foydalanamiz.
  if (neighborhoods && neighborhoods.length > 0) {
    return isPointInNeighborhoods(lat, lng, neighborhoods)
  }
  return isPointInPolygon([lng, lat], SERVICE_AREA)
}

/**
 * Checks whether a point falls inside any of a partner's delivery zones.
 * Each zone's `coordinates` follows the GeoJSON Polygon shape
 * (rings of [lng, lat] points — first ring is the outer boundary).
 *
 * Partners without any zones configured are treated as deliverable
 * everywhere, rather than hidden — missing zone data is far more likely
 * to be an incomplete backend setup than an intentional "delivers nowhere".
 */
export const isPointInDeliveryZones = (
  lat: number,
  lng: number,
  zones?: { coordinates?: number[][][] }[] | null
): boolean => {
  if (!zones || zones.length === 0) return true

  return zones.some((zone) => {
    const outerRing = zone?.coordinates?.[0]
    if (!outerRing || outerRing.length < 3) return false
    return isPointInPolygon([lng, lat], outerRing)
  })
}
