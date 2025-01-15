import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { connect } from '@/configs/dbconfig'

import DistributorsModel from '@/models/distributors.model'

connect()

export async function GET(request: NextRequest) {
  const pageNo = Number(request.nextUrl.searchParams.get('pageNo') || 1)
  const size = Number(request.nextUrl.searchParams.get('size') || 10)

  try {
    const totalCount = await DistributorsModel.countDocuments({
      status: { $ne: 'deleted' }
    }) // Get total number of documents

    const query = {
      skip: size * (pageNo - 1),
      limit: size,
      sort: { createdAt: -1 }
    }

    const distributors = await DistributorsModel.find({ status: { $ne: 'deleted' } }, {}, query)

    const totalPages = Math.ceil(totalCount / size)

    const to = size * pageNo
    const from = to - (size - 1)

    return NextResponse.json({
      success: true,
      totalPages,
      totalRows: totalCount,
      from,
      to: to > totalCount ? totalCount : to,
      distributors
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
