import type { Ingredient } from './ingredient'
import type { RawItems } from './rawItems'
import type { Vendor } from './vendor'

export type Bill = {
  _id?: string
  bill_date?: string
  vendorId?: string
  bill_amount?: string
  vendor?: Vendor
  raw_items?: RawItems[]
  ingredients?: Ingredient[]
  total_items?: number
  bill_image?: any
  createdAt?: string
  totalCost?: number
}

export type BillItems = {
  _id?: string
  bill_id?: string
  qty?: number
  cost?: number
  raw_item: RawItems
}

export type BillIngredients = {
  _id?: string
  bill_id?: string
  qty?: number
  cost?: number
  ingredient: Ingredient
}
