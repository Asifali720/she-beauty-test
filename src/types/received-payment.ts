import type { Distributor } from './distributor'

export type ReceivedPayment = {
  received_payment_number?: number
  _id?: string
  distributor?: Distributor
  amount?: string
  screenshot?: any
  note?: string
  payment_date?: string
  createdAt?: string
  updatedAt?: string
  deletedAt?: string
}

export type ReceivedPaymentService = {
  _id?: string
  distributor?: string
  amount?: string
  screenshot?: any
  note?: string
  payment_date?: string
  createdAt?: string
  deletedAt?: string
}
