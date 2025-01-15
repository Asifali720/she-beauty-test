import { NextResponse, type NextRequest } from 'next/server'

import { connect } from '@/configs/dbconfig'

import OrderModel from '@/models/order.model'

connect()

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get('search')

    const orders = await OrderModel.find({
      $or: [
        { customer_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone_no: { $regex: search, $options: 'i' } }
      ]
    })

    return NextResponse.json({
      success: true,
      orders
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
