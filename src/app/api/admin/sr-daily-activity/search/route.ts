import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { connect } from '@/configs/dbconfig'

import SalesRepresentativeModel from '@/models/salesRepresentatives.model'
import SrDailyActivityModel from '@/models/srDailyActivity.model'

connect()

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get('search')

  try {
    const salesRepresentatives = await SalesRepresentativeModel.find({
      name: { $regex: search, $options: 'i' }
    })

    if (!salesRepresentatives) {
      return NextResponse.json({
        success: true,
        srDailyActivitities: []
      })
    }

    // Use Promise.all to wait for all salesRepresentatives to be fetched
    const srPromises = salesRepresentatives.map(async (sr: any) => {
      const srActivity = await SrDailyActivityModel.find({ sales_representative: sr._id }).populate(
        'sales_representative'
      )

      return srActivity
    })

    const salesRepresentativesArr = await Promise.all(srPromises)

    // Flatten the nested array structure
    const flattenedSr = await salesRepresentativesArr.flatMap((item: any) => item)

    return NextResponse.json({
      success: true,
      srDailyActivitities: flattenedSr
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
