import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { z } from 'zod'

import { connect } from '@/configs/dbconfig'

import IngredientsModel from '@/models/ingredients.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json()
    const { ingredientId } = reqBody

    const schema = z.object({
      ingredientId: z.string()
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

    //check if ingredient exists
    const ingredient = await IngredientsModel.findById(ingredientId)

    if (!ingredient) {
      return NextResponse.json({ error: 'Vendor does not exist' }, { status: 400 })
    }

    // Create an object to store the fields that need to be updated
    const updates = {
      status: 'deleted',
      deletedAt: Date.now()
    }

    // update password
    const updated = await IngredientsModel.updateOne({ _id: ingredientId }, { $set: updates })

    if (updated) {
      const ingredient = await IngredientsModel.findById(ingredientId)

      return NextResponse.json({
        success: true,
        ingredient
      })
    } else {
      return NextResponse.json({ error: 'Something went wrong' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
