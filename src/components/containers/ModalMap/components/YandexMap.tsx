import isDateActive from '@/helpers/is-date-active'
import { formatNumber } from '@/helpers/number-formatter'
import { appFont } from '@/pages/_app'
import useCurrencyStore from '@/store/currency'
import { Placement } from '@/types'
import { Map, Placemark, YMaps } from '@pbe/react-yandex-maps'

import type { FC } from 'react'
import { memo, useEffect, useRef, useState } from 'react'

const YandexMap: FC<{
  hotels: Placement[] | null
  /* eslint-disable-next-line no-unused-vars */
  setSelectedPoint: (e: any) => () => void
  selectedPoint: number | null
  placements: Placement[] | null
  siteDetails?: any
}> = ({ setSelectedPoint, selectedPoint, hotels, placements, siteDetails }) => {
  const mapRef = useRef(undefined)
  const { currency } = useCurrencyStore((state) => state)

  const containerWidth = 1200
  const rightOffset = -9
  const longitudeAdjustment = (containerWidth * 0.0001 * rightOffset) / 100
  const selectedHotel = hotels?.find((hotel) => hotel.id === selectedPoint) as any
  const [showedLocation, setShowedLocation] = useState<number[] | null>(
    siteDetails
      ? [siteDetails?.lat, siteDetails?.lang ? siteDetails?.lang : siteDetails?.long]
      : null
  )

  const defaultLat = hotels?.[0]?.lat ?? 0
  const defaultLong = hotels?.[0]?.long ?? 0

  useEffect(() => {
    if (hotels && hotels.length && selectedHotel && mapRef.current) {
      const adjustedLong = (selectedHotel.long ?? 0) + longitudeAdjustment

      ;(mapRef.current as any).panTo([selectedHotel.lat, adjustedLong])

      setShowedLocation([adjustedLong, selectedHotel.lat])
    }
  }, [selectedPoint, hotels])

  const marks = {
    normal: '/location-map.png',
    active: '/location-map-active.png',
    favorite: '/location-map-liked.png',
    default: '/location-map-default.png',
  }

  return (
    <>
      <YMaps>
        <Map
          instanceRef={mapRef as any}
          width="1200"
          height="100%"
          defaultState={{
            zoom: siteDetails ? 15 : 15,
            center: showedLocation || [defaultLat, defaultLong],
          }}
        >
          {(hotels?.length === 1 ? placements?.filter((val) => val.status === true) : hotels)?.map(
            (val) => {
              const isDiscountActive = isDateActive(
                val?.discount_start_date,
                val?.discount_end_date
              )

              return (
                <Placemark
                  key={val.id}
                  modules={['geoObject.addon.balloon', 'geoObject.addon.hint']}
                  onClick={() => {
                    if (hotels?.length === 1 && selectedPoint !== val.id) {
                      window.open(`${window.location.origin}/hotels/${val?.slug}`, '_blank')
                    } else {
                      setSelectedPoint(val.id)() // Call setSelectedPoint if multiple hotels
                    }
                  }}
                  options={
                    {
                      hintOpenTimeout: 1, //default=150
                      hintCloseTimeout: 1, //default=700
                      hintOffset: [-165, 50],
                      iconLayout: 'default#image',
                      iconImageSize: [48, 48],
                      iconImageOffset: [-24, -48],
                      iconImageHref:
                        selectedPoint === val.id
                          ? marks.active
                          : val.is_favorite
                            ? hotels?.length === 1
                              ? marks.default
                              : marks.favorite
                            : hotels?.length === 1
                              ? marks.default
                              : marks.normal,
                    } as any
                  }
                  properties={{
                    hintContent: [
                      `<div class="flex lex-row items-center ${appFont.className}">`,
                      '<div class="h-[107px] w-[107px]">',
                      `<img alt="${val?.placement_image || val?.image} image" src="${val?.placement_image || val?.image}" class="w-full h-full object-cover"/>`,
                      '</div>',
                      '<div class="flex flex-col p-4 justify-evenly h-[107px]">',
                      `<h5 class="text-base font-semibold m-0 line-clamp-2 w-[191px] leading-[22.4px] whitespace-pre-line">${
                        val?.placement_name || val?.name
                      }</h5>`,

                      `<h5 class="text-[18px] font-bold text-primary notranslate">${
                        isDiscountActive
                          ? formatNumber(val?.min_price - (val?.min_price * val?.discount) / 100)
                          : formatNumber(val?.min_price)
                      } ${currency?.short_name}</h5>`,
                      '</div>',
                      '</div>',
                    ]
                      .toString()
                      .replaceAll(',', ''),
                  }}
                  geometry={[val.lat, val.long]}
                />
              )
            }
          )}
          {selectedHotel?.lat && selectedHotel?.lang
            ? selectedHotel?.lang
            : selectedHotel?.long && (
                <Placemark
                  geometry={[
                    selectedHotel.lat,
                    selectedHotel?.lang ? selectedHotel?.lang : selectedHotel?.long,
                  ]}
                  options={{
                    iconImageHref: marks.normal,
                    iconLayout: 'default#image',
                    iconImageSize: [48, 48],
                    iconImageOffset: [-24, -48],
                  }}
                />
              )}
        </Map>
      </YMaps>
    </>
  )
}

export default memo(YandexMap)
