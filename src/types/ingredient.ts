export type Ingredient = {
  status?: string
  _id?: string
  name?: string
  sku?: string
  photo?: any
  cost?: {
    highest?: number
    lowest?: number
  }
  measurement_unit?: string
  updatedAt?: string
  createdAt?: string
  deletedAt?: string
  quantity?: number
}
