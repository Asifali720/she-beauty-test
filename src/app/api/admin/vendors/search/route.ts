import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { connect } from '@/configs/dbconfig'

import VendorModel from '@/models/vendor.model'

connect()

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get('search')
  const status = request.nextUrl.searchParams.get('status')

  try {
    let vendors

    if (status === 'deleted') {
      vendors = await VendorModel.find({
        $and: [
          {
            $or: [{ sku: { $regex: search, $options: 'i' } }, { name: { $regex: search, $options: 'i' } }]
          },
          { status: 'deleted' } // Status is not equal to "deleted"
        ]
      })
    } else {
      vendors = await VendorModel.find({
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
      vendors
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
