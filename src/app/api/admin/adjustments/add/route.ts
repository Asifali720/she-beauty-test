import { NextResponse, type NextRequest } from 'next/server'

import { zfd } from 'zod-form-data'

import { connect } from '@/configs/dbconfig'

import AdjustmentsModal from '@/models/adjustment.model'
import DistributorsModel from '@/models/distributors.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const reqFormData = await request.formData()
    const distributor = reqFormData.get('distributor')
    const amount = reqFormData.get('amount')
    const note = reqFormData.get('note')

    const schema = zfd.formData({
      distributor: zfd.text(),
      amount: zfd.text(),
      note: zfd.text().optional()
    })

    const validationRules = schema.safeParse(reqFormData)

    if (!validationRules.success) {
      const { errors } = validationRules.error

      return NextResponse.json(
        {
          error: { message: 'Invalid request', errors }
        },
        { status: 400 }
      )
    }

    const isDistributor = await DistributorsModel.findById(distributor)

    if (!isDistributor) {
      return NextResponse.json({ error: 'Distributor does not exist' }, { status: 400 })
    }

    if (!isDistributor?.claimed_amount || !isDistributor?.to_received)
      return NextResponse.json(
        { error: 'The distributor currently has no available claimed or received amount.' },
        { status: 400 }
      )
    else if (isDistributor?.claimed_amount < amount! || isDistributor?.to_received < amount!)
      return NextResponse.json({ error: 'Insufficient distributor claimed or received amount' }, { status: 400 })

    const newAdjustment = new AdjustmentsModal({
      distributor,
      amount,
      note
    })

    await DistributorsModel.updateOne(
      { _id: distributor },
      { $inc: { claimed_amount: -amount!, to_received: -amount! } }
    )

    const savedAdjustment = await newAdjustment.save()

    return NextResponse.json({
      success: true,
      message: 'Adjustment created successfully',
      payment: savedAdjustment
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
