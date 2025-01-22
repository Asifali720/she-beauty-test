import { sendEmail } from '@/helpers/mailer'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Read the form data from the request
    const formData = await request.formData()

    // Extract the file from the form data
    const pdfFile = formData.get('file')

    if (!pdfFile) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Read the file as a buffer
    const arrayBuffer = await pdfFile?.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Example: Save the file (Optional)
    // Here you could save the file to a file system or upload it to a cloud service.
    // await sendEmail({ email, emailType: 'LEDGER', startDate, endDate, pdfBytes: csvBytes, fileType })
    const email = 'iamasifali720@gmail.com'
    const fileType = 'pdf'
    await sendEmail({
      email,
      emailType: 'INVOICE',
      pdfBytes: buffer,
      fileType,
      invoice_number: '1'
    })
    return NextResponse.json({ message: 'PDF received successfully' })
  } catch (error) {
    console.error('Error processing file upload:', error)
    return NextResponse.json({ error: 'Failed to process file' }, { status: 500 })
  }
}
