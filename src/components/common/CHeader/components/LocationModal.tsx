import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Modal, Button, Typography, message, Space, Input } from 'antd'
import {
  YMaps,
  Map,
  Placemark,
  Polygon,
  ZoomControl,
  GeolocationControl,
  useYMaps,
} from '@pbe/react-yandex-maps'
import {
  EnvironmentOutlined,
  CloseCircleOutlined,
  HomeOutlined,
  BookOutlined,
  ShopOutlined,
  BankOutlined,
  CompassOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { SERVICE_AREA, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/constants/location'
import { checkServiceArea } from '@/helpers/location-helper'
import { useLocationStore } from '@/store/useLocationStore'
import { LocationService, YandexAddressOption, PopularLocation } from '@/services/location-service'
import { YANDEX_API_KEY } from '@/constants/api-keys'

interface LocationModalProps {
  open: boolean
  onClose: () => void
}

const TASHKENT_BOUNDS: [[number, number], [number, number]] = [
  [41.1, 69.1],
  [41.5, 69.5],
]

const LocationModalContent: React.FC<LocationModalProps> = ({ open, onClose }) => {
  const { location, setLocation, setIsInServiceArea } = useLocationStore()
  const ymaps = useYMaps(['geocode'])

  const [tempCoords, setTempCoords] = useState<[number, number]>(
    location ? [location.lat, location.lng] : (DEFAULT_MAP_CENTER as [number, number])
  )
  const [address, setAddress] = useState<string>(location?.address || '')
  const [isValid, setIsValid] = useState<boolean>(
    location ? checkServiceArea(location.lat, location.lng) : false
  )
  const [loading, setLoading] = useState<boolean>(false)
  const [options, setOptions] = useState<YandexAddressOption[]>([])
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [showPopularList, setShowPopularList] = useState<boolean>(false)

  // State for popular locations
  const [popularLocations, setPopularLocations] = useState<PopularLocation[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [fetchingPopular, setFetchingPopular] = useState<boolean>(false)

  const geocodeCoords = async (lat: number, lng: number): Promise<string> => {
    if (!ymaps) return 'Yuklanmoqda...'
    try {
      const result = await ymaps.geocode([lat, lng], { results: 1 })
      const firstGeoObject = result.geoObjects.get(0)
      const addressLine = firstGeoObject ? (firstGeoObject as any).getAddressLine() : ''

      if (!addressLine || addressLine === "Noma'lum manzil") {
        return "G'allaorol"
      }
      return addressLine
    } catch (error) {
      console.error('Geocoding error:', error)
      return "G'allaorol"
    }
  }

  const fetchPopularLocations = async (search?: string) => {
    setFetchingPopular(true)
    try {
      const res = await LocationService.getPopularLocations({ search })
      if (res.success && res.data?.locations) {
        setPopularLocations(res.data.locations)
      }
    } catch (error) {
      console.error('Error fetching popular locations:', error)
    } finally {
      setFetchingPopular(false)
    }
  }

  const onSearch = async (searchText: string) => {
    if (!ymaps || searchText.length < 3) return
    setLoading(true)
    try {
      const result = await ymaps.geocode(searchText, {
        boundedBy: TASHKENT_BOUNDS,
        strictBounds: false,
        results: 5,
      })
      const results: YandexAddressOption[] = []
      result.geoObjects.each((obj: any) => {
        results.push({
          label: obj.getAddressLine(),
          value: obj.getAddressLine(),
          coords: obj.geometry.getCoordinates() as [number, number],
        })
      })
      setOptions(results)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Debounced search trigger for popular locations and Yandex address search
  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => {
      fetchPopularLocations(searchQuery)
      if (searchQuery.length >= 3) {
        onSearch(searchQuery)
      } else {
        setOptions([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, open])

  // Extract unique categories from popular locations
  const categories = useMemo(() => {
    const uniqueTypes: { [key: string]: string } = {}
    popularLocations.forEach((loc) => {
      if (loc.location_type && loc.location_type_display) {
        uniqueTypes[loc.location_type] = loc.location_type_display
      }
    })
    return [
      { key: 'all', label: 'Barchasi' },
      ...Object.entries(uniqueTypes).map(([key, label]) => ({ key, label })),
    ]
  }, [popularLocations])

  // Filter popular locations client-side by category
  const filteredLocations = useMemo(() => {
    return popularLocations.filter((loc) => {
      if (selectedCategory !== 'all' && loc.location_type !== selectedCategory) {
        return false
      }
      return true
    })
  }, [popularLocations, selectedCategory])

  const handleSelectPopularLocation = (loc: PopularLocation) => {
    const lat = parseFloat(loc.latitude)
    const lng = parseFloat(loc.longitude)
    const coords: [number, number] = [lat, lng]
    setTempCoords(coords)
    setAddress(loc.name + ' (' + loc.address + ')')
    setIsValid(checkServiceArea(lat, lng))
    setShowPopularList(false)
    setSearchQuery('')
  }

  const handleSelectYandexAddress = (opt: YandexAddressOption) => {
    const coords = opt.coords
    setTempCoords(coords)
    setAddress(opt.label)
    setIsValid(checkServiceArea(coords[0], coords[1]))
  }

  const handleMapClick = useCallback(
    async (e: any) => {
      const coords = e.get('coords') as [number, number]
      const inArea = checkServiceArea(coords[0], coords[1])

      setTempCoords(coords)
      setIsValid(inArea)
      setLoading(true)

      const addr = await geocodeCoords(coords[0], coords[1])
      setAddress(addr)
      setLoading(false)

      if (!inArea) {
        message.warning('Tanlangan hudud xizmat doirasidan tashqarida')
      }
    },
    [ymaps]
  )

  const handleConfirm = () => {
    if (!isValid) {
      message.error("Kechirasiz, bu hududda xizmat ko'rsata olmaymiz")
      return
    }
    setLocation({
      lat: tempCoords[0],
      lng: tempCoords[1],
      address: address || 'Tanlangan manzil',
    })
    setIsInServiceArea(true)
    message.success('Manzil muvaffaqiyatli saqlandi')
    onClose()
  }

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) return
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        const coords: [number, number] = [latitude, longitude]
        setTempCoords(coords)
        setIsValid(checkServiceArea(latitude, longitude))
        const addr = await geocodeCoords(latitude, longitude)
        setAddress(addr)
        setLoading(false)
      },
      () => {
        message.error("Joylashuvni aniqlab bo'lmadi")
        setLoading(false)
      }
    )
  }

  const isLocationActive = (latitude: string, longitude: string) => {
    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    return Math.abs(tempCoords[0] - lat) < 0.0001 && Math.abs(tempCoords[1] - lng) < 0.0001
  }

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'RESIDENTIAL':
        return <HomeOutlined />
      case 'MARKET':
        return <ShopOutlined />
      case 'EDUCATION':
        return <BookOutlined />
      case 'GOVERNMENT':
        return <BankOutlined />
      default:
        return <EnvironmentOutlined />
    }
  }

  useEffect(() => {
    if (open && location) {
      setTempCoords([location.lat, location.lng])
      setAddress(location.address || '')
      setIsValid(checkServiceArea(location.lat, location.lng))
    }
  }, [open, location])

  // Yandex Maps measures its container once at init time. Since it's mounted
  // inside an animated antd Modal, that first measurement can happen mid
  // fade/zoom-in transition (or before flex layout has settled), leaving the
  // map stuck at the wrong size — or blank. Force a re-measure shortly after
  // the modal is actually open and the layout has had time to settle.
  useEffect(() => {
    if (!open || !mapInstance) return
    const timer = setTimeout(() => {
      try {
        mapInstance.container.fitToViewport()
      } catch (error) {
        console.error('Map fitToViewport error:', error)
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [open, mapInstance])

  const renderMap = () => (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #eee',
      }}
    >
      <Map
        state={{ center: tempCoords, zoom: DEFAULT_MAP_ZOOM }}
        width="100%"
        height="100%"
        onClick={handleMapClick}
        options={{ suppressMapOpenBlock: true }}
        instanceRef={(ref: any) => ref && setMapInstance(ref)}
      >
        <Polygon
          geometry={[SERVICE_AREA.map((p) => [p[1], p[0]])]}
          onClick={handleMapClick}
          options={{
            fillColor: 'rgba(197, 160, 89, 0.08)',
            strokeColor: '#C5A059',
            strokeOpacity: 0.8,
            strokeWidth: 2,
            fillOpacity: 1,
          }}
        />

        <Placemark
          geometry={tempCoords}
          options={{
            iconLayout: 'default#image',
            iconImageSize: [40, 40],
            iconImageOffset: [-20, -40],
            iconImageHref: '/location-map-active.png',
          }}
        />

        {/* Mashhur joylar — xaritada o'z koordinatasida, ustiga olib borilganda
            (hover) nomi ko'rinadigan, bosilganda esa tanlanadigan belgilar */}
        {filteredLocations.map((loc) => (
          <Placemark
            key={`popular-pin-${loc.uuid}`}
            geometry={[parseFloat(loc.latitude), parseFloat(loc.longitude)]}
            properties={{
              hintContent: loc.name,
              balloonContentHeader: loc.name,
              balloonContentBody: loc.address,
            }}
            options={{
              preset: 'islands#icon',
              iconColor: '#C5A059',
            }}
            onClick={() => handleSelectPopularLocation(loc)}
          />
        ))}

        <ZoomControl options={{ position: { right: 20, top: 108 } }} />
        <GeolocationControl options={{ position: { right: 20, top: 180 } }} />
      </Map>

      {!isValid && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'white',
            padding: '10px 20px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid #ffccc7',
          }}
        >
          <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '18px' }} />
          <Typography.Text strong style={{ color: '#ff4d4f' }}>
            Xizmat doirasidan tashqarida
          </Typography.Text>
        </div>
      )}

      <Button
        icon={<EnvironmentOutlined />}
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '20px',
          zIndex: 100,
          borderRadius: '10px',
          height: '40px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
        onClick={handleCurrentLocation}
      >
        Mening joylashuvim
      </Button>
    </div>
  )

  return (
    <div className="location-modal-root flex flex-col gap-4 lg:gap-6">
      <div className="location-modal-scroll flex flex-col gap-4 lg:gap-6">
        <div className="milliy-ikat-strip -mt-2 h-[3px] w-full flex-shrink-0 rounded-full opacity-90" />

        {/* ── Mobile layout: map-first, popular places behind a single toggle ── */}
        <div className="flex min-h-0 flex-1 flex-col gap-3 lg:hidden">
          {/* Toggle: opens a panel with its own search + the popular-places list */}
          {filteredLocations.length > 0 && (
            <button
              type="button"
              onClick={() => setShowPopularList((v) => !v)}
              className={`flex flex-shrink-0 items-center gap-1.5 self-start rounded-full border px-3 py-1.5 text-[12px] font-bold transition-all duration-200 ${
                showPopularList
                  ? 'border-[#C5A059] bg-[#C5A059] text-white'
                  : 'border-[#C5A059]/30 bg-[#C5A059]/10 text-[#B38F4D]'
              }`}
            >
              <EnvironmentOutlined style={{ fontSize: 11 }} />
              Mashhur joylar
            </button>
          )}

          {showPopularList && (
            <div className="flex max-h-[340px] flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-[#C5A059]/20 bg-white shadow-[0_16px_36px_rgba(0,0,0,0.07)]">
              {/* Search sits at the top of the list — filters it live */}
              <div className="flex-shrink-0 border-b border-[#f2ead9] bg-[#FDFBF7] p-2">
                <Input
                  placeholder="Mashhur joylar ichidan qidiring..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  prefix={<SearchOutlined style={{ color: '#C5A059', fontSize: 13 }} />}
                  allowClear
                  autoFocus
                  className="location-search-input"
                  style={{
                    borderRadius: '12px',
                    background: '#fff',
                    border: '1.5px solid #eee',
                    fontSize: '13px',
                  }}
                />
              </div>

              <div className="overflow-y-auto p-2">
                {filteredLocations.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    {filteredLocations.map((loc) => {
                      const active = isLocationActive(loc.latitude, loc.longitude)
                      return (
                        <div
                          key={loc.uuid}
                          onClick={() => handleSelectPopularLocation(loc)}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all duration-200 ${
                            active
                              ? 'border-[#C5A059] bg-[#FBF6EC] shadow-sm'
                              : 'border-transparent active:bg-[#fafaf9]'
                          }`}
                        >
                          <div
                            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                              active ? 'bg-[#C5A059] text-white' : 'bg-[#C5A059]/10 text-[#B38F4D]'
                            }`}
                          >
                            {getLocationIcon(loc.location_type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[13px] font-bold text-[#111]">
                              {loc.name}
                            </div>
                            <div className="truncate text-[11.5px] text-[#888]">{loc.address}</div>
                            {loc.orientir && (
                              <div className="mt-0.5 truncate text-[10.5px] text-[#aaa]">
                                Mo'ljal: {loc.orientir}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Typography.Text type="secondary" style={{ fontSize: '13px' }}>
                      Hech narsa topilmadi
                    </Typography.Text>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Map takes whatever room remains */}
          <div className="min-h-[300px] flex-1">{renderMap()}</div>
        </div>

        {/* ── Desktop/tablet layout: list + map side-by-side (unchanged) ── */}
        <div className="hidden lg:flex lg:flex-row lg:gap-6">
          {/* Left Column: Popular Locations & Search */}
          <div className="flex h-[450px] w-[350px] flex-shrink flex-col overflow-hidden border-r border-[#eee] pb-0 pr-6">
            {/* Search Box */}
            <div style={{ marginBottom: '14px' }}>
              <Input
                size="large"
                placeholder="Manzil yoki mashhur joyni qidiring..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                prefix={<SearchOutlined style={{ color: '#bbb' }} />}
                allowClear
                className="location-search-input"
                style={{ borderRadius: '12px', background: '#f8f8f8', border: '1px solid #eee' }}
              />
            </div>

            {/* Category Pills */}
            <div
              className="mb-2 flex gap-2 overflow-x-auto pb-3"
              style={{
                whiteSpace: 'nowrap',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    selectedCategory === cat.key
                      ? 'bg-[#C5A059] text-white shadow-sm'
                      : 'bg-[#f5f5f5] text-[#555] hover:bg-[#eaeaea]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Scrollable Results List */}
            <div className="flex-1 overflow-y-auto pr-1">
              {/* Popular locations section */}
              {filteredLocations.length > 0 && (
                <div className="mb-4">
                  <Typography.Text
                    className="uppercase"
                    type="secondary"
                    style={{
                      fontSize: '11px',
                      fontWeight: 'bold',
                      letterSpacing: '0.05em',
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    Mashhur joylar
                  </Typography.Text>
                  <div className="flex flex-col gap-2">
                    {filteredLocations.map((loc) => {
                      const active = isLocationActive(loc.latitude, loc.longitude)
                      return (
                        <div
                          key={loc.uuid}
                          onClick={() => handleSelectPopularLocation(loc)}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all duration-200 ${
                            active
                              ? 'border-[#C5A059] bg-[#FBF6EC] shadow-sm'
                              : 'border-[#f3f3f1] bg-[#fafaf9]/30 hover:border-[#e2e2df] hover:bg-[#fafaf9]'
                          }`}
                        >
                          <div
                            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                              active ? 'bg-[#C5A059] text-white' : 'bg-[#C5A059]/10 text-[#B38F4D]'
                            }`}
                          >
                            {getLocationIcon(loc.location_type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[13px] font-bold text-[#111]">
                              {loc.name}
                            </div>
                            <div className="truncate text-[11.5px] text-[#888]">{loc.address}</div>
                            {loc.orientir && (
                              <div className="mt-0.5 truncate text-[10.5px] text-[#aaa]">
                                Mo'ljal: {loc.orientir}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Yandex address autocomplete results */}
              {searchQuery.length >= 3 && options.length > 0 && (
                <div>
                  <Typography.Text
                    className="uppercase"
                    type="secondary"
                    style={{
                      fontSize: '11px',
                      fontWeight: 'bold',
                      letterSpacing: '0.05em',
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    Boshqa manzillar (Xarita bo'yicha)
                  </Typography.Text>
                  <div className="flex flex-col gap-2">
                    {options.map((opt, i) => (
                      <div
                        key={`yandex-opt-${i}`}
                        onClick={() => handleSelectYandexAddress(opt)}
                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#f0f2f5] p-3 transition-all duration-200 hover:border-[#d9d9d9] hover:bg-[#f5f7fa]"
                      >
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#E6F7FF] text-[#1890FF]">
                          <CompassOutlined />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-medium text-[#111]">
                            {opt.label}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredLocations.length === 0 &&
                (options.length === 0 || searchQuery.length < 3) && (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <EnvironmentOutlined
                      style={{ fontSize: '32px', color: '#ccc', marginBottom: '8px' }}
                    />
                    <Typography.Text type="secondary" style={{ fontSize: '13px' }}>
                      Joylar topilmadi
                    </Typography.Text>
                  </div>
                )}
            </div>
          </div>

          {/* Right Column: Map */}
          <div className="h-[450px] flex-1">{renderMap()}</div>
        </div>
      </div>

      {/* Bottom Part: Address confirmation & actions (full width) */}
      <div className="flex-shrink-0 border-t border-[#eee] pt-3 lg:mt-2 lg:pt-4">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center md:gap-6">
          <div className="min-w-0 flex-1">
            <Typography.Text
              type="secondary"
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 600,
              }}
            >
              Tanlangan manzil
            </Typography.Text>
            <Input
              size="large"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Masalan: G'allaorol ko'chasi, 12-uy"
              className="location-search-input"
              style={{
                marginTop: '6px',
                borderRadius: '12px',
                padding: '10px 16px',
                background: '#f8f8f8',
                border: '1px solid #eee',
                fontSize: '14px',
              }}
              suffix={
                loading && (
                  <Typography.Text italic style={{ fontSize: '11px' }}>
                    Aniqlanmoqda...
                  </Typography.Text>
                )
              }
            />
          </div>

          <Space
            className="self-end pt-2 md:self-center md:pt-4"
            style={{ justifyContent: 'flex-end' }}
          >
            <Button size="large" onClick={onClose} style={{ borderRadius: '10px' }}>
              Bekor qilish
            </Button>
            <Button
              type="primary"
              size="large"
              disabled={!isValid || loading}
              onClick={handleConfirm}
              style={{
                background: isValid ? '#111' : '#ccc',
                borderColor: isValid ? '#111' : '#ccc',
                padding: '0 24px',
                fontWeight: 600,
                borderRadius: '10px',
              }}
            >
              Tasdiqlash
            </Button>
          </Space>
        </div>
      </div>
    </div>
  )
}

const LocationModal: React.FC<LocationModalProps> = (props) => {
  return (
    <Modal
      title={
        <Space size={10}>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C5A059]/10">
            <EnvironmentOutlined style={{ color: '#B38F4D', fontSize: 15 }} />
          </span>
          <span className="text-[15px] font-black tracking-tight text-gray-900">
            Yetkazib berish hududini tanlang
          </span>
        </Space>
      }
      open={props.open}
      onCancel={props.onClose}
      footer={null}
      width={1000}
      centered
      className="location-modal"
      wrapClassName="location-modal-wrap"
      styles={{ body: { padding: '24px' } }}
    >
      <YMaps query={{ apikey: YANDEX_API_KEY, lang: 'uz_UZ' as any }}>
        <LocationModalContent {...props} />
      </YMaps>

      <style jsx global>{`
        .location-modal .ant-modal-content {
          overflow: hidden;
          border-radius: 28px;
          padding: 24px !important;
          box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.25) !important;
        }
        .location-modal .ant-modal-header {
          margin-bottom: 18px;
        }
        .location-modal .milliy-ikat-strip {
          border-radius: 3px;
        }
        .location-modal .location-search-input:hover {
          border-color: #c5a059 !important;
        }
        .location-modal .location-search-input.ant-input-affix-wrapper-focused,
        .location-modal .location-search-input:focus {
          border-color: #c5a059 !important;
          box-shadow: 0 0 0 3px rgba(197, 160, 89, 0.12) !important;
        }

        /* Fullscreen takeover on mobile — the modal was otherwise centered
           at a fixed width, letting its content (list + map) overflow the
           viewport height with no internal scroll, so the map often ended
           up pushed off-screen. */
        @media (max-width: 767px) {
          /* The wrap is antd's own overlay/backdrop container — it defaults
             to overflow:auto so a tall modal can be scrolled as a whole.
             That's exactly what caused the "whole modal scrolls" bug: once
             locked, ALL scrolling must happen inside the panels below. */
          .location-modal-wrap {
            overflow: hidden !important;
            position: fixed !important;
            inset: 0 !important;
          }
          .location-modal.ant-modal {
            top: 0 !important;
            width: 100vw !important;
            max-width: 100vw !important;
            margin: 0 !important;
            padding-bottom: 0 !important;
          }
          .location-modal .ant-modal-content {
            height: 100vh;
            height: 100dvh;
            max-height: 100vh;
            max-height: 100dvh;
            border-radius: 0 !important;
            display: flex;
            flex-direction: column;
            padding: 16px !important;
            padding-top: max(16px, env(safe-area-inset-top)) !important;
            padding-bottom: max(16px, env(safe-area-inset-bottom)) !important;
          }
          .location-modal .ant-modal-header {
            flex-shrink: 0;
            margin-bottom: 14px !important;
          }
          .location-modal .ant-modal-body {
            flex: 1;
            min-height: 0;
            display: flex;
            flex-direction: column;
            padding: 0 !important;
            overflow: hidden;
          }
          .location-modal .location-modal-root {
            flex: 1;
            min-height: 0;
            display: flex;
            flex-direction: column;
          }
          .location-modal .location-modal-scroll {
            flex: 1;
            min-height: 0;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>
    </Modal>
  )
}

export default LocationModal
