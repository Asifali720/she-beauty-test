import { NextResponse, type NextRequest } from 'next/server'

import { connect } from '@/configs/dbconfig'

import InvoiceModel from '@/models/invoice.model'
import InvoiceItemModel from '@/models/invoiceItem.model'

connect()

export async function GET(request: NextRequest) {
  try {
    const pageNo = Number(request.nextUrl.searchParams.get('pageNo') || 1)
    const size = Number(request.nextUrl.searchParams.get('size') || 10)
    const startDate = request.nextUrl.searchParams.get('startDate')
    const endDate = request.nextUrl.searchParams.get('endDate')

    const totalCount = await InvoiceModel.countDocuments() // Get total number of documents

    const query = {
      skip: size * (pageNo - 1),
      limit: size,
      sort: { createdAt: -1 }
    }

    const totalPages = Math.ceil(totalCount / size)

    const to = size * pageNo
    const from = to - (size - 1)

    let invoices: any = []

    if (startDate && endDate) {
      invoices = await InvoiceModel.find(
        {
          createdAt: {
            $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)).toISOString(),
            $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)).toISOString()
          }
        },
        {},
        query
      ).populate('distributor')
    } else {
      invoices = await InvoiceModel.find({}, {}, query).populate('distributor')
    }

    const invoicesWithTotalItem = await Promise.all(
      invoices.map(async (invoice: any) => {
        const invoiceItems = await InvoiceItemModel.find({ invoice_id: invoice._id }).populate('product')

        const totalItems = invoiceItems?.reduce((acc, item) => acc + item?.qty, 0)

        return { ...invoice?.toObject(), total_items: totalItems || 0 }
      })
    )

    return NextResponse.json({
      success: true,
      totalPages,
      totalRows: totalCount,
      from,
      to: to > totalCount ? totalCount : to,
      invoices: invoicesWithTotalItem
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
