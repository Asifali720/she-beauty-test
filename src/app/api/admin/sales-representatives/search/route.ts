import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { connect } from '@/configs/dbconfig'

import SalesRepresentativeModel from '@/models/salesRepresentatives.model'

connect()

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get('search')
  const status = request.nextUrl.searchParams.get('status')

  try {
    let salesRepresentatives

    if (status === 'deleted') {
      salesRepresentatives = await SalesRepresentativeModel.find({
        $and: [
          { name: { $regex: search, $options: 'i' } },
          { status: 'deleted' } // Status is not equal to "deleted"
        ]
      })
    } else {
      salesRepresentatives = await SalesRepresentativeModel.find({
        $and: [
          { name: { $regex: search, $options: 'i' } },
          { status: { $ne: 'deleted' } } // Status is not equal to "deleted"
        ]
      })
    }

    return NextResponse.json({
      success: true,
      salesRepresentatives
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
