import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { connect } from '@/configs/dbconfig'

import BillModel from '@/models/bill.model'
import BillItemModel from '@/models/billItem.model'
import BillIngredientModal from '@/models/billIngredient.model'

connect()

export async function GET(request: NextRequest) {
  try {
    const pageNo = Number(request.nextUrl.searchParams.get('pageNo') || 1)
    const size = Number(request.nextUrl.searchParams.get('size') || 10)
    const startDate = request.nextUrl.searchParams.get('startDate')
    const endDate = request.nextUrl.searchParams.get('endDate')

    const totalCount = await BillModel.countDocuments() // Get total number of documents

    const query = {
      skip: size * (pageNo - 1),
      limit: size,
      sort: { createdAt: -1 }
    }

    const totalPages = Math.ceil(totalCount / size)

    const to = size * pageNo
    const from = to - (size - 1)

    let bills: any = []

    if (startDate && endDate) {
      bills = await BillModel.find(
        {
          createdAt: {
            $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)).toISOString(),
            $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)).toISOString()
          }
        },
        {},
        query
      ).populate('vendor')
    } else {
      bills = await BillModel.find({}, {}, query).populate('vendor')
    }

    const billsWithTotalItem = await Promise.all(
      bills.map(async (bill: any) => {
        const raw_items = await BillItemModel.find({ bill_id: bill._id }).populate('raw_item')

        const ingredients = await BillIngredientModal.find({ bill_id: bill._id }).populate('ingredient')

        const totalRawItems = raw_items?.reduce((acc, item) => acc + item?.qty, 0)

        const totalIngredients = ingredients?.reduce((acc, item) => acc + item?.qty, 0)

        return { ...bill?.toObject(), total_items: totalRawItems + totalIngredients }
      })
    )

    return NextResponse.json({
      success: true,
      totalPages,
      totalRows: totalCount,
      from,
      to: to > totalCount ? totalCount : to,
      bills: billsWithTotalItem
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
