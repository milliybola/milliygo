import { Typography, Tag, Skeleton, Button, Steps, Divider, Badge } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { getOrderDetails } from '@/features/Cart/api'
import { useRouter } from 'next/router'
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  ShoppingOutlined,
  LoadingOutlined,
  PushpinOutlined,
  InfoCircleOutlined,
  ContainerOutlined,
  TruckOutlined,
} from '@ant-design/icons'
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps'
import { YANDEX_API_KEY } from '@/constants/api-keys'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { motion, AnimatePresence } from 'framer-motion'

dayjs.extend(customParseFormat)

// Backend sanani "DD-MM-YYYY HH:mm:ss" ko'rinishida qaytaradi (ISO emas) —
// shu format aniq ko'rsatilmasa, dayjs uni noto'g'ri yoki "Invalid Date" deb o'qiydi.
const BACKEND_DATE_FORMAT = 'DD-MM-YYYY HH:mm:ss'

const { Title, Text } = Typography

const statusConfig: Record<
  string,
  { label: string; color: string; icon: any; step: number; theme: string }
> = {
  PENDING: {
    label: 'Kutilmoqda',
    color: '#3B82F6',
    icon: <ClockCircleOutlined />,
    step: 0,
    theme: 'blue',
  },
  ACCEPTED: {
    label: 'Tasdiqlandi',
    color: '#06B6D4',
    icon: <CheckCircleOutlined />,
    step: 1,
    theme: 'cyan',
  },
  PREPARING: {
    label: 'Tayyorlanmoqda',
    color: '#F59E0B',
    icon: <LoadingOutlined />,
    step: 2,
    theme: 'orange',
  },
  READY: {
    label: 'Tayyor',
    color: '#10B981',
    icon: <CheckCircleOutlined />,
    step: 3,
    theme: 'emerald',
  },
  READY_FOR_PICKUP: {
    label: 'Olib ketishga tayyor',
    color: '#10B981',
    icon: <CheckCircleOutlined />,
    step: 3,
    theme: 'emerald',
  },
  PICKED_UP: {
    label: 'Kuryer qabul qildi',
    color: '#8B5CF6',
    icon: <TruckOutlined />,
    step: 4,
    theme: 'violet',
  },
  ON_THE_WAY: {
    label: "Yo'lda",
    color: '#8B5CF6',
    icon: <TruckOutlined />,
    step: 4,
    theme: 'violet',
  },
  DELIVERING: {
    label: 'Yetkazilmoqda',
    color: '#8B5CF6',
    icon: <TruckOutlined />,
    step: 4,
    theme: 'violet',
  },
  DELIVERED: {
    label: 'Yetkazildi',
    color: '#059669',
    icon: <CheckCircleOutlined />,
    step: 5,
    theme: 'success',
  },
  REJECTED: {
    label: 'Rad etildi',
    color: '#EF4444',
    icon: <InfoCircleOutlined />,
    step: 0,
    theme: 'error',
  },
  CANCELLED: {
    label: 'Bekor qilindi',
    color: '#6B7280',
    icon: <InfoCircleOutlined />,
    step: 0,
    theme: 'gray',
  },
}

const OrderDetails = ({ uuid }: { uuid: string }) => {
  const router = useRouter()
  const {
    data: orderResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['order-details', uuid],
    queryFn: () => getOrderDetails(uuid),
    enabled: !!uuid,
    refetchInterval: (query: any) => {
      const status = query.state.data?.status
      return status && !['DELIVERED', 'REJECTED', 'CANCELLED'].includes(status) ? 10000 : false
    },
  })

  const order = orderResponse
  const config = order
    ? statusConfig[order.status] || {
        label: order.status,
        color: '#6B7280',
        icon: null,
        step: 0,
        theme: 'gray',
      }
    : null
  const fmt = (n: any) => Number(n).toLocaleString('uz-UZ').replace(/,/g, ' ')

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-8 flex items-center gap-4">
          <Skeleton.Button active shape="round" size="large" />
          <div>
            <Skeleton.Input active size="large" />
            <div className="mt-2">
              <Skeleton.Input active size="small" />
            </div>
          </div>
        </div>
        <Skeleton active avatar paragraph={{ rows: 12 }} className="rounded-[40px] bg-white p-8" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-2xl px-4 py-24 text-center"
      >
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[32px] bg-gray-50">
          <InfoCircleOutlined className="text-4xl text-gray-300" />
        </div>
        <Title level={3} className="!mb-2 font-bold ring-offset-current">
          Buyurtma topilmadi
        </Title>
        <Text className="mb-8 block text-gray-400">
          Kechirasiz, ushbu buyurtma ma'lumotlarini topa olmadik.
        </Text>
        <Button
          type="primary"
          size="large"
          onClick={() => router.push('/orders')}
          className="h-14 rounded-2xl border-none bg-gray-900 px-8 font-bold hover:!bg-gray-800"
        >
          Buyurtmalar ro'yxatiga qaytish
        </Button>
      </motion.div>
    )
  }

  const steps = [
    { title: 'Qabul qilindi', icon: <ShoppingOutlined /> },
    { title: 'Tasdiqlandi', icon: <CheckCircleOutlined /> },
    { title: 'Tayyorlanmoqda', icon: <ClockCircleOutlined /> },
    { title: 'Tayyor', icon: <ContainerOutlined /> },
    { title: "Yo'lda", icon: <TruckOutlined /> },
    { title: 'Yetkazildi', icon: <CheckCircleOutlined /> },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-6xl px-3.5 py-3 pb-32 sm:px-4 sm:py-8"
    >
      {/* Header Section */}
      <motion.div
        variants={itemVariants}
        className="mb-5 flex flex-col justify-between gap-4 sm:mb-10 sm:flex-row sm:items-center sm:gap-6"
      >
        <div className="flex items-center gap-2.5 sm:gap-5">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push('/orders')}
            className="flex h-9 w-9 items-center justify-center rounded-xl border-none bg-white text-gray-900 shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] sm:h-14 sm:w-14 sm:rounded-2xl"
          />
          <div>
            <div className="flex items-center gap-3">
              <Title
                level={3}
                className="!m-0 text-[16px] font-black tracking-tight text-gray-900 sm:text-[28px]"
              >
                Buyurtma №{order.id}
              </Title>
              {/* {order.status === 'PENDING' && (
                                <Badge status="processing" color="#3B82F6" className="animate-pulse" />
                            )} */}
            </div>
            <Text className="text-[11px] font-medium text-gray-400 sm:text-[15px]">
              {dayjs(order.created_at, BACKEND_DATE_FORMAT).format('DD MMMM, YYYY • HH:mm')}
            </Text>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* <Button
                        size="large"
                        className="rounded-2xl h-14 px-6 border-gray-100 font-bold text-gray-600 hover:!text-gray-900"
                        onClick={() => window.print()}
                    >
                        Chekni yuklash
                    </Button> */}
        </div>
      </motion.div>

      {/* Main Status & Tracking */}
      <motion.div
        variants={itemVariants}
        className="relative mb-5 overflow-hidden rounded-[24px] border border-gray-50 bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.03)] sm:mb-8 sm:rounded-[44px] sm:p-10"
      >
        {/* Background Decoration */}
        <div className="from-blue-50/20 pointer-events-none absolute right-0 top-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-gradient-to-br to-transparent blur-3xl" />

        <div className="relative z-10 mb-6 flex flex-col justify-between gap-4 sm:mb-12 sm:gap-8 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3.5 sm:gap-6">
            <div
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-xl shadow-[0_8px_25px_rgba(0,0,0,0.1)] transition-transform hover:scale-105 sm:h-20 sm:w-20 sm:rounded-[28px] sm:text-3xl`}
              style={{ backgroundColor: config?.color, color: 'white' }}
            >
              {config?.icon}
            </div>
            <div>
              <Text className="mb-0.5 block text-[10px] uppercase tracking-widest text-gray-400 sm:mb-1 sm:text-[12px]">
                Buyurtma holati
              </Text>
              <div className="flex items-center gap-3">
                <Title
                  level={4}
                  className="!m-0 text-[16px] font-black text-gray-900 sm:text-[20px]"
                >
                  {config?.label}
                </Title>
              </div>
            </div>
          </div>

          <div className="mx-8 hidden h-px flex-1 bg-gray-100 lg:block" />

          <div className="flex flex-col lg:items-end">
            <Text className="mb-0.5 block text-[10px] uppercase tracking-widest text-gray-400 sm:mb-1 sm:text-right sm:text-[12px]">
              Umumiy summa
            </Text>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-blue-600 text-[18px] font-black leading-tight tracking-tighter sm:text-[24px]">
                {fmt(order.total_price)}
              </span>
              <span className="text-[13px] font-bold text-gray-400 sm:text-[16px]">UZS</span>
            </div>
          </div>
        </div>

        {order.status !== 'REJECTED' && order.status !== 'CANCELLED' && (
          <div className="-mx-4 overflow-x-auto px-4 py-2 sm:mx-0 sm:px-1">
            <Steps
              current={config?.step}
              labelPlacement="vertical"
              items={steps}
              className="premium-order-steps"
            />
          </div>
        )}

        {order.status === 'REJECTED' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 flex items-start gap-3 rounded-[20px] border-2 border-red-100 bg-red-50/50 p-4 sm:mt-6 sm:gap-4 sm:rounded-[28px] sm:p-6"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-100 text-lg text-red-500 sm:h-12 sm:w-12 sm:rounded-2xl sm:text-xl">
              <InfoCircleOutlined />
            </div>
            <div>
              <Text className="mb-1 block text-[14px] font-bold text-red-900 sm:text-[16px]">
                Buyurtma rad etildi
              </Text>
              <Text className="text-[13px] font-medium text-red-600/80 sm:text-[14px]">
                {order.reject_reason ||
                  "Kechirasiz, texnik sabablarga ko'ra buyurtmani qabul qila olmaymiz."}
              </Text>
            </div>
          </motion.div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 items-start gap-5 sm:gap-8 lg:grid-cols-12">
        {/* Left Column: Items */}
        <div className="space-y-4 sm:space-y-6 lg:col-span-7">
          <motion.div
            variants={itemVariants}
            className="rounded-[24px] border border-gray-50 bg-white p-4 shadow-[0_10px_40px_rgba(0,0,0,0.02)] sm:rounded-[40px] sm:p-10"
          >
            <div className="mb-4 flex items-center justify-between sm:mb-8">
              <Title level={4} className="!m-0 text-[16px] font-black sm:text-[22px]">
                Mahsulotlar
              </Title>
              <Tag
                color="cyan"
                className="text-blue-500 bg-blue-50 m-0 rounded-full border-none px-2.5 py-0.5 text-[11px] font-bold sm:px-4 sm:text-[13px]"
              >
                {order.items.length} ta mahsulot
              </Tag>
            </div>

            <div className="space-y-4 sm:space-y-8">
              <AnimatePresence>
                {order.items.map((item: any, idx: number) => (
                  <motion.div
                    key={item.uuid || idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className="group flex gap-3 sm:gap-6"
                  >
                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm transition-transform group-hover:scale-105 sm:h-20 sm:w-20 sm:rounded-[28px]">
                      <img
                        src={item.product?.images?.[0]?.image || '/placeholder-food.png'}
                        alt={item.product?.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 py-0.5 sm:py-1">
                      <div className="mb-0.5 flex items-start justify-between gap-2 sm:mb-1">
                        <Text className="block text-[13.5px] font-extrabold leading-tight text-gray-900 sm:text-[18px]">
                          {item.product?.name}
                        </Text>
                        <Text className="whitespace-nowrap text-[13.5px] font-extrabold text-gray-900 sm:text-[18px]">
                          {fmt(Number(item.price_at_time_of_order) * item.quantity)}
                        </Text>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <Text className="rounded-lg bg-gray-50 px-2 py-0.5 text-[11px] font-bold text-gray-400 sm:px-2.5 sm:text-[13px]">
                          {item.quantity} x {fmt(item.price_at_time_of_order)} UZS
                        </Text>
                        {item.product?.discount > 0 && (
                          <Tag
                            color="green"
                            className="m-0 scale-90 border-none text-[10px] font-bold sm:text-[12px]"
                          >
                            -{item.product.discount}% chegirma
                          </Tag>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <Divider className="my-5 border-gray-100 sm:my-10" />

            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between text-[13px] sm:text-[16px]">
                <Text className="font-bold text-gray-400">Mahsulotlar summasi:</Text>
                <Text className="font-bold text-gray-900">
                  {fmt(Number(order.total_price) - Number(order.delivery_fee))} UZS
                </Text>
              </div>
              <div className="flex items-center justify-between text-[13px] sm:text-[16px]">
                <Text className="font-bold text-gray-400">Yetkazib berish:</Text>
                <Text className="font-bold text-gray-900">
                  {Number(order.delivery_fee) === 0 ? 'Bepul' : `${fmt(order.delivery_fee)} UZS`}
                </Text>
              </div>
              <div className="flex items-center justify-between pt-2.5 text-[15px] sm:pt-4 sm:text-[20px]">
                <Text className="font-black text-gray-900">Jami:</Text>
                <div className="text-right">
                  <span className="text-[19px] font-black leading-none text-gray-900 sm:text-[26px]">
                    {fmt(order.total_price)}
                  </span>
                  <span className="ml-1 align-middle text-[12px] font-bold text-gray-400 sm:ml-1.5 sm:text-[14px]">
                    UZS
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Comment */}
          <motion.div
            variants={itemVariants}
            className="rounded-[24px] border border-gray-50 bg-white p-4 shadow-[0_10px_40px_rgba(0,0,0,0.02)] sm:rounded-[40px] sm:p-8"
          >
            <div className="mb-3 flex items-center gap-2.5 sm:mb-4 sm:gap-3">
              <ContainerOutlined className="text-lg text-gray-400 sm:text-xl" />
              <Title level={5} className="!m-0 text-[14px] font-bold sm:text-base">
                Buyurtmaga izoh
              </Title>
            </div>
            <div className="rounded-xl border border-gray-50 bg-gray-50/50 p-3 sm:rounded-2xl sm:p-4">
              <Text className="text-[13px] font-medium italic leading-relaxed text-gray-600 sm:text-[14px]">
                {order.description || "Izoh ko'rsatilmagan"}
              </Text>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Sidebar Info */}
        <div className="space-y-4 sm:space-y-6 lg:col-span-5">
          {/* Partner Card */}
          <motion.div
            variants={itemVariants}
            className="rounded-[24px] border border-gray-50 bg-white p-4 shadow-[0_10px_40px_rgba(0,0,0,0.02)] sm:rounded-[40px] sm:p-8"
          >
            <div className="mb-4 flex items-center gap-2.5 sm:mb-8 sm:gap-3">
              <ShoppingOutlined className="text-lg text-gray-400 sm:text-xl" />
              <Title level={5} className="!m-0 text-[14px] font-black sm:text-base">
                Tashkilot
              </Title>
            </div>

            <div className="mb-4 flex items-center gap-3 sm:mb-8 sm:gap-5">
              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-gray-50 p-0.5 shadow-sm sm:h-16 sm:w-16 sm:rounded-[24px]">
                <img
                  src={order.items?.[0]?.product?.partner?.logo || '/placeholder-logo.png'}
                  className="h-full w-full rounded-xl object-cover sm:rounded-[20px]"
                  alt={order.partner_name}
                />
              </div>
              <div className="min-w-0">
                <Text className="mb-0.5 block truncate text-[15px] font-black leading-tight text-gray-900 sm:mb-1 sm:text-[20px]">
                  {order.partner_name}
                </Text>
                <Text className="flex items-center gap-1.5 text-[12px] font-medium text-gray-400 sm:text-[14px]">
                  <EnvironmentOutlined size={12} />
                  <span className="truncate">{order.items?.[0]?.product?.partner?.address}</span>
                </Text>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <Button
                type="primary"
                block
                size="large"
                className="hover:!border-blue-200 flex h-11 items-center justify-center gap-2 rounded-2xl border-gray-100 text-[13px] font-black shadow-sm sm:h-14 sm:rounded-[20px] sm:text-base"
                icon={<PhoneOutlined rotate={90} />}
                href={`tel:${order.items?.[0]?.product?.partner?.phone}`}
              >
                Qo'ng'iroq
              </Button>
              {/* <Button
                                block
                                size="large"
                                className="rounded-[20px] h-14 font-black flex items-center justify-center gap-2 bg-blue-600 text-white border-none shadow-[0_8px_20px_rgba(59,130,246,0.3)] hover:!bg-blue-700"
                                onClick={() => router.push(`/restaurant/${order.items?.[0]?.product?.partner?.slug}`)}
                            >
                                Menyu
                            </Button> */}
            </div>
          </motion.div>

          {/* Delivery Info with Map */}
          <motion.div
            variants={itemVariants}
            className="overflow-hidden rounded-[24px] border border-gray-50 bg-white p-0 shadow-[0_10px_40px_rgba(0,0,0,0.02)] sm:rounded-[40px]"
          >
            <div className="p-4 pb-3 sm:p-8 sm:pb-4">
              <div className="mb-3 flex items-center justify-between sm:mb-6">
                <Title level={5} className="!m-0 text-[14px] font-black sm:text-base">
                  Yetkazib berish
                </Title>
                <Tag
                  color="blue"
                  className="m-0 scale-90 rounded-lg border-none text-[11px] font-bold sm:text-[12px]"
                >
                  Kuryer orqali
                </Tag>
              </div>
            </div>

            <div className="group relative h-[160px] w-full sm:h-[240px]">
              <YMaps query={{ apikey: YANDEX_API_KEY, lang: 'uz_UZ' as any }}>
                <Map
                  state={{
                    center: [Number(order.latitude), Number(order.longitude)],
                    zoom: 15,
                  }}
                  width="100%"
                  height="100%"
                  options={{
                    suppressMapOpenBlock: true,
                    yandexMapDisablePoiInteractivity: true,
                  }}
                >
                  <Placemark
                    geometry={[Number(order.latitude), Number(order.longitude)]}
                    options={{
                      preset: 'islands#yellowDotIcon',
                      iconColor: '#3B82F6',
                    }}
                  />
                </Map>
              </YMaps>
              {/* Overlay mask for map */}
              <div className="absolute inset-0 bg-transparent" />
            </div>

            <div className="space-y-4 bg-[#FAFBFC] p-4 pt-4 sm:space-y-6 sm:p-8 sm:pt-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="text-blue-500 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white text-sm shadow-sm sm:h-12 sm:w-12 sm:rounded-2xl sm:text-base">
                  <PushpinOutlined />
                </div>
                <div className="min-w-0">
                  <Text className="mb-0.5 block text-[11px] font-bold uppercase tracking-wider text-gray-400 sm:mb-1 sm:text-[13px]">
                    Yetkazish manzili
                  </Text>
                  <Text className="block text-[13.5px] font-extrabold leading-tight text-gray-900 sm:text-[16px]">
                    {order.address}
                  </Text>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:gap-4">
                <div className="text-blue-500 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white text-sm shadow-sm sm:h-12 sm:w-12 sm:rounded-2xl sm:text-base">
                  <PhoneOutlined />
                </div>
                <div>
                  <Text className="mb-0.5 block text-[11px] font-bold uppercase tracking-wider text-gray-400 sm:mb-1 sm:text-[13px]">
                    Bog'lanish
                  </Text>
                  <Text className="text-[15px] font-black text-gray-900 sm:text-[18px]">
                    {order.contact_phone}
                  </Text>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx global>{`
        .premium-order-steps {
          margin-top: 20px;
        }
        .premium-order-steps .ant-steps-item-title {
          font-size: 13px !important;
          font-weight: 800 !important;
          line-height: 1.4 !important;
          color: #94a3b8 !important;
          margin-top: 8px !important;
        }
        .premium-order-steps .ant-steps-item-finish .ant-steps-item-title {
          color: #1e293b !important;
        }
        .premium-order-steps .ant-steps-item-process .ant-steps-item-title {
          color: #3b82f6 !important;
        }
        .premium-order-steps .ant-steps-item-icon {
          width: 44px !important;
          height: 44px !important;
          line-height: 44px !important;
          border-radius: 16px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border-width: 2px !important;
          margin-bottom: 8px !important;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
        }
        .premium-order-steps .ant-steps-item-finish .ant-steps-item-icon {
          background: #f0fdf4 !important;
          border-color: #bbf7d0 !important;
          color: #16a34a !important;
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.1);
        }
        .premium-order-steps .ant-steps-item-process .ant-steps-item-icon {
          background: #3b82f6 !important;
          border-color: #3b82f6 !important;
          color: white !important;
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
          transform: scale(1.1);
        }
        .premium-order-steps .ant-steps-item-process .ant-steps-item-icon .ant-steps-icon {
          color: white !important;
        }
        .premium-order-steps .ant-steps-item-wait .ant-steps-item-icon {
          background: #f8fafc !important;
          border-color: #f1f5f9 !important;
          color: #cbd5e1 !important;
        }
        .premium-order-steps .ant-steps-item-tail::after {
          background-color: #f1f5f9 !important;
          height: 3px !important;
          top: 22px !important;
          width: calc(100% - 64px) !important;
          margin-left: 32px !important;
        }
        .premium-order-steps .ant-steps-item-finish .ant-steps-item-tail::after {
          background-color: #bbf7d0 !important;
        }
        .premium-order-steps .ant-steps-item {
          min-width: 56px;
        }
        @media (max-width: 640px) {
          .premium-order-steps {
            min-width: 460px;
          }
          .premium-order-steps .ant-steps-item-title {
            font-size: 9.5px !important;
            margin-top: 4px !important;
          }
          .premium-order-steps .ant-steps-item-icon {
            width: 32px !important;
            height: 32px !important;
            line-height: 32px !important;
            border-radius: 11px !important;
            margin-bottom: 4px !important;
          }
          .premium-order-steps .ant-steps-item-tail::after {
            top: 16px !important;
            width: calc(100% - 44px) !important;
            margin-left: 22px !important;
          }
        }
      `}</style>
    </motion.div>
  )
}

export default OrderDetails
