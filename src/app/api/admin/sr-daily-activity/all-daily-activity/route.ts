import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { connect } from '@/configs/dbconfig'

import SrDailyActivityModel from '@/models/srDailyActivity.model'

connect()

export async function GET(request: NextRequest) {
  try {
    const pageNo = Number(request.nextUrl.searchParams.get('pageNo') || 1)
    const size = Number(request.nextUrl.searchParams.get('size') || 10)
    const startDate = request.nextUrl.searchParams.get('startDate')
    const endDate = request.nextUrl.searchParams.get('endDate')

    const totalCount = await SrDailyActivityModel.countDocuments() // Get total number of documents

    const query = {
      skip: size * (pageNo - 1),
      limit: size,
      sort: { createdAt: -1 }
    }

    let srDailyActivitities: any = []

    if (startDate && endDate) {
      srDailyActivitities = await SrDailyActivityModel.find(
        {
          createdAt: {
            $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)).toISOString(),
            $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)).toISOString()
          }
        },
        {},
        query
      ).populate('sales_representative')
    } else {
      srDailyActivitities = await SrDailyActivityModel.find({}, {}, query).populate('sales_representative')
    }

    const totalPages = Math.ceil(totalCount / size)

    const to = size * pageNo
    const from = to - (size - 1)

    return NextResponse.json({
      success: true,
      totalPages,
      totalRows: totalCount,
      from,
      to: to > totalCount ? totalCount : to,
      srDailyActivitities
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
