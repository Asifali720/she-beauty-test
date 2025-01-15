import type { Bill } from '@/types/bill'
import { axiosInstance } from './axiosCofig'

export const getBills = (
  pageNo: number | undefined,
  rowsPerPage: number,
  startDate?: Date | null,
  endDate?: Date | null
) => {
  if (startDate && endDate)
    return axiosInstance
      .get(`/admin/bills/all-bills?pageNo=${pageNo}&size=${rowsPerPage}&startDate=${startDate}&endDate=${endDate}`)
      .then(res => res.data)
  else return axiosInstance.get(`/admin/bills/all-bills?pageNo=${pageNo}&size=${rowsPerPage}`).then(res => res.data)
}

export const getBillsItem = (_id: string) => {
  return axiosInstance.get(`/admin/bills/bill-items?bill_id=${_id}`).then(res => res.data)
}

export const getBillsIngredients = (_id: string) => {
  return axiosInstance.get(`/admin/bills/bill-ingredients?bill_id=${_id}`).then(res => res.data)
}

export const addBill = ({ vendorId, raw_items, bill_image, ingredients, totalCost, bill_date }: Bill) => {
  const formData = new FormData()

  formData.append('vendor', vendorId!)
  formData.append('bill_image', bill_image?.[0])
  formData.append('rawItems', JSON.stringify(raw_items))
  formData.append('ingredients', JSON.stringify(ingredients))
  formData.append('totalCost', String(totalCost))
  formData.append('bill_date', String(bill_date))

  return axiosInstance.post(`/admin/bills/add`, formData).then(res => res.data)
}

export const updateBill = ({ _id, vendorId, raw_items, bill_image, ingredients, totalCost, bill_date }: Bill) => {
  const formData = new FormData()
  const image = typeof bill_image !== 'string' && bill_image?.[0]

  formData.append('vendor', vendorId!)
  formData.append('billId', _id!)
  formData.append('rawItems', JSON.stringify(raw_items))
  formData.append('ingredients', JSON.stringify(ingredients))
  formData.append('totalCost', String(totalCost))
  formData.append('bill_date', String(bill_date))

  if (image) formData.append('bill_image', image)

  return axiosInstance.post(`/admin/bills/update`, formData).then(res => res.data)
}

export const searchBills = (search: string | undefined) => {
  return axiosInstance.get(`/admin/bills/search?search=${search}`).then(res => res.data)
}

export const deleteBill = (billId: string | undefined) => {
  return axiosInstance.post(`/admin/bills/delete?bill_id=${billId}`).then(res => res.data)
}

export const getBillById = (BillId: string | undefined) => {
  return axiosInstance.get(`/admin/bills/by-id?id=${BillId}`)
}
