import type { RawItems } from '@/types/rawItems'
import { axiosInstance } from './axiosCofig'

export const getRawItems = (pageNo: number | undefined, rowsPerPage: number) => {
  return axiosInstance.get(`/admin/raw-items/all-items?pageNo=${pageNo}&size=${rowsPerPage}`).then(res => res.data)
}

export const searchRawItems = (search: string | undefined, status?: string) => {
  if (status)
    return axiosInstance.get(`/admin/raw-items/search?status=${status}&search=${search}`).then(res => res.data)
  else return axiosInstance.get(`/admin/raw-items/search?search=${search}`).then(res => res.data)
}

export const getTrashRawItems = (pageNo: number | undefined, rowsPerPage: number) => {
  return axiosInstance.get(`/admin/raw-items/trash-items?pageNo=${pageNo}&size=${rowsPerPage}`).then(res => res.data)
}

export const addRawItems = async ({ name, sku, photo }: RawItems) => {
  const formData = new FormData()

  formData.append('name', name!)
  formData.append('sku', sku!)
  if (photo) formData.append('photo', photo?.[0])

  return await axiosInstance.post(`/admin/raw-items/add`, formData).then(res => res.data)
}

export const updateRawItems = async ({ name, sku, photo }: RawItems) => {
  const formData = new FormData()

  const image = typeof photo !== 'string' && photo?.[0]

  formData.append('name', name!)
  formData.append('sku', sku!)

  if (image) formData.append('photo', image)

  return await axiosInstance.post(`/admin/raw-items/update`, formData).then(res => res.data)
}

export const deleteRawItems = (rawItemId: string | undefined) => {
  return axiosInstance.post(`/admin/raw-items/delete`, { rawItemId })
}

export const recoverTrashRawItems = (rawItemId: string | undefined) => {
  return axiosInstance.post(`/admin/raw-items/recover-trash`, { rawItemId })
}
