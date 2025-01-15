import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { z } from 'zod'

import { connect } from '@/configs/dbconfig'

import BillModel from '@/models/bill.model'
import BillItemModel from '@/models/billItem.model'
import PaidPaymentModel from '@/models/paidPayment.model'

connect()

export async function GET(request: NextRequest) {
  try {
    const pageNo = Number(request.nextUrl.searchParams.get('pageNo') || 1)
    const size = Number(request.nextUrl.searchParams.get('size') || 10)
    const startDate = request.nextUrl.searchParams.get('startDate')
    const endDate = request.nextUrl.searchParams.get('endDate')
    const id = request.nextUrl.searchParams.get('id')

    const schema = z.object({
      id: z.string()
    })

    const validationRules = schema.safeParse({ id })

    if (!validationRules.success) {
      const { errors } = validationRules.error

      return NextResponse.json(
        {
          error: { message: 'Invalid request', errors }
        },
        { status: 400 }
      )
    }

    const query = {
      skip: size * (pageNo - 1),
      limit: size,
      sort: { createdAt: -1 }
    }

    let bills: any = []
    let paidPayments: any = []

    const filter: any = { vendor: id }

    if (startDate && endDate) {
      const start = new Date(new Date(startDate).setHours(0, 0, 0, 0)).toISOString()
      const end = new Date(new Date(endDate).setHours(23, 59, 59, 999)).toISOString()

      filter.createdAt = {
        $gte: start,
        $lte: end
      }
    }

    // Fetch bills and paidPayments associated with the vendor ID
    bills = await BillModel.find(filter, {}, query)

    paidPayments = await PaidPaymentModel.find(filter, {}, query)

    const billsWithTotalItem = await Promise.all(
      bills.map(async (bill: any) => {
        const raw_items = await BillItemModel.find({ bill_id: bill._id }).populate('raw_item')

        const totalRawItems = raw_items?.reduce((acc, item) => acc + item?.qty, 0)

        return { ...bill?.toObject(), total_items: totalRawItems || 0 }
      })
    )

    const mergedData = [...billsWithTotalItem, ...paidPayments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    const totalCount = mergedData.length

    const totalPages = Math.ceil(totalCount / size)

    const to = size * pageNo
    const from = to - (size - 1)

    return NextResponse.json({
      success: true,
      totalPages,
      totalRows: totalCount,
      from,
      to: to > totalCount ? totalCount : to,
      vendorLegder: mergedData
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
