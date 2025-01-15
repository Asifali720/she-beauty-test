import { axiosInstance } from './axiosCofig'
import type { AdjustmentService } from '@/types/adjustment'

export const getAdjustments = (
  pageNo: number | undefined,
  rowsPerPage: number,
  startDate?: Date | null,
  endDate?: Date | null
) => {
  if (startDate && endDate)
    return axiosInstance
      .get(
        `/admin/adjustments/all-adjustments?pageNo=${pageNo}&size=${rowsPerPage}&startDate=${startDate}&endDate=${endDate}`
      )
      .then(res => res.data)
  else
    return axiosInstance
      .get(`/admin/adjustments/all-adjustments?pageNo=${pageNo}&size=${rowsPerPage}`)
      .then(res => res.data)
}

export const addAdjustment = async ({ distributor, amount, note }: AdjustmentService) => {
  const formData = new FormData()

  formData.append('distributor', distributor!)
  formData.append('amount', amount!)
  if (note) formData.append('note', note!)

  return await axiosInstance.post(`/admin/adjustments/add`, formData).then(res => res.data)
}

export const UpdateAdjustment = async ({ _id, distributor, amount, note }: AdjustmentService) => {
  const formData = new FormData()

  formData.append('distributor', distributor!)
  if (note) formData.append('note', note!)
  formData.append('amount', amount!)
  formData.append('adjustmentId', _id!)

  return await axiosInstance.post(`/admin/adjustments/update`, formData).then(res => res.data)
}

export const deleteAdjustment = (adjustmentId: string | undefined) => {
  return axiosInstance.post(`/admin/adjustments/delete?adjustmentId=${adjustmentId}`)
}

export const searchAdjustment = (search: string | undefined) => {
  return axiosInstance.get(`/admin/adjustments/search?search=${search}`).then(res => res.data)
}
