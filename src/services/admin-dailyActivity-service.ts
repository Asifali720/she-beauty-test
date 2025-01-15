import type { DailyActivity } from '@/types/daily-activity'
import { axiosInstance } from './axiosCofig'

export const getDailyActivities = (
  pageNo: number | undefined,
  rowsPerPage: number,
  startDate?: Date | null,
  endDate?: Date | null
) => {
  if (startDate && endDate)
    return axiosInstance
      .get(
        `/admin/sr-daily-activity/all-daily-activity?pageNo=${pageNo}&size=${rowsPerPage}&startDate=${startDate}&endDate=${endDate}`
      )
      .then(res => res.data)
  else
    return axiosInstance
      .get(`/admin/sr-daily-activity/all-daily-activity?pageNo=${pageNo}&size=${rowsPerPage}`)
      .then(res => res.data)
}

export const addActivity = async ({
  sales_representative,
  visit_date,
  no_of_shops,
  no_of_orders,
  amount_of_orders,
  recovery_amount
}: DailyActivity) => {
  return await axiosInstance
    .post(`/admin/sr-daily-activity/add`, {
      sales_representative,
      visit_date,
      no_of_shops,
      no_of_orders: !no_of_orders ? 0 : no_of_orders,
      amount_of_orders,
      recovery_amount
    })
    .then(res => res.data)
}

export const UpdateActivity = async ({
  _id,
  visit_date,
  no_of_shops,
  no_of_orders,
  amount_of_orders,
  recovery_amount
}: DailyActivity) => {
  return await axiosInstance
    .post(`/admin/sr-daily-activity/update`, {
      visit_date,
      no_of_shops,
      no_of_orders,
      amount_of_orders,
      activity_id: _id,
      recovery_amount
    })
    .then(res => res.data)
}

export const deleteActivity = (activity_id: string | undefined) => {
  return axiosInstance.post(`/admin/sr-daily-activity/delete?activity_id=${activity_id}`)
}

export const searchDialyActivity = (search: string | undefined) => {
  return axiosInstance.get(`/admin/sr-daily-activity/search?search=${search}`).then(res => res.data)
}
