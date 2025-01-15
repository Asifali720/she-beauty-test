import { NextResponse, type NextRequest } from 'next/server'

import { connect } from '@/configs/dbconfig'

import AdjustmentsModel from '@/models/adjustment.model'
import DistributorsModel from '@/models/distributors.model'

connect()

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get('search')

  try {
    const distributors = await DistributorsModel.find({
      name: { $regex: search, $options: 'i' }
    })

    if (!distributors) {
      return NextResponse.json({
        success: true,
        adjustments: []
      })
    }

    // Use Promise.all to wait for all invoices to be fetched
    const adjustmentsPromises = distributors.map(async (distributor: any) => {
      const distributorAdjustments = await AdjustmentsModel.find({ distributor: distributor._id }).populate(
        'distributor'
      )

      return distributorAdjustments
    })

    const adjustments = await Promise.all(adjustmentsPromises)

    // Flatten the nested array structure
    const flattenedAdjustments = await adjustments.flatMap((item: any) => item)

    return NextResponse.json({
      success: true,
      adjustments: flattenedAdjustments
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
