import { axiosInstance } from './axiosCofig'
import type { PaidPaymentService } from '@/types/paid-payment'

export const getPaidPayments = (
  pageNo: number | undefined,
  rowsPerPage: number,
  startDate?: Date | null,
  endDate?: Date | null
) => {
  if (startDate && endDate)
    return axiosInstance
      .get(
        `/admin/paid-payments/all-paid-payments?pageNo=${pageNo}&size=${rowsPerPage}&startDate=${startDate}&endDate=${endDate}`
      )
      .then(res => res.data)
  else
    return axiosInstance
      .get(`/admin/paid-payments/all-paid-payments?pageNo=${pageNo}&size=${rowsPerPage}`)
      .then(res => res.data)
}

export const addPaidPayment = async ({ vendor, amount, screenshot, note, payment_date }: PaidPaymentService) => {
  const formData = new FormData()

  formData.append('vendor', vendor!)
  formData.append('payment_date', payment_date!)
  formData.append('amount', amount!)
  formData.append('screenshot', screenshot?.[0])
  if (note) formData.append('note', note!)

  return await axiosInstance.post(`/admin/paid-payments/add`, formData).then(res => res.data)
}

export const UpdatePaidPayment = async ({
  _id,
  vendor,
  amount,
  screenshot,
  note,
  payment_date
}: PaidPaymentService) => {
  const formData = new FormData()

  const image = typeof screenshot !== 'string' && screenshot?.[0]

  formData.append('vendor', vendor!)
  if (note) formData.append('note', note!)
  formData.append('amount', amount!)
  formData.append('payment_date', payment_date!)
  formData.append('paidPaymentId', _id!)

  if (image) formData.append('screenshot', image)

  return await axiosInstance.post(`/admin/paid-payments/update`, formData).then(res => res.data)
}

export const deletePaidPayment = (paidPaymentId: string | undefined) => {
  return axiosInstance.post(`/admin/paid-payments/delete?paidPaymentId=${paidPaymentId}`)
}

export const searchPaidPayment = (search: string | undefined) => {
  return axiosInstance.get(`/admin/paid-payments/search?search=${search}`).then(res => res.data)
}
