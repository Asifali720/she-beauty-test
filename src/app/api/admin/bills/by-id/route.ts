import { type NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'

import { connect } from '@/configs/dbconfig'

import BillModel from '@/models/bill.model'
import BillItemModel from '@/models/billItem.model'
import BillIngredient from '@/models/billIngredient.model'

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

    const bill = await BillModel.findById(id).populate('vendor')
    const billItems = await BillItemModel.find({ bill_id: id }).populate('raw_item')
    const billIngredients = await BillIngredient.find({ bill_id: id }).populate('ingredient')

    return NextResponse.json({
      success: true,
      bill,
      billItems,
      billIngredients
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
