import { NextResponse, type NextRequest } from 'next/server'

import { connect } from '@/configs/dbconfig'

import ClaimModel from '@/models/claims.model'
import ClaimItemModel from '@/models/claimItem.model'

connect()

export async function GET(request: NextRequest) {
  try {
    const pageNo = Number(request.nextUrl.searchParams.get('pageNo') || 1)
    const size = Number(request.nextUrl.searchParams.get('size') || 10)
    const startDate = request.nextUrl.searchParams.get('startDate')
    const endDate = request.nextUrl.searchParams.get('endDate')

    const totalCount = await ClaimModel.countDocuments() // Get total number of documents

    const query = {
      skip: size * (pageNo - 1),
      limit: size,
      sort: { createdAt: -1 }
    }

    const totalPages = Math.ceil(totalCount / size)

    const to = size * pageNo
    const from = to - (size - 1)

    let claims: any = []

    if (startDate && endDate) {
      claims = await ClaimModel.find(
        {
          createdAt: {
            $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)).toISOString(),
            $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)).toISOString()
          }
        },
        {},
        query
      ).populate('distributor')
    } else {
      claims = await ClaimModel.find({}, {}, query).populate('distributor')
    }

    const claimsWithTotalItem = await Promise.all(
      claims.map(async (claim: any) => {
        const claimItems = await ClaimItemModel.find({ claim_id: claim._id }).populate('product')

        const totalItems = claimItems?.reduce((acc, item) => acc + item?.qty, 0)

        return { ...claim?.toObject(), total_items: totalItems || 0 }
      })
    )

    return NextResponse.json({
      success: true,
      totalPages,
      totalRows: totalCount,
      from,
      to: to > totalCount ? totalCount : to,
      claims: claimsWithTotalItem
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
