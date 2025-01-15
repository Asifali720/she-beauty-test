import type { Invoice } from '@/types/invoice'
import { axiosInstance } from './axiosCofig'

export const getInvoices = (
  pageNo: number | undefined,
  rowsPerPage: number,
  startDate?: Date | null,
  endDate?: Date | null
) => {
  if (startDate && endDate)
    return axiosInstance
      .get(
        `/admin/invoices/all-invoices?pageNo=${pageNo}&size=${rowsPerPage}&startDate=${startDate}&endDate=${endDate}`
      )
      .then(res => res.data)
  else
    return axiosInstance.get(`/admin/invoices/all-invoices?pageNo=${pageNo}&size=${rowsPerPage}`).then(res => res.data)
}

export const getInvoicesItem = (_id: string) => {
  return axiosInstance.get(`/admin/invoices/invoice-items?invoice_id=${_id}`).then(res => res.data)
}

export const addInvoice = ({ distributorId, products, totalCost, due_date, invoice_date }: Invoice) => {
  return axiosInstance
    .post(`/admin/invoices/add`, { distributor: distributorId, products, totalCost, due_date, invoice_date })
    .then(res => res.data)
}

export const updateInvoice = ({ _id, distributorId, products, totalCost, due_date, invoice_date }: Invoice) => {
  return axiosInstance
    .post(`/admin/invoices/update`, {
      invoiceId: _id,
      distributor: distributorId,
      products,
      totalCost,
      due_date,
      invoice_date
    })
    .then(res => res.data)
}

export const searchInvoices = (search: string | undefined) => {
  return axiosInstance.get(`/admin/invoices/search?search=${search}`).then(res => res.data)
}

export const deleteInvoice = (invoiceId: string | undefined) => {
  return axiosInstance.post(`/admin/invoices/delete?invoiceId=${invoiceId}`).then(res => res.data)
}

export const getInvoiceById = (invoiceId: string | undefined) => {
  return axiosInstance.get(`/admin/invoices/by-id?id=${invoiceId}`)
}
