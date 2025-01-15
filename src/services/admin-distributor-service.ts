import type { Distributor } from '@/types/distributor'
import { axiosInstance } from './axiosCofig'

export const getDistributor = (pageNo: number | undefined, rowsPerPage: number) => {
  return axiosInstance
    .get(`/admin/distributors/all-distributors?pageNo=${pageNo}&size=${rowsPerPage}`)
    .then(res => res.data)
}

export const getDistributorsLegder = (
  distributorId: string,
  pageNo: number | undefined,
  rowsPerPage: number,
  startDate?: Date | null,
  endDate?: Date | null
) => {
  if (startDate && endDate)
    return axiosInstance
      .get(
        `/admin/distributors/ledger?pageNo=${pageNo}&size=${rowsPerPage}&startDate=${startDate}&endDate=${endDate}&id=${distributorId}`
      )
      .then(res => res.data)
  else
    return axiosInstance
      .get(`/admin/distributors/ledger?pageNo=${pageNo}&size=${rowsPerPage}&id=${distributorId}`)
      .then(res => res.data)
}

export const getTrashDistributor = (pageNo: number | undefined, rowsPerPage: number) => {
  return axiosInstance.get(`/admin/distributors/trash-items?pageNo=${pageNo}&size=${rowsPerPage}`).then(res => res.data)
}

export const addDistributor = async ({ name, phone_no, note, email, address, photo }: Distributor) => {
  const formData = new FormData()

  formData.append('name', name!)
  if (phone_no) formData.append('phone_no', phone_no!)
  if (note) formData.append('note', note!)
  if (email) formData.append('email', email!)
  if (address) formData.append('address', address!)
  if (photo) formData.append('photo', photo?.[0] || '')

  return await axiosInstance.post(`/admin/distributors/add`, formData).then(res => res.data)
}

export const updateDistributor = async ({ name, phone_no, note, email, address, photo, _id }: Distributor) => {
  const formData = new FormData()

  const image = typeof photo !== 'string' && photo?.[0]

  formData.append('name', name!)

  formData.append('distributorId', _id!)

  if (note) formData.append('note', note!)
  if (email) formData.append('email', email!)
  if (address) formData.append('address', address!)
  if (image) formData.append('photo', image)

  if (phone_no) formData.append('phone_no', phone_no!)

  return await axiosInstance.post(`/admin/distributors/update`, formData).then(res => res.data)
}

export const searchDistributor = (search: string | undefined, status?: string) => {
  if (status)
    return axiosInstance.get(`/admin/distributors/search?status=${status}&search=${search}`).then(res => res.data)
  else return axiosInstance.get(`/admin/distributors/search?search=${search}`).then(res => res.data)
}

export const deleteDistributor = (distributorId: string | undefined) => {
  return axiosInstance.post(`/admin/distributors/delete`, { distributorId })
}

export const recoverTrashDistributor = (distributorId: string | undefined) => {
  return axiosInstance.post(`/admin/distributors/recover-trash`, { distributorId })
}

export const getDistributorById = (distributorId: string | undefined) => {
  return axiosInstance.get(`/admin/distributors/by-id?id=${distributorId}`)
}
