export const invoicePdfHtmlTemplate = ({ distributor, invoiceItems, invoice, invoiceTotal }: any) => {
  const percentagePrice = (invoiceTotal / 100) * 30
  let html = `<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.5; color: black">
    <div style="max-width: 600px; margin: auto; border: 1px solid #ccc; padding: 20px;">
        <h1 style="text-align: right; font-size: 52px; margin: 0; font-family: 'Montserrat', serif; color: black ">INVOICE</h1>
        <p style="text-align: right; font-size: 14px; margin: 0; font-weight: 600; color: black">#${invoice?.invoice_number}</p>

        <div style="margin: 20px 0;">
            <p style="margin: 0; color: black"><strong style="padding-right: 20px; padding-bottom: 24px; color: black">BILLED TO:</strong>${distributor?.name}</p>
            <p style="margin: 0; color: black"><strong style="padding-right: 20px; color: black">PAY TO:</strong>She Beauty</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
                <tr style="color: black">
                    <th style="border-bottom: 1px solid #ccc; text-align: left; padding: 5px;">PRODUCT</th>
                    <th style="border-bottom: 1px solid #ccc; text-align: left; padding: 5px;">PRICE</th>
                    <th style="border-bottom: 1px solid #ccc; text-align: left; padding: 5px;">QTY</th>
                    <th style="border-bottom: 1px solid #ccc; text-align: left; padding: 5px;">AMOUNT</th>
                </tr>
            </thead>
            <tbody>
              ${invoiceItems?.invoiceItems
                ?.map((item: any) => {
                  return `
                      <tr style='color: black'>
                        <td style="padding: 5px;">${item?.product?.name || 'N/A'}</td>
                        <td style="padding: 5px;">${item?.product?.price || 'N/A'}</td>
                        <td style="padding: 5px;">${item?.qty || 0}</td>
                        <td style="padding: 5px;">${item?.cost || 0}</td>
                      </tr>
                    `
                })
                .join('')}      
            </tbody>
        </table>

        <div style="text-align: right; margin: 20px 0;">
            <p style="margin: 0; color: black">Sub-Total: Rs.${invoiceTotal}</p>
            <p style="margin: 0; color: black">Discount (30%): Rs.${percentagePrice}</p>
            <p style="font-size: 18px; font-weight: bold; margin: 0; color: black">TOTAL: Rs.${invoiceTotal - percentagePrice}</p>
        </div>
        <p style='color: black'>Thank you for your business.</p>
    </div>
</body>
</html>`

  return html
}
