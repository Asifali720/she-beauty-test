import { utils, write } from 'xlsx'

import { formatTime } from '@/@core/utils/format'

export function createDistributorCsv({ mergedData }: any) {
  if (!mergedData?.length) return

  const formattedData = mergedData.map((item: any) => ({
    'Invoice Number':
      item?.invoice_number || item?.adjustment_number || item?.claim_number || item?.received_payment_number,
    Type: item?.type,
    Amount: item?.invoice_amount || item?.amount || item?.total_cost || 0,
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
