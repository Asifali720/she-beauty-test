import { type NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'

import { connect } from '@/configs/dbconfig'
import ClaimModel from '@/models/claims.model'
import ClaimItemModel from '@/models/claimItem.model'

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

    const claim = await ClaimModel.findById(id).populate('distributor')
    const claimItems = await ClaimItemModel.find({ claim_id: id }).populate('product')

    return NextResponse.json({
      success: true,
      claim,
      claimItems
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
