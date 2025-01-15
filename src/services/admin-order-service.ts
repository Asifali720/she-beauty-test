import { axiosInstance } from './axiosCofig'
import type { Order } from '@/types/order'

export const getOrders = (
  pageNo: number | undefined,
  rowsPerPage: number,
  startDate?: Date | null,
  endDate?: Date | null
) => {
  if (startDate && endDate)
    return axiosInstance
      .get(`/admin/orders/all-orders?pageNo=${pageNo}&size=${rowsPerPage}&startDate=${startDate}&endDate=${endDate}`)
      .then(res => res.data)
  else return axiosInstance.get(`/admin/orders/all-orders?pageNo=${pageNo}&size=${rowsPerPage}`).then(res => res.data)
}

export const getOrdersItem = (_id: string) => {
  return axiosInstance.get(`/admin/orders/order-items?order_id=${_id}`).then(res => res.data)
}

export const returnOrder = (order_id: string) => {
  return axiosInstance.post(`/admin/orders/return`, { order_id }).then(res => res.data)
}

export const dispatchOrder = ({ products, total_price, customer_name, phone_no, email, address }: Order) => {
  return axiosInstance
    .post(`/admin/orders/dispatch`, { products, total_price, customer_name, phone_no, email, address })
    .then(res => res.data)
}

export const searchOrders = (search: string | undefined) => {
  return axiosInstance.get(`/admin/orders/search?search=${search}`).then(res => res.data)
}
