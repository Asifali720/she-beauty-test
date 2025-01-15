import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { z } from 'zod'

import { connect } from '@/configs/dbconfig'

import SrDailyActivityModel from '@/models/srDailyActivity.model'
import SalesRepresentativesModel from '@/models/salesRepresentatives.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json()
    const { sales_representative, visit_date, no_of_shops, no_of_orders, amount_of_orders, recovery_amount } = reqBody

    const schema = z.object({
      sales_representative: z.string(),
      visit_date: z.string(),
      no_of_shops: z.number(),
      no_of_orders: z.number().optional(),
      amount_of_orders: z.number(),
      recovery_amount: z.number()
    })

    const validationRules = schema.safeParse(reqBody)

    if (!validationRules.success) {
      const { errors } = validationRules.error

      return NextResponse.json(
        {
          error: { message: 'Invalid request', errors }
        },
        { status: 400 }
      )
    }

    //check if salesRepresentative already exists
    const salesRepresentative = await SalesRepresentativesModel.findById(sales_representative)

    if (!salesRepresentative) {
      return NextResponse.json({ error: 'Sales Representative does not exists' }, { status: 400 })
    }

    const srDailyActivity = await SrDailyActivityModel.findOne({ visit_date, sales_representative })

    if (srDailyActivity) {
      return NextResponse.json({ error: 'Sales Representative activity already exists' }, { status: 400 })
    }

    const newSrDailyActivity = new SrDailyActivityModel({
      sales_representative,
      visit_date,
      no_of_shops,
      no_of_orders,
      amount_of_orders,
      recovery_amount
    })

    const savedSalesRepresentatives = await newSrDailyActivity.save()

    return NextResponse.json({
      success: true,
      message: 'Daily activity created successfully.',
      srDailyActivity: savedSalesRepresentatives
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
