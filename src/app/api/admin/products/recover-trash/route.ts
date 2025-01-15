import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { z } from 'zod'

import { connect } from '@/configs/dbconfig'

import ProductModel from '@/models/product.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json()
    const { productId } = reqBody

    const schema = z.object({
      productId: z.string()
    })

    const validationRules = schema.safeParse(reqBody)

    if (!validationRules.success) {
      const { errors } = validationRules.error

      return NextResponse.json(
        {
          error: { message: 'Invalid request', errors }
        },
        { status: 400 }
      )
    }

    //check if product exists
    const product = await ProductModel.findById(productId)

    if (!product) {
      return NextResponse.json({ error: 'Product does not exist' }, { status: 400 })
    }

    // Create an object to store the fields that need to be updated
    const updates = {
      status: 'available',
      deletedAt: null
    }

    // update password
    const updated = await ProductModel.updateOne({ _id: productId }, { $set: updates })

    if (updated) {
      const product = await ProductModel.findById(productId)

      return NextResponse.json({
        success: true,
        product
      })
    } else {
      return NextResponse.json({ error: 'Something went wrong' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
