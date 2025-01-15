import type { DateRange } from './date'

export type VendorLedger = {
  vendorId?: string
  fileType?: string
  email?: string
  dateRange?: DateRange
}

export type DistributorLedger = {
  distributorId?: string
  fileType?: string
  email?: string
  dateRange?: DateRange
}
