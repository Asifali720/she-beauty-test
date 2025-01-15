import { axiosInstance } from './axiosCofig'
import type { ReceivedPaymentService } from '@/types/received-payment'

export const getReceivedPayments = (
  pageNo: number | undefined,
  rowsPerPage: number,
  startDate?: Date | null,
  endDate?: Date | null
) => {
  if (startDate && endDate)
    return axiosInstance
      .get(
        `/admin/received-payments/all-received-payments?pageNo=${pageNo}&size=${rowsPerPage}&startDate=${startDate}&endDate=${endDate}`
      )
      .then(res => res.data)
  else
    return axiosInstance
      .get(`/admin/received-payments/all-received-payments?pageNo=${pageNo}&size=${rowsPerPage}`)
      .then(res => res.data)
}

export const addReceivedPayment = async ({
  distributor,
  amount,
  screenshot,
  note,
  payment_date
}: ReceivedPaymentService) => {
  const formData = new FormData()

  formData.append('distributor', distributor!)
  formData.append('payment_date', payment_date!)
  formData.append('amount', amount!)
  formData.append('screenshot', screenshot?.[0])
  if (note) formData.append('note', note!)

  return await axiosInstance.post(`/admin/received-payments/add`, formData).then(res => res.data)
}

export const UpdateReceivedPayment = async ({
  _id,
  distributor,
  amount,
  screenshot,
  note,
  payment_date
}: ReceivedPaymentService) => {
  const formData = new FormData()

  const image = typeof screenshot !== 'string' && screenshot?.[0]

  formData.append('distributor', distributor!)
  if (note) formData.append('note', note!)
  formData.append('amount', amount!)
  formData.append('payment_date', payment_date!)
  formData.append('receivedPaymentId', _id!)

  if (image) formData.append('screenshot', image)

  return await axiosInstance.post(`/admin/received-payments/update`, formData).then(res => res.data)
}

export const deleteReceivedPayment = (receivedPaymentId: string | undefined) => {
  return axiosInstance.post(`/admin/received-payments/delete?receivedPaymentId=${receivedPaymentId}`)
}

export const searchReceivedPayment = (search: string | undefined) => {
  return axiosInstance.get(`/admin/received-payments/search?search=${search}`).then(res => res.data)
}
