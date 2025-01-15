import { type NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'

import { connect } from '@/configs/dbconfig'

import ProductModel from '@/models/product.model'

connect()

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')

    const schema = z.object({
      id: z.string()
    })

    const validationRules = schema.safeParse({ id: request.nextUrl.searchParams.get('id') })

    if (!validationRules.success) {
      const { errors } = validationRules.error

      return NextResponse.json(
        {
          error: { message: 'Invalid request', errors }
        },
        { status: 400 }
      )
    }

    const product = await ProductModel.findById(id).populate('raw_items.raw_item')

    return NextResponse.json({
      success: true,
      product
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
