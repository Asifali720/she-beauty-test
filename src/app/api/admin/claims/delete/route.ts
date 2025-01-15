import { NextResponse, type NextRequest } from 'next/server'

import { z } from 'zod'

import { connect } from '@/configs/dbconfig'

import ClaimModel from '@/models/claims.model'
import ClaimItemModel from '@/models/claimItem.model'
import DistributorsModel from '@/models/distributors.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const claimId = request.nextUrl.searchParams.get('claimId')

    const schema = z.object({
      claimId: z.string()
    })

    const validationRules = schema.safeParse({ claimId: request.nextUrl.searchParams.get('claimId') })

    if (!validationRules.success) {
      const { errors } = validationRules.error

      return NextResponse.json(
        {
          error: { message: 'Invalid request', errors }
        },
        { status: 400 }
      )
    }

    const claim = await ClaimModel.findById(claimId)

    if (!claim) {
      return NextResponse.json({ error: 'Claim does not exist' }, { status: 400 })
    }

    const claimed_amount = await DistributorsModel.updateOne(
      { _id: claim.distributor },
      { $inc: { claimed_amount: -claim.total_cost } }
    )

    const claimItemsDeleted = await ClaimItemModel.deleteMany({ claim_id: claimId })

    const claimDeleted = await ClaimModel.findByIdAndDelete(claimId)

    if (claimed_amount?.acknowledged && claimDeleted && claimItemsDeleted) {
      return NextResponse.json({
        success: true,
        message: 'Claim deleted successflly'
      })
    } else {
      return NextResponse.json({ error: 'Something went wrong' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
