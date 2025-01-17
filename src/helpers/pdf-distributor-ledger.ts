import puppeteer from 'puppeteer'

import { formatTime } from '@/@core/utils/format'

export async function createDistributorPdf({ distributor, mergedData, startDate, endDate }: any) {
  // eslint-disable-next-line import/no-named-as-default-member
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
    executablePath: '/opt/build/cache/puppeteer/chrome-linux/chrome'
  })
  const page = await browser.newPage()

  const SheBeautyLogo =
    'https://firebasestorage.googleapis.com/v0/b/she-beauty-6cb28.appspot.com/o/image%2F11f2cf7c-d8bd-4f0d-a8cf-b14eac5adf56.png?alt=media&token=ee5d57de-cb5a-4fc9-91c8-de05df16ec19'

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
   <img src="${SheBeautyLogo}" alt="SheBeauty Logo" style="max-width:100px; max-height:100px; "  />
  </div>


            
      <h1>Ledger Report</h1>
  `

  data.map(item => {
    html += `   <div style="display: flex; flex-direction: row; align-items: center; gap: 10px; width: 100%;">
      <span style="font-size: 14px; font-weight: 600; display: inline-block; width: 170px;">${item?.key}</span>
      <span style="font-size: 14px; font-weight: 600;">:</span>
      <span style="font-size: 14px; font-weight: 400;">${item?.value}</span>
    </div>`
  })

  html += `<div style="margin-bottom: 20px;"></div>`

  if (mergedData.length > 0) {
    html += `
      <table>
          <tr>
             <th width="20%">Invoice No</th>
              <th width="20%">Type</th>
              <th width="20%">Amount</th>
              <th width="20%">Payment At</th>
              <th width="20%">Created At</th>
          </tr>
    `
    mergedData.map((row: any) => {
      const amount = row?.invoice_amount || row?.amount || row?.total_cost
      const date = formatTime(row?.createdAt)
      const payment_date = formatTime(row?.payment_date)

      const invoice_number =
        row?.invoice_number || row?.adjustment_number || row?.claim_number || row?.received_payment_number

      html += `
          <tr>
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

  html += `</body></html>`

  await page.setContent(html)

  const pdfBytes = await page.pdf({
    format: 'A4',
    margin: { top: 25, bottom: 25, right: 25, left: 25 },
    printBackground: true
  })

  await browser.close()

  return pdfBytes
}
