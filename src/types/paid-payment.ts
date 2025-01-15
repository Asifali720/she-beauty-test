import type { Vendor } from './vendor'

export type PaidPayment = {
  _id?: string
  vendor?: Vendor
  amount?: string
  screenshot?: any
  note?: string
  payment_date?: string
  createdAt?: string
  updatedAt?: string
  deletedAt?: string
}

export type PaidPaymentService = {
  _id?: string
  vendor?: string
  amount?: string
  screenshot?: any
  note?: string
  payment_date?: string
  createdAt?: string
  deletedAt?: string
}
