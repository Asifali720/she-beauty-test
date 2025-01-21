import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { z } from 'zod'

import InvoiceModel from '@/models/invoice.model'

import { createInvoicePdf } from '@/helpers/pdf-distributor-invoice'
import { axiosInstance } from '@/services/axiosCofig'

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')

    const schema = z.object({
      id: z.string()
    })
    if (id === undefined) {
      return NextResponse.json({ message: 'invalid id' })
    }

    const validationRules = schema.safeParse({ id: request.nextUrl.searchParams.get('id') })

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

    const invoiceTotal = invoiceItems?.invoiceItems.reduce((acc: number, item: any) => {
      return acc + item.product.price * item.qty
    }, 0)

    const pdfBytes = await createInvoicePdf({ distributor, invoice, invoiceItems, invoiceTotal })
    if (pdfBytes === undefined) {
      throw new Error('Failed to generate PDF bytes')
    }

    return new NextResponse(pdfBytes, {
      headers: { 'Content-Type': 'application/pdf' },
      status: 200
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
