import type { Product } from '@/types/product'
import { axiosInstance } from './axiosCofig'

export const getProducts = (pageNo: number | undefined, rowsPerPage: number) => {
  return axiosInstance.get(`/admin/products/all-products?pageNo=${pageNo}&size=${rowsPerPage}`).then(res => res.data)
}

export const searchProducts = (search: string | undefined, status?: string) => {
  if (status) return axiosInstance.get(`/admin/products/search?status=${status}&search=${search}`).then(res => res.data)
  else return axiosInstance.get(`/admin/products/search?search=${search}`).then(res => res.data)
}

export const addProduct = async ({ name, sku, photo, price, raw_items }: Product) => {
  const formData = new FormData()

  formData.append('name', name!)
  formData.append('sku', sku!)
  formData.append('photo', photo?.[0])
  formData.append('price', String(price!))
  formData.append('raw_items', JSON.stringify(raw_items))

  return await axiosInstance
    .post(`/admin/products/add`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then(res => res.data)
}

export const updateProduct = async ({ name, _id, raw_items, photo, price }: Product) => {
  const formData = new FormData()

  const image = typeof photo !== 'string' && photo?.[0]

  formData.append('name', name!)
  formData.append('price', String(price!))
  formData.append('productId', _id!)
  formData.append('raw_items', JSON.stringify(raw_items))

  if (image) formData.append('photo', image)

  return await axiosInstance.post(`/admin/products/update`, formData).then(res => res.data)
}

export const restoreProduct = (productId: string | undefined) => {
  return axiosInstance.post(`/admin/products/recover-trash`, { productId })
}

export const getTrashProducts = (pageNo: number | undefined, rowsPerPage: number) => {
  return axiosInstance.get(`/admin/products/trash-products?pageNo=${pageNo}&size=${rowsPerPage}`).then(res => res.data)
}

export const deleteProduct = (productId: string | undefined) => {
  return axiosInstance.post(`/admin/products/delete`, { productId })
}

export const getProductById = (productId: string | undefined) => {
  return axiosInstance.get(`/admin/products/by-id?id=${productId}`)
}
