import { sendEmail } from '@/helpers/mailer'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const pdfFile = formData.get('file')
    const email = formData.get('email')
    const emailType = formData.get('emailType')
    const fileType = formData.get('fileType')
    const invoice_number = formData.get('invoice_number')
    const startDate = formData.get('startDate')
    const endDate = formData.get('endDate')

    if (!email || !emailType || !fileType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!pdfFile) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!(pdfFile instanceof File)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    const arrayBuffer = await pdfFile?.arrayBuffer()
    const pdfBytes = Buffer.from(arrayBuffer)

    await sendEmail({
      email,
      emailType,
      pdfBytes: pdfBytes,
      fileType,
      invoice_number,
      startDate,
      endDate
    })
    if (emailType == 'INVOICE') {
      return NextResponse.json({
        success: true,
        message: `Invoice has been sent to ${email} successfully`
      })
    } else if (emailType == 'LEDGER') {
      return NextResponse.json({
        success: true,
        message: `Ledger report has been sent to ${email} successfully`
      })
    }
  } catch (error) {
    console.error('Error processing file upload:', error)
    return NextResponse.json({ error: 'Failed to process file' }, { status: 500 })
  }
}
