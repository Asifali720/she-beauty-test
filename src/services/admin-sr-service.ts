import type { SalesRepresentative } from '@/types/sales-representative'
import { axiosInstance } from './axiosCofig'

export const getSalesRepresentative = (pageNo: number | undefined, rowsPerPage: number) => {
  return axiosInstance
    .get(`/admin/sales-representatives/all-representatives?pageNo=${pageNo}&size=${rowsPerPage}`)
    .then(res => res.data)
}

export const getTrashSalesRepresentative = (pageNo: number | undefined, rowsPerPage: number) => {
  return axiosInstance
    .get(`/admin/sales-representatives/trash-items?pageNo=${pageNo}&size=${rowsPerPage}`)
    .then(res => res.data)
}

export const addSalesRepresentative = async ({ name, phone_no, note, email, address, photo }: SalesRepresentative) => {
  const formData = new FormData()

  formData.append('name', name!)

  if (phone_no) formData.append('phone_no', phone_no!)
  if (note) formData.append('note', note!)
  if (email) formData.append('email', email!)
  if (address) formData.append('address', address!)
  if (photo) formData.append('photo', photo?.[0] || '')

  return await axiosInstance.post(`/admin/sales-representatives/add`, formData).then(res => res.data)
}

export const updateSalesRepresentative = async ({
  name,
  phone_no,
  note,
  email,
  address,
  photo,
  _id
}: SalesRepresentative) => {
  const formData = new FormData()

  const image = typeof photo !== 'string' && photo?.[0]

  formData.append('name', name!)
  formData.append('representativesId', _id!)

  if (phone_no) formData.append('phone_no', phone_no!)
  if (image) formData.append('photo', image)
  if (note) formData.append('note', note!)
  if (email) formData.append('email', email!)
  if (address) formData.append('address', address!)

  return await axiosInstance.post(`/admin/sales-representatives/update`, formData).then(res => res.data)
}

export const searchSalesRepresentative = (search: string | undefined, status?: string) => {
  if (status)
    return axiosInstance
      .get(`/admin/sales-representatives/search?status=${status}&search=${search}`)
      .then(res => res.data)
  else return axiosInstance.get(`/admin/sales-representatives/search?search=${search}`).then(res => res.data)
}

export const deleteSalesRepresentative = (representativesId: string | undefined) => {
  return axiosInstance.post(`/admin/sales-representatives/delete`, { representativesId })
}

export const recoverTrashSalesRepresentative = (representativesId: string | undefined) => {
  return axiosInstance.post(`/admin/sales-representatives/recover-trash`, { representativesId })
}
