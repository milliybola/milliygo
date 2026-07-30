import { Typography, Tabs, Tag, Skeleton, Empty, Button } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { getOrders } from '@/features/Cart/api'
import { useRouter } from 'next/router'
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ShoppingOutlined,
  RightOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

// Backend sanani "DD-MM-YYYY HH:mm:ss" ko'rinishida qaytaradi (ISO emas) —
// shu format aniq ko'rsatilmasa, dayjs uni noto'g'ri yoki "Invalid Date" deb o'qiydi.
const BACKEND_DATE_FORMAT = 'DD-MM-YYYY HH:mm:ss'

const { Title, Text } = Typography

// Status mapping and styling
const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'Kutilmoqda', color: 'blue', icon: <ClockCircleOutlined /> },
  ACCEPTED: { label: 'Tasdiqlandi', color: 'cyan', icon: <CheckCircleOutlined /> },
  PREPARING: { label: 'Tayyorlanmoqda', color: 'orange', icon: <ClockCircleOutlined /> },
  READY: { label: 'Tayyor', color: 'green', icon: <CheckCircleOutlined /> },
  READY_FOR_PICKUP: { label: 'Olib ketishga tayyor', color: 'lime', icon: <CheckCircleOutlined /> },
  PICKED_UP: { label: 'Kuryer qabul qildi', color: 'blue', icon: <ClockCircleOutlined /> },
  ON_THE_WAY: { label: "Yo'lda", color: 'purple', icon: <ClockCircleOutlined /> },
  DELIVERING: { label: 'Yetkazilmoqda', color: 'purple', icon: <ClockCircleOutlined /> },
  DELIVERED: { label: 'Yetkazildi', color: 'success', icon: <CheckCircleOutlined /> },
  REJECTED: { label: 'Rad etildi', color: 'error', icon: <CloseCircleOutlined /> },
  CANCELLED: { label: 'Bekor qilindi', color: 'default', icon: <CloseCircleOutlined /> },
}

const OrderCard = ({ order }: { order: any }) => {
  const router = useRouter()
  const config = statusConfig[order.status] || { label: order.status, color: 'default', icon: null }
  const fmt = (n: any) => Number(n).toLocaleString('uz-UZ').replace(/,/g, ' ')

  const firstItem = order.items?.[0]?.product
  const restaurant = firstItem?.partner

  return (
    <div
      onClick={() => router.push(`/orders/track?uuid=${order.uuid}`)}
      className="mb-3 cursor-pointer rounded-[18px] border border-gray-100 bg-white p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all active:scale-[0.98]"
    >
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
            <img
              src={restaurant?.logo || '/placeholder-logo.png'}
              alt={restaurant?.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <Text className="text-[13.5px] font-bold leading-tight text-gray-900">
              {restaurant?.name || order.partner_name || "Noma'lum"}
            </Text>
            <Text className="text-[10.5px] text-gray-400">
              №{order.id} • {dayjs(order.created_at, BACKEND_DATE_FORMAT).format('DD.MM.YYYY')}
            </Text>
          </div>
        </div>
        <Tag
          color={config.color}
          className="m-0 rounded-lg border-none px-1.5 py-0.5 text-[10px] font-bold"
        >
          {config.label.toUpperCase()}
        </Tag>
      </div>

      <div className="border-y border-gray-50/50 py-2.5">
        <div className="mb-2.5 flex items-center gap-2">
          <div className="flex -space-x-3">
            {order.items?.slice(0, 3).map((item: any) => (
              <div
                key={item.uuid}
                className="h-6 w-6 overflow-hidden rounded-full bg-gray-50 ring-2 ring-white"
              >
                <img
                  src={item.product?.images?.[0]?.image || '/placeholder-food.png'}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
          <Text className="text-[12px] font-bold text-gray-500">
            {order.items?.length} ta mahsulot
          </Text>
        </div>
        <div className="space-y-1.5 border-t border-gray-50/50 pt-2 text-[11px] text-gray-500">
          <div className="flex justify-between">
            <span>Mahsulotlar summasi:</span>
            <span className="font-semibold text-gray-900">
              {fmt(Number(order.total_price) - Number(order.delivery_fee))} UZS
            </span>
          </div>
          <div className="flex justify-between">
            <span>Yetkazib berish:</span>
            <span className="font-semibold text-gray-900">
              {Number(order.delivery_fee) === 0 ? 'Bepul' : `${fmt(order.delivery_fee)} UZS`}
            </span>
          </div>
          <div className="flex justify-between pt-1 text-[13px] font-extrabold text-[#111]">
            <span>Jami:</span>
            <span>{fmt(order.total_price)} UZS</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center pt-2.5">
        <Text className="text-blue-600 flex items-center gap-1 text-[12px] font-bold">
          Batafsil ma'lumot <RightOutlined className="text-[9px]" />
        </Text>
      </div>
    </div>
  )
}

const OrderFullPage = () => {
  const router = useRouter()
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: getOrders,
  })

  const orders = ordersData?.results || []
  const activeOrders = orders.filter(
    (o: any) => !['DELIVERED', 'REJECTED', 'CANCELLED'].includes(o.status)
  )
  const historyOrders = orders.filter((o: any) =>
    ['DELIVERED', 'REJECTED', 'CANCELLED'].includes(o.status)
  )

  const renderOrderList = (list: any[]) => {
    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center px-6 py-12">
          <div className="mb-4 h-16 w-16 opacity-20">
            <ShoppingOutlined style={{ fontSize: 64, color: '#999' }} />
          </div>
          <Text className="mb-1.5 block text-[15px] font-bold text-gray-900">Buyurtmalar yo'q</Text>
          <Text className="mb-6 max-w-[240px] text-center text-[12.5px] text-gray-400">
            Hozircha bu bo'limda hech qanday buyurtma mavjud emas.
          </Text>
          <Button
            onClick={() => router.push('/')}
            className="h-11 w-full rounded-2xl border-none bg-[#111] font-bold text-white transition-all active:scale-95"
          >
            Xarid qilishni boshlash
          </Button>
        </div>
      )
    }

    return (
      <div className="animate-fade-up pt-2">
        {list.map((order) => (
          <OrderCard key={order.uuid} order={order} />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24 pt-4">
      <div className="mb-1 px-4 sm:mb-5">
        <Title
          level={2}
          className="!m-0 text-[19px] font-extrabold tracking-tight text-gray-900 lg:text-[28px]"
        >
          Buyurtmalarim
        </Title>
        <Text className="text-[12.5px] text-gray-400">Barcha buyurtmalaringiz bir joyda</Text>
      </div>

      <main>
        {isLoading ? (
          <div className="space-y-4 px-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-[24px] border border-gray-50 bg-white p-5">
                <Skeleton active avatar paragraph={{ rows: 2 }} />
              </div>
            ))}
          </div>
        ) : (
          <Tabs
            defaultActiveKey="active"
            centered
            className="orders-pill-tabs"
            items={[
              {
                key: 'active',
                label: (
                  <div className="flex items-center gap-2 px-4 py-1.5">
                    <span className="text-[13px]">Joriy</span>
                    {activeOrders.length > 0 && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#111] text-[10px] font-bold text-white">
                        {activeOrders.length}
                      </span>
                    )}
                  </div>
                ),
                children: <div className="px-4">{renderOrderList(activeOrders)}</div>,
              },
              {
                key: 'history',
                label: (
                  <div className="flex items-center gap-2 px-4 py-1.5">
                    <span className="text-[13px]">Tarix</span>
                  </div>
                ),
                children: <div className="px-4">{renderOrderList(historyOrders)}</div>,
              },
            ]}
          />
        )}
      </main>

      <style jsx global>{`
        .orders-pill-tabs .ant-tabs-nav {
          margin-bottom: 20px !important;
          background: transparent !important;
        }
        .orders-pill-tabs .ant-tabs-nav-wrap {
          display: flex;
          justify-content: center;
          background: #f3f3f3;
          margin: 0 16px;
          border-radius: 16px;
          padding: 4px;
        }
        .orders-pill-tabs .ant-tabs-nav-list {
          width: 100%;
          display: flex;
        }
        .orders-pill-tabs .ant-tabs-tab {
          flex: 1;
          justify-content: center;
          margin: 0 !important;
          padding: 0 !important;
          border-radius: 12px;
          transition: all 0.2s;
        }
        .orders-pill-tabs .ant-tabs-tab-active {
          background: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .orders-pill-tabs .ant-tabs-ink-bar {
          display: none;
        }
        .orders-pill-tabs .ant-tabs-tab-btn {
          color: #888 !important;
          font-weight: 600 !important;
        }
        .orders-pill-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #111 !important;
        }
        @media (max-width: 767px) {
          .orders-pill-tabs .ant-tabs-nav {
            margin-bottom: 0px !important;
          }
        }
      `}</style>
    </div>
  )
}

export default OrderFullPage
