import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { z } from 'zod'

import { connect } from '@/configs/dbconfig'

import SalesRepresentativesModel from '@/models/salesRepresentatives.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json()
    const { representativesId } = reqBody

    const schema = z.object({
      representativesId: z.string()
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

    //check if salesRepresentative exists
    const salesRepresentative = await SalesRepresentativesModel.findById(representativesId)

    if (!salesRepresentative) {
      return NextResponse.json({ error: 'Sales Representative does not exist' }, { status: 400 })
    }

    // Create an object to store the fields that need to be updated
    const updates = {
      status: 'deleted',
      deletedAt: Date.now()
    }

    // update password
    const updated = await SalesRepresentativesModel.updateOne({ _id: representativesId }, { $set: updates })

    if (updated) {
      const salesRepresentative = await SalesRepresentativesModel.findById(representativesId)

      return NextResponse.json({
        success: true,
        salesRepresentative
      })
    } else {
      return NextResponse.json({ error: 'Something went wrong' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
