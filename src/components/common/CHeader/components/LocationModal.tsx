import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Modal, Button, Typography, message, Space, Input } from 'antd'
import { YMaps, Map, Placemark, Polygon, ZoomControl, GeolocationControl, useYMaps } from '@pbe/react-yandex-maps'
import {
  EnvironmentOutlined,
  CloseCircleOutlined,
  HomeOutlined,
  BookOutlined,
  ShopOutlined,
  BankOutlined,
  CompassOutlined,
  SearchOutlined
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
        message.warning("Tanlangan hudud xizmat doirasidan tashqarida")
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

  return (
    <div className="flex flex-col gap-6">
      {/* Top Part: Two columns side-by-side */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Popular Locations & Search */}
        <div className="w-full lg:w-[350px] flex flex-col h-[350px] lg:h-[450px] border-b lg:border-b-0 lg:border-r border-[#eee] pb-4 lg:pb-0 lg:pr-6 overflow-hidden">
          {/* Search Box */}
          <div style={{ marginBottom: '14px' }}>
            <Input
              size="large"
              placeholder="Manzil yoki mashhur joyni qidiring..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefix={<SearchOutlined style={{ color: '#bbb' }} />}
              allowClear
              style={{ borderRadius: '12px', background: '#f8f8f8', border: '1px solid #eee' }}
            />
          </div>

          {/* Category Pills */}
          <div 
            className="flex gap-2 overflow-x-auto pb-3 mb-2" 
            style={{ 
              whiteSpace: 'nowrap',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  selectedCategory === cat.key
                    ? 'bg-[#E65100] text-white shadow-sm'
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
                <Typography.Text className='uppercase' type="secondary" style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                  Mashhur joylar
                </Typography.Text>
                <div className="flex flex-col gap-2">
                  {filteredLocations.map((loc) => {
                    const active = isLocationActive(loc.latitude, loc.longitude)
                    return (
                      <div
                        key={loc.uuid}
                        onClick={() => handleSelectPopularLocation(loc)}
                        className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                          active
                            ? 'border-[#E65100] bg-[#FFF8F2] shadow-sm'
                            : 'border-[#f3f3f1] bg-[#fafaf9]/30 hover:bg-[#fafaf9] hover:border-[#e2e2df]'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          active ? 'bg-[#E65100] text-white' : 'bg-[#FFF3E0] text-[#E65100]'
                        }`}>
                          {getLocationIcon(loc.location_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-bold text-[#111] truncate">{loc.name}</div>
                          <div className="text-[11.5px] text-[#888] truncate">{loc.address}</div>
                          {loc.orientir && (
                            <div className="text-[10.5px] text-[#aaa] truncate mt-0.5">
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
                <Typography.Text className='uppercase' type="secondary" style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                  Boshqa manzillar (Xarita bo'yicha)
                </Typography.Text>
                <div className="flex flex-col gap-2">
                  {options.map((opt, i) => (
                    <div
                      key={`yandex-opt-${i}`}
                      onClick={() => handleSelectYandexAddress(opt)}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#f5f7fa] cursor-pointer transition-all duration-200 border border-[#f0f2f5] hover:border-[#d9d9d9]"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#E6F7FF] flex items-center justify-center flex-shrink-0 text-[#1890FF]">
                        <CompassOutlined />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-[#111] truncate">{opt.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredLocations.length === 0 && (options.length === 0 || searchQuery.length < 3) && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <EnvironmentOutlined style={{ fontSize: '32px', color: '#ccc', marginBottom: '8px' }} />
                <Typography.Text type="secondary" style={{ fontSize: '13px' }}>
                  Joylar topilmadi
                </Typography.Text>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Map */}
        <div className="flex-1 h-[350px] lg:h-[450px]">
          {/* Map Container */}
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
            >
              <Polygon
                geometry={[SERVICE_AREA.map((p) => [p[1], p[0]])]}
                onClick={handleMapClick}
                options={{
                  fillColor: 'rgba(230, 81, 0, 0.08)',
                  strokeColor: '#E65100',
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
        </div>
      </div>

      {/* Bottom Part: Address confirmation & actions (full width) */}
      <div className="border-t border-[#eee] pt-4 mt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1 min-w-0">
            <Typography.Text
              type="secondary"
              style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}
            >
              Tanlangan manzil
            </Typography.Text>
            <Input
              size="large"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Masalan: G'allaorol ko'chasi, 12-uy"
              style={{
                marginTop: '6px',
                borderRadius: '12px',
                padding: '10px 16px',
                background: '#f8f8f8',
                border: '1px solid #eee',
                fontSize: '14px'
              }}
              suffix={loading && <Typography.Text italic style={{ fontSize: '11px' }}>Aniqlanmoqda...</Typography.Text>}
            />
          </div>

          <Space className="self-end md:self-center pt-2 md:pt-4" style={{ justifyContent: 'flex-end' }}>
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
                height: '40px',
                padding: '0 24px',
                fontWeight: 600,
                borderRadius: '10px'
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
        <Space>
          <EnvironmentOutlined style={{ color: '#E65100' }} />
          <span>Yetkazib berish hududini tanlang</span>
        </Space>
      }
      open={props.open}
      onCancel={props.onClose}
      footer={null}
      width={1000}
      centered
      className="location-modal"
      styles={{ body: { padding: '24px' } }}
    >
      <YMaps query={{ apikey: YANDEX_API_KEY, lang: 'uz_UZ' as any }}>
        <LocationModalContent {...props} />
      </YMaps>
    </Modal>
  )
}

export default LocationModal