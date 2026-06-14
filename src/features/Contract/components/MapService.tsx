import { Map, Placemark, YMaps, ZoomControl } from '@pbe/react-yandex-maps'
import { useRouter } from 'next/router'
import type { ReactElement } from 'react'
import { useState } from 'react'

export default function ContractYandexMap({ form }: any): ReactElement {
  const [coordinates, setCoordinates] = useState<[number, number]>()

  const handleClick = (event: { get: (_property: string) => [number, number] }): void => {
    const coords = event.get('coords')
    setCoordinates(coords)
    form.setFieldValue('lat', coords[0])
    form.setFieldValue('long', coords[1])
  }

  const { locale } = useRouter()

  return (
    <YMaps
      query={{
        lang: (locale === 'uz' ? 'uz_UZ' : locale === 'ru' ? 'ru_RU' : 'en_US') as any,
      }}
    >
      <Map
        onClick={handleClick}
        width="100%"
        height="100%"
        defaultState={{ center: coordinates ?? [41.311081, 69.240562], zoom: 12 }}
      >
        <ZoomControl />
        <Placemark geometry={coordinates} />
      </Map>
    </YMaps>
  )
}
