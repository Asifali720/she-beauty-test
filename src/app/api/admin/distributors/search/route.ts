import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { connect } from '@/configs/dbconfig'

import DistributorModel from '@/models/distributors.model'

connect()

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get('search')
  const status = request.nextUrl.searchParams.get('status')

  try {
    let distributors

    if (status === 'deleted') {
      distributors = await DistributorModel.find({
        $and: [
          {
            $or: [{ sku: { $regex: search, $options: 'i' } }, { name: { $regex: search, $options: 'i' } }]
          },
          { status: 'deleted' } // Status is not equal to "deleted"
        ]
      })
    } else {
      distributors = await DistributorModel.find({
        $and: [
          {
            $or: [{ sku: { $regex: search, $options: 'i' } }, { name: { $regex: search, $options: 'i' } }]
          },
          { status: { $ne: 'deleted' } } // Status is not equal to "deleted"
        ]
      })
    }

    return NextResponse.json({
      success: true,
      distributors
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
