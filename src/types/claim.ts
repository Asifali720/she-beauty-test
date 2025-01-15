import type { Distributor } from './distributor'
import type { Product } from './product'

export type Claim = {
  claim_number?: number
  _id?: string
  distributorId?: string
  total_cost?: number
  distributor?: Distributor
  products?: Product[]
  claimed_at?: string
  createdAt?: string
  note?: string
  total_items?: number
  distributorPhoto?: any
}

export type ClaimItems = {
  _id?: string
  claim_id?: string
  qty?: number
  cost?: number
  product: Product
}
