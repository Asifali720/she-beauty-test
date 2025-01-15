import { utils, write } from 'xlsx'

import { formatTime } from '@/@core/utils/format'

export function createVendorCsv({ mergedData }: any) {
  if (!mergedData?.length) return

  const formattedData = mergedData.map((item: any) => ({
    Type: item?.bill_amount ? 'Bill' : 'Paid Payment',
    Amount: item?.bill_amount || item?.amount || 0,
    'Items Count': item?.total_items || 0,
    'Payment Date': formatTime(item?.payment_date) || 'N/A',
    'Created At': formatTime(item?.createdAt) || 'N/A'
  }))

  const ws = utils.json_to_sheet(formattedData)
  const wb = utils.book_new()

  utils.book_append_sheet(wb, ws, 'Data')

  const csv = write(wb, {
    type: 'buffer',
    bookType: 'csv'
  })

  return csv
}
