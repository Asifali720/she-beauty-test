import type { RawItems } from './rawItems'

export type Product = {
  _id?: string
  name?: string
  photo?: any
  sku?: string
  quantity?: number
  price?: number
  totalQty?: number
  raw_items?: RawItems[]
  updatedAt?: string
  createdAt?: string
  deletedAt?: string
  raw_item?: RawItems[]
}
