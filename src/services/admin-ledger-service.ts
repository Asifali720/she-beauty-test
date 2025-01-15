import type { VendorLedger, DistributorLedger } from '@/types/ledger'
import { axiosInstance } from './axiosCofig'

export const exportVendorLedger = ({ vendorId, fileType, email, dateRange }: VendorLedger) => {
  return axiosInstance
    .post(`/admin/ledger/vendor`, {
      id: vendorId,
      fileType,
      email,
      startDate: dateRange?.startDate,
      endDate: dateRange?.endDate
    })
    .then(res => res.data)
}

export const exportDistributorLedger = ({ distributorId, fileType, email, dateRange }: DistributorLedger) => {
  return axiosInstance
    .post(`/admin/ledger/distributor`, {
      id: distributorId,
      fileType,
      email,
      startDate: dateRange?.startDate,
      endDate: dateRange?.endDate
    })
    .then(res => res.data)
}
