import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { connect } from '@/configs/dbconfig'

import RawItemModel from '@/models/rawitem.model'

connect()

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get('search')
  const status = request.nextUrl.searchParams.get('status')

  try {
    let rawItems

    if (status === 'deleted') {
      rawItems = await RawItemModel.find({
        $and: [
          {
            $or: [{ sku: { $regex: search, $options: 'i' } }, { name: { $regex: search, $options: 'i' } }]
          },
          { status: 'deleted' } // Status is not equal to "deleted"
        ]
      })
    } else {
      rawItems = await RawItemModel.find({
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
      rawItems
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
