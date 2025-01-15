import type { Vendor } from '@/types/vendor'
import { axiosInstance } from './axiosCofig'

export const getVendors = (pageNo: number | undefined, rowsPerPage: number) => {
  return axiosInstance.get(`/admin/vendors/all-vendors?pageNo=${pageNo}&size=${rowsPerPage}`).then(res => res.data)
}

export const getVendorsLegder = (
  vendorId: string,
  pageNo: number | undefined,
  rowsPerPage: number,
  startDate?: Date | null,
  endDate?: Date | null
) => {
  if (startDate && endDate)
    return axiosInstance
      .get(
        `/admin/vendors/ledger?pageNo=${pageNo}&size=${rowsPerPage}&startDate=${startDate}&endDate=${endDate}&id=${vendorId}`
      )
      .then(res => res.data)
  else
    return axiosInstance
      .get(`/admin/vendors/ledger?pageNo=${pageNo}&size=${rowsPerPage}&id=${vendorId}`)
      .then(res => res.data)
}

export const searchVendors = (search: string | undefined, status?: string) => {
  if (status) return axiosInstance.get(`/admin/vendors/search?status=${status}&search=${search}`).then(res => res.data)
  else return axiosInstance.get(`/admin/vendors/search?search=${search}`).then(res => res.data)
}

export const addVendor = async ({ name, phone_no, note, email, address, photo }: Vendor) => {
  const formData = new FormData()

  formData.append('name', name!)

  if (phone_no) formData.append('phone_no', phone_no!)
  if (note) formData.append('note', note!)
  if (email) formData.append('email', email!)
  if (address) formData.append('address', address!)
  if (photo) formData.append('photo', photo?.[0] || '')

  return await axiosInstance.post(`/admin/vendors/add`, formData).then(res => res.data)
}

export const updateVendor = async ({ name, phone_no, note, email, address, photo, _id }: Vendor) => {
  const formData = new FormData()

  const image = typeof photo !== 'string' ? photo?.[0] : ''

  formData.append('name', name!)
  formData.append('vendorId', _id!)

  if (phone_no) formData.append('phone_no', phone_no!)
  if (note) formData.append('note', note!)
  if (email) formData.append('email', email!)
  if (address) formData.append('address', address!)
  if (image) formData.append('photo', image)

  return await axiosInstance.post(`/admin/vendors/update`, formData).then(res => res.data)
}

export const restoreVendor = (vendorId: string | undefined) => {
  return axiosInstance.post(`/admin/vendors/recover-trash`, { vendorId })
}

export const getTrashVendors = (pageNo: number | undefined, rowsPerPage: number) => {
  return axiosInstance.get(`/admin/vendors/trash-items?pageNo=${pageNo}&size=${rowsPerPage}`).then(res => res.data)
}

export const deleteVendor = (vendorId: string | undefined) => {
  return axiosInstance.post(`/admin/vendors/delete`, { vendorId })
}

export const getVendorById = (VendorId: string | undefined) => {
  return axiosInstance.get(`/admin/vendors/by-id?id=${VendorId}`)
}
