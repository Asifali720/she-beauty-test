import { NextResponse, type NextRequest } from 'next/server'

import { z } from 'zod'

import { connect } from '@/configs/dbconfig'

import AdjustmentModel from '@/models/adjustment.model'
import DistributorsModel from '@/models/distributors.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const adjustmentId = request.nextUrl.searchParams.get('adjustmentId')

    const schema = z.object({
      adjustmentId: z.string()
    })

    const validationRules = schema.safeParse({ adjustmentId: request.nextUrl.searchParams.get('adjustmentId') })

    if (!validationRules.success) {
      const { errors } = validationRules.error

      return NextResponse.json(
        {
          error: { message: 'Invalid request', errors }
        },
        { status: 400 }
      )
    }

    const adjustment = await AdjustmentModel.findById(adjustmentId)

    if (!adjustment) {
      return NextResponse.json({ error: 'Adjustment does not exist' }, { status: 400 })
    }

    const adjustmentDeleted = await AdjustmentModel.findByIdAndDelete(adjustmentId)

    if (adjustmentDeleted) {
      await DistributorsModel.updateOne(
        { _id: adjustment.distributor },
        {
          $inc: { claimed_amount: adjustment.amount, to_received: adjustment.amount }
        }
      )

      return NextResponse.json({
        success: true,
        message: 'Adjustment deleted successflly'
      })
    } else {
      return NextResponse.json({ error: 'Something went wrong' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
