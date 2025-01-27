import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { z } from 'zod'

import InvoiceModel from '@/models/invoice.model'

import DistributorsModel from '@/models/distributors.model'
import InvoiceItemModel from '@/models/invoiceItem.model'

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
    const distributor = await DistributorsModel.findById(distributorId)
    const invoiceItems = await InvoiceItemModel.find({ invoice_id: id }).populate('product')

    const invoiceTotal = invoiceItems?.reduce((acc: number, item: any) => {
      return acc + item.product.price * item.qty
    }, 0)

    return NextResponse.json({ message: 'success', data: { invoice, invoiceItems, distributor, invoiceTotal } })
  } catch (error: any) {
    return NextResponse.json({ error: `>>>> error ${error.message}` }, { status: 500 })
  }
}
