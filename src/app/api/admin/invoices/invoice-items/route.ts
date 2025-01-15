import { NextResponse, type NextRequest } from 'next/server'

import { z } from 'zod'

import { connect } from '@/configs/dbconfig'

import InvoiceItemModel from '@/models/invoiceItem.model'

connect()

export async function GET(request: NextRequest) {
  try {
    const invoice_id = request.nextUrl.searchParams.get('invoice_id')

    const schema = z.object({
      invoice_id: z.string()
    })

    const validationRules = schema.safeParse({ invoice_id: request.nextUrl.searchParams.get('invoice_id') })

    if (!validationRules.success) {
      const { errors } = validationRules.error

      return NextResponse.json(
        {
          error: { message: 'Invalid request', errors }
        },
        { status: 400 }
      )
    }

    const invoiceItems = await InvoiceItemModel.find({ invoice_id }).populate('product')

    return NextResponse.json({
      success: true,
      invoiceItems
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
