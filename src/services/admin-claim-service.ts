import type { Claim } from '@/types/claim'
import { axiosInstance } from './axiosCofig'

export const getClaims = (
  pageNo: number | undefined,
  rowsPerPage: number,
  startDate?: Date | null,
  endDate?: Date | null
) => {
  if (startDate && endDate)
    return axiosInstance
      .get(`/admin/claims/all-claims?pageNo=${pageNo}&size=${rowsPerPage}&startDate=${startDate}&endDate=${endDate}`)
      .then(res => res.data)
  else return axiosInstance.get(`/admin/claims/all-claims?pageNo=${pageNo}&size=${rowsPerPage}`).then(res => res.data)
}

export const getClaimsItem = (_id: string) => {
  return axiosInstance.get(`/admin/claims/claim-items?claim_id=${_id}`).then(res => res.data)
}

export const addClaim = ({ distributorId, products, note, total_cost, claimed_at }: Claim) => {
  return axiosInstance
    .post(`/admin/claims/add`, { distributor: distributorId, products, note, total_cost, claimed_at })
    .then(res => res.data)
}

export const updateClaim = ({ _id, distributorId, products, note, total_cost, claimed_at }: Claim) => {
  return axiosInstance
    .post(`/admin/claims/update`, { claimId: _id, distributor: distributorId, products, note, total_cost, claimed_at })
    .then(res => res.data)
}

export const searchClaims = (search: string | undefined) => {
  return axiosInstance.get(`/admin/claims/search?search=${search}`).then(res => res.data)
}

export const deleteClaim = (claimId: string | undefined) => {
  return axiosInstance.post(`/admin/claims/delete?claimId=${claimId}`).then(res => res.data)
}

export const getClaimById = (claimId: string | undefined) => {
  return axiosInstance.get(`/admin/claims/by-id?id=${claimId}`)
}
