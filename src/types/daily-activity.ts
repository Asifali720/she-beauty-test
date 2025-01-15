import type { SalesRepresentative } from './sales-representative'

export type DailyActivity = {
  _id?: string
  visit_date?: string
  no_of_shops?: number
  no_of_orders?: number
  recovery_amount?: number
  amount_of_orders?: number
  updatedAt?: string
  createdAt?: string
  photo?: any
  deletedAt?: string
  sales_representative?: SalesRepresentative
}
