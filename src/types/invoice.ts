import type { Distributor } from './distributor'
import type { Product } from './product'

export type Invoice = {
  invoice_number?: number
  _id?: string
  distributorId?: string
  invoice_amount?: string
  distributor?: Distributor
  products?: Product[]
  updatedAt?: string
  createdAt?: string
  total_items?: number
  totalCost?: number
  distributorPhoto?: any
  due_date?: string
  invoice_date?: string
}

export type InvoiceItems = {
  _id?: string
  invoice_id?: string
  qty?: number
  cost?: number
  product: Product
}
