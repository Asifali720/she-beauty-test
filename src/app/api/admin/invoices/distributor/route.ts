import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { z } from 'zod'

import { sendEmail } from '@/helpers/mailer'
import InvoiceModel from '@/models/invoice.model'
import InvoiceItem from '@/models/invoiceItem.model'

import { createInvoicePdf } from '@/helpers/pdf-distributor-invoice'
import { axiosInstance } from '@/services/axiosCofig'

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json()
    const { fileType, email, id } = reqBody

    const schema = z.object({
      fileType: z.enum(['csv', 'pdf']),
      email: z.string().email(),
      id: z.string()
    })

    const validationRules = schema.safeParse(reqBody)

    if (!validationRules.success) {
      const { errors } = validationRules.error

      return NextResponse.json({ error: { message: 'Invalid request', errors } }, { status: 400 })
    }

    const invoice = await InvoiceModel.findById(id)

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice does not exist' }, { status: 400 })
    }
    const distributorId = invoice.distributor
    const distributor = await axiosInstance.get(`/admin/distributors/by-id?id=${distributorId}`).then(res => res.data)

    const invoiceItems = await axiosInstance.get(`/admin/invoices/invoice-items?invoice_id=${id}`).then(res => res.data)

    return NextResponse.json({
      message: 'new route',
      status: 200,
      data: distributor,
      invoiceItems: invoiceItems,
      invoice: invoice
    })
    // return NextResponse.json({
    //   success: true,
    //   message: `Ledger report has been sent to ${email} successfully`
    // })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
