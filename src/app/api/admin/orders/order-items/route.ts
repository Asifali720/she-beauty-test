import { NextResponse, type NextRequest } from 'next/server'

import { z } from 'zod'

import { connect } from '@/configs/dbconfig'

import OrderItemModel from '@/models/orderItem.model'

connect()

export async function GET(request: NextRequest) {
  try {
    const order_id = request.nextUrl.searchParams.get('order_id')

    const schema = z.object({
      order_id: z.string()
    })

    const validationRules = schema.safeParse({ order_id: request.nextUrl.searchParams.get('order_id') })

    if (!validationRules.success) {
      const { errors } = validationRules.error

      return NextResponse.json(
        {
          error: { message: 'Invalid request', errors }
        },
        { status: 400 }
      )
    }

    const orderItems = await OrderItemModel.find({ order_id }).populate('product')

    return NextResponse.json({
      success: true,
      orderItems
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
