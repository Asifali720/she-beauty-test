import { formatTime } from '@/@core/utils/format'

export function ledgerDistributorPdfHtmlTemplate({ distributor, mergedData, startDate, endDate, base64Logo }: any) {
  const data = [
    { key: 'Distributor Name', value: distributor?.name || 'N/A' },
    { key: 'Email', value: distributor?.email || 'N/A' },
    { key: 'Phone No', value: distributor?.phone_no || 'N/A' },
    { key: 'To Receive Amount', value: distributor?.to_received || 0 },
    { key: 'Address', value: distributor?.address || 'N/A' },
    { key: 'From Date', value: formatTime(startDate) },
    { key: 'To Date', value: formatTime(endDate) },
    { key: 'Last Received Amount', value: distributor?.last_received_amount || 0 },
    { key: 'Last Received At', value: formatTime(distributor?.last_received) || 'N/A' },
    { key: 'Claimed Amount', value: formatTime(distributor?.claimed_amount) || 0 }
  ]

  let html = `
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');
        html, body {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Poppins', sans-serif;
        }
        .container {
          padding: 40px;
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
        .info-row {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .info-row span {
          font-size: 14px;
        }
        .info-key {
          font-weight: 600;
          width: 170px;
          color: black;
        }
        .info-value {
          font-weight: 400;
          color: black;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div style="text-align: center; margin-bottom: 40px;">
          <img src="${base64Logo}" alt="SheBeauty Logo" style="max-width:100px; max-height:100px;" />
        </div>

        <h1 style="color: black;">Ledger Report</h1>
  `

  data.map(item => {
    html += `
      <div class="info-row">
        <span class="info-key">${item.key}</span>
        <span>:</span>
        <span class="info-value">${item.value}</span>
      </div>
    `
  })

  html += `<div style="margin-bottom: 20px;"></div>`

  if (mergedData.length > 0) {
    html += `
      <table>
        <tr style="color: black">
          <th>Invoice No</th>
          <th>Type</th>
          <th>Amount</th>
          <th>Payment At</th>
          <th>Created At</th>
        </tr>
    `
    mergedData.map((row: any) => {
      const amount = row?.invoice_amount || row?.amount || row?.total_cost
      const date = formatTime(row?.createdAt)
      const payment_date = formatTime(row?.payment_date)

      const invoice_number =
        row?.invoice_number || row?.adjustment_number || row?.claim_number || row?.received_payment_number

      html += `
        <tr style="color: black">
          <td>${invoice_number || 'N/A'}</td>
          <td>${row?.type}</td>
          <td>${amount || 0}</td>
          <td>${payment_date || 'N/A'}</td>
          <td>${date || 'N/A'}</td>
        </tr>
      `
    })

    html += `</table>`
  }

  html += `</div></body></html>`

  return html
}
