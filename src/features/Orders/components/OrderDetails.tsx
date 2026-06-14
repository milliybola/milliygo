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
    TruckOutlined
} from '@ant-design/icons'
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps'
import { YANDEX_API_KEY } from '@/constants/api-keys'
import dayjs from 'dayjs'
import { motion, AnimatePresence } from 'framer-motion'

const { Title, Text } = Typography

const statusConfig: Record<string, { label: string; color: string; icon: any; step: number; theme: string }> = {
    PENDING: { label: 'Kutilmoqda', color: '#3B82F6', icon: <ClockCircleOutlined />, step: 0, theme: 'blue' },
    ACCEPTED: { label: 'Tasdiqlandi', color: '#06B6D4', icon: <CheckCircleOutlined />, step: 1, theme: 'cyan' },
    PREPARING: { label: 'Tayyorlanmoqda', color: '#F59E0B', icon: <LoadingOutlined />, step: 2, theme: 'orange' },
    READY: { label: 'Tayyor', color: '#10B981', icon: <CheckCircleOutlined />, step: 3, theme: 'emerald' },
    READY_FOR_PICKUP: { label: 'Olib ketishga tayyor', color: '#10B981', icon: <CheckCircleOutlined />, step: 3, theme: 'emerald' },
    PICKED_UP: { label: 'Kuryer qabul qildi', color: '#8B5CF6', icon: <TruckOutlined />, step: 4, theme: 'violet' },
    ON_THE_WAY: { label: 'Yo\'lda', color: '#8B5CF6', icon: <TruckOutlined />, step: 4, theme: 'violet' },
    DELIVERING: { label: 'Yetkazilmoqda', color: '#8B5CF6', icon: <TruckOutlined />, step: 4, theme: 'violet' },
    DELIVERED: { label: 'Yetkazildi', color: '#059669', icon: <CheckCircleOutlined />, step: 5, theme: 'success' },
    REJECTED: { label: 'Rad etildi', color: '#EF4444', icon: <InfoCircleOutlined />, step: 0, theme: 'error' },
    CANCELLED: { label: 'Bekor qilindi', color: '#6B7280', icon: <InfoCircleOutlined />, step: 0, theme: 'gray' }
}

const OrderDetails = ({ uuid }: { uuid: string }) => {
    const router = useRouter()
    const { data: orderResponse, isLoading, error } = useQuery({
        queryKey: ['order-details', uuid],
        queryFn: () => getOrderDetails(uuid),
        enabled: !!uuid,
        refetchInterval: (query: any) => {
            const status = query.state.data?.status
            return (status && !['DELIVERED', 'REJECTED', 'CANCELLED'].includes(status)) ? 10000 : false
        }
    })

    const order = orderResponse
    const config = order ? (statusConfig[order.status] || { label: order.status, color: '#6B7280', icon: null, step: 0, theme: 'gray' }) : null
    const fmt = (n: any) => Number(n).toLocaleString('uz-UZ').replace(/,/g, ' ')

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="flex items-center gap-4 mb-8">
                    <Skeleton.Button active shape="round" size="large" />
                    <div>
                        <Skeleton.Input active size="large" />
                        <div className="mt-2"><Skeleton.Input active size="small" /></div>
                    </div>
                </div>
                <Skeleton active avatar paragraph={{ rows: 12 }} className="bg-white p-8 rounded-[40px]" />
            </div>
        )
    }

    if (error || !order) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto px-4 py-24 text-center"
            >
                <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                    <InfoCircleOutlined className="text-4xl text-gray-300" />
                </div>
                <Title level={3} className="!mb-2 font-bold ring-offset-current">Buyurtma topilmadi</Title>
                <Text className="text-gray-400 block mb-8">Kechirasiz, ushbu buyurtma ma'lumotlarini topa olmadik.</Text>
                <Button
                    type="primary"
                    size="large"
                    onClick={() => router.push('/orders')}
                    className="bg-gray-900 border-none rounded-2xl h-14 px-8 font-bold hover:!bg-gray-800"
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
        { title: 'Yo\'lda', icon: <TruckOutlined /> },
        { title: 'Yetkazildi', icon: <CheckCircleOutlined /> }
    ]

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-6xl mx-auto px-4 py-8 pb-32"
        >
            {/* Header Section */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-5">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => router.push('/orders')}
                        className="rounded-2xl border-none shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] transition-all h-14 w-14 flex items-center justify-center bg-white text-gray-900"
                    />
                    <div>
                        <div className="flex items-center gap-3">
                            <Title level={3} className="!m-0 text-[28px] font-black tracking-tight text-gray-900">
                                Buyurtma №{order.id}
                            </Title>
                            {order.status === 'PENDING' && (
                                <Badge status="processing" color="#3B82F6" className="animate-pulse" />
                            )}
                        </div>
                        <Text className="text-gray-400 font-medium text-[15px]">
                            {dayjs(order.created_at).format('DD MMMM, YYYY • HH:mm')}
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
                className="bg-white rounded-[44px] p-8 sm:p-10 border border-gray-50 shadow-[0_20px_60px_rgba(0,0,0,0.03)] mb-8 relative overflow-hidden"
            >
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50/20 to-transparent rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center text-3xl shadow-[0_8px_25px_rgba(0,0,0,0.1)] transition-transform hover:scale-105`}
                            style={{ backgroundColor: config?.color, color: 'white' }}>
                            {config?.icon}
                        </div>
                        <div>
                            <Text className="text-gray-400 block mb-1 text-[12px] uppercase tracking-widest">Buyurtma holati</Text>
                            <div className="flex items-center gap-3">
                                <Title level={4} className="!m-0 font-black text-gray-900">
                                    {config?.label}
                                </Title>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 flex-1 mx-8 hidden lg:block" />

                    <div className="flex flex-col lg:items-end">
                        <Text className="text-gray-400 block mb-1 text-[12px] uppercase tracking-widest text-right">Umumiy summa</Text>
                        <div className="flex items-baseline gap-2">
                            <span className="text-[24px] font-black text-blue-600 leading-tight tracking-tighter">
                                {fmt(order.total_price)}
                            </span>
                            <span className="text-[16px] font-bold text-gray-400">UZS</span>
                        </div>
                    </div>
                </div>

                {order.status !== 'REJECTED' && order.status !== 'CANCELLED' && (
                    <div className="py-2 px-1">
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
                        className="p-6 bg-red-50/50 rounded-[28px] border-2 border-red-100 mt-6 flex gap-4 items-start"
                    >
                        <div className="w-12 h-12 bg-red-100 rounded-2xl flex-shrink-0 flex items-center justify-center text-red-500 text-xl">
                            <InfoCircleOutlined />
                        </div>
                        <div>
                            <Text className="text-red-900 font-bold block mb-1 text-[16px]">Buyurtma rad etildi</Text>
                            <Text className="text-red-600/80 font-medium">{order.reject_reason || "Kechirasiz, texnik sabablarga ko'ra buyurtmani qabul qila olmaymiz."}</Text>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Items */}
                <div className="lg:col-span-7 space-y-6">
                    <motion.div variants={itemVariants} className="bg-white rounded-[40px] p-8 sm:p-10 border border-gray-50 shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center justify-between mb-8">
                            <Title level={4} className="!m-0 font-black text-[22px]">Mahsulotlar</Title>
                            <Tag color="cyan" className="m-0 rounded-full px-4 border-none font-bold text-blue-500 bg-blue-50">
                                {order.items.length} ta mahsulot
                            </Tag>
                        </div>

                        <div className="space-y-8">
                            <AnimatePresence>
                                {order.items.map((item: any, idx: number) => (
                                    <motion.div
                                        key={item.uuid || idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 + idx * 0.1 }}
                                        className="flex gap-6 group"
                                    >
                                        <div className="w-20 h-20 rounded-[28px] bg-gray-50 overflow-hidden border border-gray-100 flex-shrink-0 transition-transform group-hover:scale-105 shadow-sm">
                                            <img
                                                src={item.product?.images?.[0]?.image || '/placeholder-food.png'}
                                                alt={item.product?.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 py-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <Text className="font-extrabold text-[18px] text-gray-900 block leading-tight">
                                                    {item.product?.name}
                                                </Text>
                                                <Text className="font-extrabold text-[18px] text-gray-900">
                                                    {fmt(Number(item.price_at_time_of_order) * item.quantity)}
                                                </Text>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Text className="text-gray-400 font-bold bg-gray-50 px-2.5 py-0.5 rounded-lg text-[13px]">
                                                    {item.quantity} x {fmt(item.price_at_time_of_order)} UZS
                                                </Text>
                                                {item.product?.discount > 0 && (
                                                    <Tag color="green" className="m-0 border-none font-bold scale-90">
                                                        -{item.product.discount}% chegirma
                                                    </Tag>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <Divider className="my-10 border-gray-100" />

                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-[16px]">
                                <Text className="text-gray-400 font-bold">Mahsulotlar summasi:</Text>
                                <Text className="font-bold text-gray-900">{fmt(Number(order.total_price) - Number(order.delivery_fee))} UZS</Text>
                            </div>
                            <div className="flex items-center justify-between text-[16px]">
                                <Text className="text-gray-400 font-bold">Yetkazib berish:</Text>
                                <Text className="font-bold text-gray-900">
                                    {Number(order.delivery_fee) === 0 ? "Bepul" : `${fmt(order.delivery_fee)} UZS`}
                                </Text>
                            </div>
                            <div className="flex items-center justify-between text-[20px] pt-4">
                                <Text className="text-gray-900 font-black">Jami:</Text>
                                <div className="text-right">
                                    <span className="text-[26px] font-black text-gray-900 leading-none">
                                        {fmt(order.total_price)}
                                    </span>
                                    <span className="text-[14px] font-bold text-gray-400 ml-1.5 align-middle">UZS</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Comment */}
                    <motion.div variants={itemVariants} className="bg-white rounded-[40px] p-8 border border-gray-50 shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-3 mb-4">
                            <ContainerOutlined className="text-gray-400 text-xl" />
                            <Title level={5} className="!m-0 font-bold">Buyurtmaga izoh</Title>
                        </div>
                        <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                            <Text className="text-gray-600 font-medium italic leading-relaxed">
                                {order.description || "Izoh ko'rsatilmagan"}
                            </Text>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Sidebar Info */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Partner Card */}
                    <motion.div variants={itemVariants} className="bg-white rounded-[40px] p-8 border border-gray-50 shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-3 mb-8">
                            <ShoppingOutlined className="text-gray-400 text-xl" />
                            <Title level={5} className="!m-0 font-black">Tashkilot</Title>
                        </div>

                        <div className="flex items-center gap-5 mb-8">
                            <div className="w-16 h-16 rounded-[24px] border-2 border-gray-50 overflow-hidden shadow-sm p-0.5">
                                <img
                                    src={order.items?.[0]?.product?.partner?.logo || '/placeholder-logo.png'}
                                    className="w-full h-full object-cover rounded-[20px]"
                                    alt={order.partner_name}
                                />
                            </div>
                            <div>
                                <Text className="font-black text-[20px] block text-gray-900 leading-tight mb-1">
                                    {order.partner_name}
                                </Text>
                                <Text className="text-gray-400 font-medium text-[14px] block flex items-center gap-1.5">
                                    <EnvironmentOutlined size={12} />
                                    {order.items?.[0]?.product?.partner?.address}
                                </Text>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <Button
                                type='primary'
                                block
                                size="large"
                                className="rounded-[20px] h-14 font-black flex items-center justify-center gap-2 border-gray-100 shadow-sm hover:!border-blue-200"
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
                    <motion.div variants={itemVariants} className="bg-white rounded-[40px] p-0 border border-gray-50 shadow-[0_10px_40px_rgba(0,0,0,0.02)] overflow-hidden">
                        <div className="p-8 pb-4">
                            <div className="flex items-center justify-between mb-6">
                                <Title level={5} className="!m-0 font-black">Yetkazib berish</Title>
                                <Tag color="blue" className="m-0 border-none font-bold rounded-lg scale-90">Kuryer orqali</Tag>
                            </div>
                        </div>

                        <div className="h-[240px] w-full relative group">
                            <YMaps query={{ apikey: YANDEX_API_KEY, lang: 'uz_UZ' as any }}>
                                <Map
                                    state={{
                                        center: [Number(order.latitude), Number(order.longitude)],
                                        zoom: 15
                                    }}
                                    width="100%"
                                    height="100%"
                                    options={{
                                        suppressMapOpenBlock: true,
                                        yandexMapDisablePoiInteractivity: true
                                    }}
                                >
                                    <Placemark
                                        geometry={[Number(order.latitude), Number(order.longitude)]}
                                        options={{
                                            preset: 'islands#yellowDotIcon',
                                            iconColor: '#3B82F6'
                                        }}
                                    />
                                </Map>
                            </YMaps>
                            {/* Overlay mask for map */}
                            <div className="absolute inset-0 bg-transparent" />
                        </div>

                        <div className="p-8 pt-6 space-y-6 bg-[#FAFBFC]">
                            <div className="flex gap-4 items-start">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm flex-shrink-0">
                                    <PushpinOutlined />
                                </div>
                                <div>
                                    <Text className="text-gray-400 block text-[13px] mb-1 font-bold uppercase tracking-wider">Yetkazish manzili</Text>
                                    <Text className="font-extrabold text-[16px] leading-tight text-gray-900 block">{order.address}</Text>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm flex-shrink-0">
                                    <PhoneOutlined />
                                </div>
                                <div>
                                    <Text className="text-gray-400 block text-[13px] mb-1 font-bold uppercase tracking-wider">Bog'lanish</Text>
                                    <Text className="font-black text-[18px] text-gray-900">{order.contact_phone}</Text>
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
                    color: #94A3B8 !important;
                    margin-top: 8px !important;
                }
                .premium-order-steps .ant-steps-item-finish .ant-steps-item-title {
                    color: #1E293B !important;
                }
                .premium-order-steps .ant-steps-item-process .ant-steps-item-title {
                    color: #3B82F6 !important;
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
                    background: #F0FDF4 !important;
                    border-color: #BBF7D0 !important;
                    color: #16A34A !important;
                    box-shadow: 0 4px 12px rgba(22, 163, 74, 0.1);
                }
                .premium-order-steps .ant-steps-item-process .ant-steps-item-icon {
                    background: #3B82F6 !important;
                    border-color: #3B82F6 !important;
                    color: white !important;
                    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
                    transform: scale(1.1);
                }
                .premium-order-steps .ant-steps-item-process .ant-steps-item-icon .ant-steps-icon {
                    color: white !important;
                }
                .premium-order-steps .ant-steps-item-wait .ant-steps-item-icon {
                    background: #F8FAFC !important;
                    border-color: #F1F5F9 !important;
                    color: #CBD5E1 !important;
                }
                .premium-order-steps .ant-steps-item-tail::after {
                    background-color: #F1F5F9 !important;
                    height: 3px !important;
                    top: 22px !important;
                    width: calc(100% - 64px) !important;
                    margin-left: 32px !important;
                }
                .premium-order-steps .ant-steps-item-finish .ant-steps-item-tail::after {
                    background-color: #BBF7D0 !important;
                }
                @media (max-width: 768px) {
                    .premium-order-steps .ant-steps-item-title {
                        font-size: 10px !important;
                    }
                }
            `}</style>
        </motion.div>
    )
}

export default OrderDetails
