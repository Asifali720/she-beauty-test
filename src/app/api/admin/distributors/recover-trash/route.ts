import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { z } from 'zod'

import { connect } from '@/configs/dbconfig'

import DistributorsModel from '@/models/distributors.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json()
    const { distributorId } = reqBody

    const schema = z.object({
      distributorId: z.string()
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
    const distributor = await DistributorsModel.findById(distributorId)

    if (!distributor) {
      return NextResponse.json({ error: 'Vendors does not exist' }, { status: 400 })
    }

    // Create an object to store the fields that need to be updated
    const updates = {
      status: 'available',
      deletedAt: null
    }

    // update password
    const updated = await DistributorsModel.updateOne({ _id: distributorId }, { $set: updates })

    if (updated) {
      const distributor = await DistributorsModel.findById(distributorId)

      return NextResponse.json({
        success: true,
        distributor
      })
    } else {
      return NextResponse.json({ error: 'Something went wrong' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
