import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { z } from 'zod'

import { connect } from '@/configs/dbconfig'

import BillIngredientModal from '@/models/billIngredient.model'

connect()

export async function GET(request: NextRequest) {
  try {
    const bill_id = request.nextUrl.searchParams.get('bill_id')

    const schema = z.object({
      bill_id: z.string()
    })

    const validationRules = schema.safeParse({ bill_id: request.nextUrl.searchParams.get('bill_id') })

    if (!validationRules.success) {
      const { errors } = validationRules.error

      return NextResponse.json(
        {
          error: { message: 'Invalid request', errors }
        },
        { status: 400 }
      )
    }

    const billIngredients = await BillIngredientModal.find({ bill_id }).populate('ingredient')

    return NextResponse.json({
      success: true,
      billIngredients
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
