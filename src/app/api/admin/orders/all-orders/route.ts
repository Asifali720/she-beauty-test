import { NextResponse, type NextRequest } from 'next/server'

import { connect } from '@/configs/dbconfig'

import OrderModel from '@/models/order.model'
import OrderItem from '@/models/orderItem.model'

connect()

export async function GET(request: NextRequest) {
  try {
    const pageNo = Number(request.nextUrl.searchParams.get('pageNo') || 1)
    const size = Number(request.nextUrl.searchParams.get('size') || 10)
    const startDate = request.nextUrl.searchParams.get('startDate')
    const endDate = request.nextUrl.searchParams.get('endDate')

    const totalCount = await OrderModel.countDocuments() // Get total number of documents

    const query = {
      skip: size * (pageNo - 1),
      limit: size,
      sort: { createdAt: -1 }
    }

    const totalPages = Math.ceil(totalCount / size)

    const to = size * pageNo
    const from = to - (size - 1)

    let orders: any = []

    if (startDate && endDate) {
      orders = await OrderModel.find(
        {
          createdAt: {
            $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)).toISOString(),
            $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)).toISOString()
          }
        },
        {},
        query
      )
    } else {
      orders = await OrderModel.find({}, {}, query)
    }

    const ordersWithTotalItems = await Promise.all(
      orders.map(async (order: any) => {
        const products = await OrderItem.find({ order_id: order._id }).populate('product')

        const totalItems = products?.reduce((acc, item) => acc + item?.qty, 0)

        return { ...order?.toObject(), total_items: totalItems || 0 }
      })
    )

    return NextResponse.json({
      success: true,
      totalPages,
      totalRows: totalCount,
      from,
      to: to > totalCount ? totalCount : to,
      orders: ordersWithTotalItems
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
