import type { Ingredient } from '@/types/ingredient'
import { axiosInstance } from './axiosCofig'

export const getIngredients = (pageNo: number | undefined, rowsPerPage: number) => {
  return axiosInstance
    .get(`/admin/ingredients/all-ingredients?pageNo=${pageNo}&size=${rowsPerPage}`)
    .then(res => res.data)
}

export const searchIngredient = (search: string | undefined, status?: string) => {
  if (status)
    return axiosInstance.get(`/admin/ingredients/search?status=${status}&search=${search}`).then(res => res.data)
  else return axiosInstance.get(`/admin/ingredients/search?search=${search}`).then(res => res.data)
}

export const getTrashIngredient = (pageNo: number | undefined, rowsPerPage: number) => {
  return axiosInstance.get(`/admin/ingredients/trash-items?pageNo=${pageNo}&size=${rowsPerPage}`).then(res => res.data)
}

export const addIngredient = async ({ name, sku, photo, measurement_unit }: Ingredient) => {
  const formData = new FormData()

  formData.append('name', name!)
  formData.append('sku', sku!)
  formData.append('measurement_unit', measurement_unit!)

  if (photo) formData.append('photo', photo?.[0])

  return await axiosInstance.post(`/admin/ingredients/add`, formData).then(res => res.data)
}

export const updateIngredient = async ({ name, sku, photo, measurement_unit, quantity }: Ingredient) => {
  const formData = new FormData()

  const image = typeof photo !== 'string' && photo?.[0]

  formData.append('name', name!)
  formData.append('sku', sku!)
  formData.append('measurement_unit', measurement_unit!)

  if (quantity) formData.append('quantity', String(quantity)!)

  if (image) formData.append('photo', image)

  return await axiosInstance.post(`/admin/ingredients/update`, formData).then(res => res.data)
}

export const deleteIngredient = (ingredientId: string | undefined) => {
  return axiosInstance.post(`/admin/ingredients/delete`, { ingredientId })
}

export const recoverTrashIngredient = (ingredientId: string | undefined) => {
  return axiosInstance.post(`/admin/ingredients/recover-trash`, { ingredientId })
}
