import { formatTime } from '@/@core/utils/format'

export function vendorPdfHtmlTemplate({ vendor, mergedData, startDate, endDate, base64Logo }: any) {
  // eslint-disable-next-line import/no-named-as-default-member
  const data = [
    { key: 'Vendor Name', value: vendor?.name || 'N/A' },
    { key: 'Email', value: vendor?.email || 'N/A' },
    { key: 'Phone No', value: vendor?.phone_no || 'N/A' },
    { key: 'To Pay', value: vendor?.balance_amount || 0 },
    { key: 'Address', value: vendor?.address || 'N/A' },
    { key: 'From Date', value: formatTime(startDate) },
    { key: 'To Date', value: formatTime(endDate) },
    { key: 'Last Paid Amount', value: vendor?.last_paid_amount || 0 },
    { key: 'Last Paid At', value: formatTime(vendor?.last_paid) || 'N/A' }
  ]

  let html = `
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');
        body {
          font-family: 'Poppins', sans-serif;
        }
        h1 {
          text-align: center;
          font-weight: 600;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;

        }
        th, td {
          border: 1px solid black;
          padding: 5px;
          text-align: center;
        }
        th {
          font-weight: 600;
        }


      </style>
    </head>
    <body>

  <div style="display: flex; flex-direction: row; align-items: center; justify-content: center; width: 100%">
   <img src="${base64Logo}" alt="SheBeauty Logo" style="max-width:100px; max-height:100px; "  />
  </div>



      <h1 style='color: black;'>Ledger Report</h1>
  `

  data.map(item => {
    html += `   <div style="display: flex; flex-direction: row; align-items: center; gap: 10px; width: 100%; margin-left: 40px">
      <span style="font-size: 14px; font-weight: 600; display: inline-block; width: 150px; color: black">${item?.key}</span>
      <span style="font-size: 14px; font-weight: 600;">:</span>
      <span style="font-size: 14px; font-weight: 400; color: black">${item?.value}</span>
    </div>`
  })

  html += `<div style="margin-bottom: 20px;"></div>`

  if (mergedData.length > 0) {
    html += `
      <table>
          <tr style='color: black'>
              <th width="20%">Type</th>
              <th width="20%">Amount</th>
              <th width="20%">Items Count</th>
              <th width="20%">Payment At</th>
              <th width="20%">Created At</th>
          </tr>
    `
    mergedData.map((row: any) => {
      const amount = row?.bill_amount || row?.amount
      const date = formatTime(row?.createdAt)
      const payment_date = formatTime(row?.payment_date)

      html += `
          <tr style='color: black'>
              <td>${row?.bill_amount ? 'Bill' : 'Paid Payment'}</td>
              <td>${amount || 0}</td>
              <td>${row?.total_items || 0}</td>
              <td>${payment_date || 'N/A'}</td>
              <td>${date || 'N/A'}</td>
          </tr>
      `
    })

    html += `</table>`
  }

  html += `</body></html>`

  return html
}
