import { NextResponse, type NextRequest } from 'next/server'

import { connect } from '@/configs/dbconfig'
import ClaimModel from '@/models/claims.model'
import DistributorsModel from '@/models/distributors.model'

import type { Distributor } from '@/types/distributor'

connect()

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get('search')

  try {
    // Find the vendor based on the name
    const distributors = await DistributorsModel.find({
      name: { $regex: search, $options: 'i' }
    })

    if (!distributors) {
      return NextResponse.json({
        success: true,
        claims: []
      })
    }

    // Use Promise.all to wait for all claims to be fetched
    const claimsPromises = distributors.map(async (distributor: Distributor) => {
      const distributorClaims = await ClaimModel.find({ distributor: distributor._id }).populate('distributor')

      return distributorClaims
    })

    const claims = await Promise.all(claimsPromises)

    // Flatten the nested array structure
    const flattenedClaims = await claims.flatMap((item: any) => item)

    return NextResponse.json({
      success: true,
      claims: flattenedClaims
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
