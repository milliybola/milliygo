import { Avatar, Button, Flex, Popover, Typography } from 'antd'
import { memo, useContext, useEffect, useState } from 'react'

import type { FC } from 'react'

import ArrowDown from '@/components/icons/arrow-down'
import BriefcaseIcon from '@/components/icons/briefcase'
import CommentIcon from '@/components/icons/comment'
import HotelIcon from '@/components/icons/hotel'
import LogoutIcon from '@/components/icons/logout'
import UserRoundedIcon from '@/components/icons/user-rounded-icon'
import { AuthContext } from '@/features/Account/auth/context/authContext'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import CustomModal from '@/components/common/CModal'
import NotificationIcon from '@/components/icons/notification'
import FavoriteIcon from '@/components/icons/favorite'
import ComplaintIcon from '@/components/icons/complaints-icon'
import GuideIcon from '@/components/icons/guide-icon'

interface AuthStore {
  logout: () => void
  userInfo: {
    id: number
    full_name: string
    last_login: string
    is_guide: boolean
    is_superuser: boolean
    username: string
    first_name: string
    middle_name: string
    last_name: string
    email: string
    avatar: string
    phone: string
    passport_sn: string
    passport_given_by: string
    passport_expire_date: string
    position: string
    address: string
    is_staff: boolean
    is_active: boolean
    date_joined: string
    region: string
    district: string
    type: string
    deleted: string
    deleted_by_cascade: boolean
    birth_date: string
    gender: string
    unsubscribe_reason: string
    created_at: string
    updated_at: string
    organization: string
    country: string
    passport_first_name: string
    passport_last_name: string
    groups: { id: number; name: string }[]
    phone_number: string
  }
}

const ProfileMenuPopover: FC<{ light?: boolean }> = ({ light }) => {
  const [name, setName] = useState('My account')
  const authContext = useContext(AuthContext)
  const { authStore } = authContext as { authStore: AuthStore }
  const { logout, userInfo } = authStore
  const [openModal, setOpenModal] = useState(false)
  const t = useTranslations('')
  const [showPopover, setShowPopover] = useState(false)

  const permissionForCreatingApartment = userInfo?.groups?.find(
    (group: any) => group.name === 'Apartment create'
  )

  useEffect(() => {
    setName(
      userInfo?.full_name
    )
  }, [userInfo])

  if (!authContext) {
    return null
  }

  return (
    <>
      <Popover
        classNames={{ root: 'max-w-[225px] p-0', body: 'p-1 overflow-hidden' }}
        open={showPopover}
        onOpenChange={setShowPopover}
        content={
          <Flex vertical>
            {/* <Link href="/account/account-management" aria-label={`open management route`}>
              <button
                onClick={() => setShowPopover(false)}
                type="button"
                className="flex w-full items-center gap-2 rounded-xl p-4 text-start text-sm font-medium text-primary-dark hover:bg-secondary-light"
                aria-label={t('account-management.title')}
              >
                <UserRoundedIcon className="text-xl text-secondary" />
                {t('account-management.title')}
              </button>
            </Link> */}

            {/* <Link href="/account/booking" aria-label={`open booking route`}>
              <button
                aria-label={t('booking.title')}
                onClick={() => setShowPopover(false)}
                type="button"
                className="flex w-full items-center gap-2 rounded-xl p-4 text-start text-sm font-medium text-primary-dark hover:bg-secondary-light"
              >
                <BriefcaseIcon className="text-xl text-secondary" />
                {t('booking.title')}
              </button>
            </Link>

            {permissionForCreatingApartment && (
              <Link href="/account/properties" aria-label={`open properties route`}>
                <button
                  type="button"
                  aria-label={t('my-properties.title')}
                  onClick={() => setShowPopover(false)}
                  className="flex w-full items-center gap-2 rounded-xl p-4 text-start text-sm font-medium text-primary-dark hover:bg-secondary-light"
                >
                  <HotelIcon className="text-xl text-secondary" />
                  {t('my-properties.title')}
                </button>
              </Link>
            )} */}
            {/* <Link href="/account/properties">
              <button
                type="button"
                onClick={() => setShowPopover(false)}
                className="flex w-full text-primary-dark items-center gap-2 p-4 text-sm hover:bg-secondary-light rounded-xl text-start font-medium"
              >
                <HotelIcon className="w-4" />
                {t('my-properties.title')}
              </button>
            </Link> */}
            {/* <Link href="/account/reviews" aria-label={`open reviews route`}>
              <button
                type="button"
                aria-label={t('reviews.title')}
                onClick={() => setShowPopover(false)}
                className="flex w-full items-center gap-2 rounded-xl p-4 text-start text-sm font-medium text-primary-dark hover:bg-secondary-light"
              >
                <CommentIcon className="text-xl text-secondary" />
                {t('reviews.title')}
              </button>
            </Link>

            <Link href="/account/notifications" aria-label={`open notifications route`}>
              <button
                aria-label={t('others.notifications')}
                onClick={() => setShowPopover(false)}
                type="button"
                className="flex w-full items-center gap-2 rounded-xl p-4 text-start text-sm font-medium text-primary-dark hover:bg-secondary-light"
              >
                <NotificationIcon className="text-xl text-secondary" />
                {t('others.notifications')}
              </button>
            </Link>

            <Link href="/account/favorites" aria-label={`open favorites route`}>
              <button
                aria-label={t('others.saved')}
                onClick={() => setShowPopover(false)}
                type="button"
                className="flex w-full items-center gap-2 rounded-xl p-4 text-start text-sm font-medium text-primary-dark hover:bg-secondary-light"
              >
                <FavoriteIcon className="text-xl text-secondary" />
                {t('others.saved')}
              </button>
            </Link>
            <Link href="/account/complaints" aria-label={`open complaints route`}>
              <button
                aria-label={t('account-complaints.title')}
                onClick={() => setShowPopover(false)}
                type="button"
                className="flex w-full items-center gap-2 rounded-xl p-4 text-start text-sm font-medium text-primary-dark hover:bg-secondary-light"
              >
                <ComplaintIcon className="text-xl text-secondary" />
                {t('account-complaints.title')}
              </button>
            </Link>
            {userInfo?.is_guide ? (
              <Link href="/guide-account" aria-label={`open guide account route`}>
                <button
                  aria-label="Gid hisobi"
                  onClick={() => setShowPopover(false)}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-xl p-4 text-start text-sm font-medium text-primary-dark hover:bg-secondary-light"
                >
                  <GuideIcon className="text-xl text-secondary" />
                  {t('guides.guide-acc')}
                </button>
              </Link>
            ) : null} */}

            <button
              aria-label={t('buttons.log-out')}
              type="button"
              onClick={() => {
                setOpenModal(true)
                setShowPopover(false)
              }}
              className="flex w-full items-center gap-2 rounded-xl p-4 text-start text-sm font-medium text-danger hover:bg-secondary-light"
            >
              <LogoutIcon className="text-xl" />
              {t('buttons.log-out')}
            </button>
          </Flex>
        }
        trigger="click"
      >
        <button onClick={() => setShowPopover(true)} aria-label="account">
          <Flex align="center" gap={8}>
            <Avatar size={48} src={`${userInfo?.avatar}`} alt="user avatar image" />

            <div className="flex flex-col justify-start items-start">
              <Typography.Text className={`hidden font-bold lg:block ${!light ? 'text-white' : ''}`}>
                {name}
              </Typography.Text>
              <Typography.Text className={`hidden lg:block text-[12px] ${!light ? 'text-white' : ''}`}>
                {userInfo?.phone_number}
              </Typography.Text>
            </div>
            <ArrowDown className="hidden text-[10px] lg:block" />
          </Flex>
        </button>
      </Popover>

      <CustomModal
        width={600}
        modalTitle={t('others.log-out')}
        modalDesc={t('others.log-out-desc')}
        open={openModal}
        onOk={() => setOpenModal(false)}
        onCancel={() => setOpenModal(false)}
      >
        <div className="grid grid-cols-2 gap-8">
          <Button
            aria-label={t('buttons.cancel')}
            className="h-[58px] rounded-2xl bg-secondary-light/10 font-medium text-primary-dark shadow-none"
            onClick={() => {
              setOpenModal(false)
            }}
          >
            {t('buttons.cancel')}
          </Button>
          <Button
            aria-label={t('buttons.log-out')}
            onClick={() => {
              logout()
              setOpenModal(false)
            }}
            type="primary"
            className="h-[58px] rounded-2xl bg-[#FF4E4E] shadow-none hover:!bg-[#FF4E4E]/70"
          >
            {t('buttons.log-out')}
          </Button>
        </div>
      </CustomModal>
    </>
  )
}

export default memo(ProfileMenuPopover)
