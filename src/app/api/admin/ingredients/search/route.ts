import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { connect } from '@/configs/dbconfig'

import IngredientsModel from '@/models/ingredients.model'

connect()

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get('search')
  const status = request.nextUrl.searchParams.get('status')

  try {
    let ingredients

    if (status === 'deleted') {
      ingredients = await IngredientsModel.find({
        $and: [
          {
            $or: [{ sku: { $regex: search, $options: 'i' } }, { name: { $regex: search, $options: 'i' } }]
          },
          { status: 'deleted' } // Status is not equal to "deleted"
        ]
      })
    } else {
      ingredients = await IngredientsModel.find({
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
      ingredients
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
