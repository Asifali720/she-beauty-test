import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { z } from 'zod'

import { connect } from '@/configs/dbconfig'
import RawItemsModel from '@/models/rawitem.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json()
    const { rawItemId } = reqBody

    const schema = z.object({
      rawItemId: z.string()
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

    //check if rawItem exists
    const rawItem = await RawItemsModel.findById(rawItemId)

    if (!rawItem) {
      return NextResponse.json({ error: 'RawItem does not exist' })
    }

    // Create an object to store the fields that need to be updated
    const updates = {
      status: 'deleted',
      deletedAt: Date.now()
    }

    // update password
    const updated = await RawItemsModel.updateOne({ _id: rawItemId }, { $set: updates })

    if (updated) {
      const rawItem = await RawItemsModel.findById(rawItemId)

      return NextResponse.json({
        success: true,
        rawItem
      })
    } else {
      return NextResponse.json({ error: 'Something went wrong' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
