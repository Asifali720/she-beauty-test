import type { Distributor } from './distributor'

export type Adjustment = {
  adjustment_number?: number
  _id?: string
  distributor?: Distributor
  photo?: any
  amount?: string
  note?: string
  createdAt?: string
  updatedAt?: string
}

export type AdjustmentService = {
  _id?: string
  distributor?: string
  amount?: string
  note?: string
  createdAt?: string
  updatedAt?: string
}
