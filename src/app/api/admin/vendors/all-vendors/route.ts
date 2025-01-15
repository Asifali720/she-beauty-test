import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { connect } from '@/configs/dbconfig'

import VendorsModel from '@/models/vendor.model'

connect()

export async function GET(request: NextRequest) {
  try {
    const pageNo = Number(request.nextUrl.searchParams.get('pageNo') || 1)
    const size = Number(request.nextUrl.searchParams.get('size') || 10)

    const totalCount = await VendorsModel.countDocuments({
      status: { $ne: 'deleted' }
    }) // Get total number of documents

    const query = {
      skip: size * (pageNo - 1),
      limit: size,
      sort: { createdAt: -1 }
    }

    const vendors = await VendorsModel.find({ status: { $ne: 'deleted' } }, {}, query)

    const totalPages = Math.ceil(totalCount / size)

    const to = size * pageNo
    const from = to - (size - 1)

    return NextResponse.json({
      success: true,
      totalPages,
      totalRows: totalCount,
      from,
      to: to > totalCount ? totalCount : to,
      vendors
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
