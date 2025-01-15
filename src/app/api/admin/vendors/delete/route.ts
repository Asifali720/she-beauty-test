import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { z } from 'zod'

import { connect } from '@/configs/dbconfig'
import VendorsModel from '@/models/vendor.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json()
    const { vendorId } = reqBody

    const schema = z.object({
      vendorId: z.string()
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

    //check if vendor exists
    const vendor = await VendorsModel.findById(vendorId)

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor does not exist' }, { status: 400 })
    }

    // Create an object to store the fields that need to be updated
    const updates = {
      status: 'deleted',
      deletedAt: Date.now()
    }

    // update password
    const updated = await VendorsModel.updateOne({ _id: vendorId }, { $set: updates })

    if (updated) {
      const vendor = await VendorsModel.findById(vendorId)

      return NextResponse.json({
        success: true,
        vendor
      })
    } else {
      return NextResponse.json({ error: 'Something went wrong' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
