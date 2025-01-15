import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { z } from 'zod'

import { connect } from '@/configs/dbconfig'

import SrDailyActivityModel from '@/models/srDailyActivity.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const activity_id = request.nextUrl.searchParams.get('activity_id')

    const schema = z.object({
      activity_id: z.string()
    })

    const validationRules = schema.safeParse({ activity_id: request.nextUrl.searchParams.get('activity_id') })

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

    const activityDeleted = await SrDailyActivityModel.deleteOne({ _id: activity_id })

    if (activityDeleted) {
      return NextResponse.json({
        success: true,
        message: 'Daily activity deleted successflly'
      })
    } else {
      return NextResponse.json({ error: 'Something went wrong' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
