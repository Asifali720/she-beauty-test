import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { z } from 'zod'

import { connect } from '@/configs/dbconfig'

import SrDailyActivityModel from '@/models/srDailyActivity.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json()
    const { activity_id, visit_date, no_of_shops, no_of_orders, amount_of_orders, recovery_amount } = reqBody

    const schema = z.object({
      activity_id: z.string()
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

    const srDailyActivity = await SrDailyActivityModel.findById(activity_id)

    if (!srDailyActivity) {
      return NextResponse.json({ error: 'Sales Representative activity not exists' }, { status: 400 })
    }

    // Create an object to store the fields that need to be updated
    const updates = {
      visit_date: srDailyActivity.visit_date,
      no_of_shops: srDailyActivity.no_of_shops,
      no_of_orders: srDailyActivity.no_of_orders,
      amount_of_orders: srDailyActivity.amount_of_orders,
      recovery_amount: srDailyActivity.recovery_amount
    }

    if (visit_date) {
      updates.visit_date = visit_date
    }

    if (recovery_amount || recovery_amount === 0) {
      updates.recovery_amount = recovery_amount
    }

    if (no_of_shops) {
      updates.no_of_shops = no_of_shops
    }

    if (no_of_orders) {
      updates.no_of_orders = no_of_orders
    }

    if (amount_of_orders) {
      updates.amount_of_orders = amount_of_orders
    }

    // update bill
    const updated = await SrDailyActivityModel.updateOne({ _id: activity_id }, { $set: updates })

    if (updated) {
      const srDailyActivity = await SrDailyActivityModel.findById(activity_id).populate('sales_representative')

      return NextResponse.json({
        success: true,
        message: 'Daily activity updated successfully',
        srDailyActivity
      })
    } else {
      return NextResponse.json({ error: 'Something went wrong' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
