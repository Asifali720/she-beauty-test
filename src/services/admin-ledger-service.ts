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

export const exportDistributorLedger = async ({ distributorId, fileType, email, dateRange }: DistributorLedger) => {
  const response = await axiosInstance
    .post(`/admin/ledger/distributor`, {
      id: distributorId,
      fileType,
      email,
      startDate: dateRange?.startDate,
      endDate: dateRange?.endDate
    })
    .then(res => res.data)
  return response
}

export const sendLegderReportPdfEmail = async (formData: any) => {
  const response = await axiosInstance.post('/admin/send-pdf-email', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response
}
