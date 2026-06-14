import { Typography, Tabs, Tag, Skeleton, Empty, Button } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { getOrders } from '@/features/Cart/api'
import { useRouter } from 'next/router'
import { ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, ShoppingOutlined, RightOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const { Title, Text } = Typography

// Status mapping and styling
const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    PENDING: { label: 'Kutilmoqda', color: 'blue', icon: <ClockCircleOutlined /> },
    ACCEPTED: { label: 'Tasdiqlandi', color: 'cyan', icon: <CheckCircleOutlined /> },
    PREPARING: { label: 'Tayyorlanmoqda', color: 'orange', icon: <ClockCircleOutlined /> },
    READY: { label: 'Tayyor', color: 'green', icon: <CheckCircleOutlined /> },
    READY_FOR_PICKUP: { label: 'Olib ketishga tayyor', color: 'lime', icon: <CheckCircleOutlined /> },
    PICKED_UP: { label: 'Kuryer qabul qildi', color: 'blue', icon: <ClockCircleOutlined /> },
    ON_THE_WAY: { label: 'Yo\'lda', color: 'purple', icon: <ClockCircleOutlined /> },
    DELIVERING: { label: 'Yetkazilmoqda', color: 'purple', icon: <ClockCircleOutlined /> },
    DELIVERED: { label: 'Yetkazildi', color: 'success', icon: <CheckCircleOutlined /> },
    REJECTED: { label: 'Rad etildi', color: 'error', icon: <CloseCircleOutlined /> },
    CANCELLED: { label: 'Bekor qilindi', color: 'default', icon: <CloseCircleOutlined /> }
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
            className="bg-white rounded-[24px] border border-gray-100 p-4 mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-all cursor-pointer"
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100">
                        <img 
                            src={restaurant?.logo || '/placeholder-logo.png'} 
                            alt={restaurant?.name} 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col">
                        <Text className="text-[15px] font-bold text-gray-900 leading-tight">
                            {restaurant?.name || order.partner_name || "Noma'lum"}
                        </Text>
                        <Text className="text-[11px] text-gray-400">
                            №{order.id} • {dayjs(order.created_at).format('DD.MM.YYYY')}
                        </Text>
                    </div>
                </div>
                <Tag 
                    color={config.color} 
                    className="m-0 rounded-lg px-2 py-0.5 text-[11px] font-bold border-none"
                >
                    {config.label.toUpperCase()}
                </Tag>
            </div>

            <div className="py-3 border-y border-gray-50/50">
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex -space-x-3">
                        {order.items?.slice(0, 3).map((item: any) => (
                            <div 
                                key={item.uuid} 
                                className="h-7 w-7 rounded-full ring-2 ring-white bg-gray-50 overflow-hidden"
                            >
                                <img 
                                    src={item.product?.images?.[0]?.image || '/placeholder-food.png'} 
                                    alt="" 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                    <Text className="text-[13px] text-gray-500 font-medium font-bold">
                        {order.items?.length} ta mahsulot
                    </Text>
                </div>
                <div className="space-y-1.5 text-[12px] text-gray-500 pt-2.5 border-t border-gray-50/50">
                    <div className="flex justify-between">
                        <span>Mahsulotlar summasi:</span>
                        <span className="font-semibold text-gray-900">{fmt(Number(order.total_price) - Number(order.delivery_fee))} UZS</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Yetkazib berish:</span>
                        <span className="font-semibold text-gray-900">
                            {Number(order.delivery_fee) === 0 ? "Bepul" : `${fmt(order.delivery_fee)} UZS`}
                        </span>
                    </div>
                    <div className="flex justify-between text-[14px] font-extrabold text-[#111] pt-1">
                        <span>Jami:</span>
                        <span>{fmt(order.total_price)} UZS</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center pt-3">
                <Text className="text-[13px] font-bold text-blue-600 flex items-center gap-1">
                    Batafsil ma'lumot <RightOutlined className="text-[10px]" />
                </Text>
            </div>
        </div>
    )
}

const OrderFullPage = () => {
    const router = useRouter()
    const { data: ordersData, isLoading } = useQuery({
        queryKey: ['my-orders'],
        queryFn: getOrders
    })

    const orders = ordersData?.results || []
    const activeOrders = orders.filter((o: any) => !['DELIVERED', 'REJECTED', 'CANCELLED'].includes(o.status))
    const historyOrders = orders.filter((o: any) => ['DELIVERED', 'REJECTED', 'CANCELLED'].includes(o.status))

    const renderOrderList = (list: any[]) => {
        if (list.length === 0) {
            return (
                <div className="py-16 flex flex-col items-center justify-center px-6">
                    <div className="w-24 h-24 mb-6 opacity-20">
                        <ShoppingOutlined style={{ fontSize: 96, color: '#999' }} />
                    </div>
                    <Text className="text-[18px] font-bold text-gray-900 block mb-2">
                        Buyurtmalar yo'q
                    </Text>
                    <Text className="text-[14px] text-gray-400 mb-8 text-center max-w-[240px]">
                        Hozircha bu bo'limda hech qanday buyurtma mavjud emas.
                    </Text>
                    <Button 
                        onClick={() => router.push('/')}
                        className="w-full bg-[#111] border-none text-white font-bold h-12 rounded-2xl active:scale-95 transition-all"
                    >
                        Xarid qilishni boshlash
                    </Button>
                </div>
            )
        }

        return (
            <div className="pt-2 animate-fade-up">
                {list.map(order => (
                    <OrderCard key={order.uuid} order={order} />
                ))}
            </div>
        )
    }

    return (
        <div className="pb-24 pt-4 min-h-screen">
            <div className="px-4 mb-6">
                <Title level={2} className="!m-0 text-[28px] font-extrabold tracking-tight text-gray-900">
                    Buyurtmalarim
                </Title>
                <Text className="text-gray-400 text-[14px]">Barcha buyurtmalaringiz bir joyda</Text>
            </div>

            <main>
                {isLoading ? (
                    <div className="px-4 space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white p-5 rounded-[24px] border border-gray-50">
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
                                    <div className="flex items-center gap-2 px-6 py-2">
                                        <span className="text-[14px]">Joriy</span>
                                        {activeOrders.length > 0 && (
                                            <span className="bg-[#111] text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
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
                                    <div className="flex items-center gap-2 px-6 py-2">
                                        <span className="text-[14px]">Tarix</span>
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
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
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
            `}</style>
        </div>
    )
}

export default OrderFullPage
