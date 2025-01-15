import type { Product } from './product'

export type Order = {
  total_items?: number
  _id?: string
  total_price?: number
  customer_name?: string
  phone_no?: string
  email?: string
  address?: string
  status?: string
  products?: Product
}

export type OrderItems = {
  _id?: string
  order_id?: string
  qty?: number
  cost?: number
  product: Product
}
