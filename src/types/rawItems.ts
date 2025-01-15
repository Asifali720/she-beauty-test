export type RawItems = {
  status?: string
  _id?: string
  name?: string
  sku?: string
  photo?: any
  updatedAt?: string
  createdAt?: string
  deletedAt?: string
  quantity?: number
  cost?: {
    highest?: number
    lowest?: number
  }
  raw_item?: RawItems
}
