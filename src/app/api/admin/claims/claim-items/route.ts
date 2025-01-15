import { NextResponse, type NextRequest } from 'next/server'

import { z } from 'zod'

import { connect } from '@/configs/dbconfig'

import ClaimItemModel from '@/models/claimItem.model'

connect()

export async function GET(request: NextRequest) {
  try {
    const claim_id = request.nextUrl.searchParams.get('claim_id')

    const schema = z.object({
      claim_id: z.string()
    })

    const validationRules = schema.safeParse({ claim_id: request.nextUrl.searchParams.get('claim_id') })

    if (!validationRules.success) {
      const { errors } = validationRules.error

      return NextResponse.json(
        {
          error: { message: 'Invalid request', errors }
        },
        { status: 400 }
      )
    }

    const claimItems = await ClaimItemModel.find({ claim_id }).populate('product')

    return NextResponse.json({
      success: true,
      claimItems
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
