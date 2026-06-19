import request from '@/utils/axios'
import { ICategoryResponse } from '../../Main/types'

export async function getRestaurantDetail({ uuid }: { uuid: string }): Promise<any> {
  const res: any = await request({
    url: `/partner/${uuid}/`,
    method: 'get',
  })

  return res
}
export async function getStoreItemCategories({ id }: { id: string }): Promise<ICategoryResponse> {
  const res: ICategoryResponse = await request({
    url: `/partner/category/?partner=${id}`,
    method: 'get',
  })

  return res
}

export async function getProducts({
  uuid,
  categoryUuid,
}: {
  uuid: string
  categoryUuid: string
}): Promise<any> {
  const res: any = await request({
    url: `/products/?partner=${uuid}&category=${categoryUuid}`,
    method: 'get',
  })

  return res
}

export async function createOrder(data: any): Promise<any> {
  const res = await request({
    url: '/orders/',
    method: 'post',
    data,
  })

  return res
}

export async function rateCourier(
  orderUuid: string,
  data: { score: number; comment: string }
): Promise<any> {
  const res = await request({
    url: `/api/orders/${orderUuid}/rate-courier/`,
    method: 'post',
    data,
  })

  return res
}
