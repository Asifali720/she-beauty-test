import { NextResponse, type NextRequest } from 'next/server'

import { zfd } from 'zod-form-data'

import { connect } from '@/configs/dbconfig'

import ReceivedPaymentsModel from '@/models/receivedPayment.model'

import { uploadImageFile } from '@/helpers/upload-image'
import DistributorsModel from '@/models/distributors.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const reqFormData = await request.formData()
    const distributor = reqFormData.get('distributor')
    const amount = reqFormData.get('amount')
    const screenshot = reqFormData.get('screenshot')
    const note = reqFormData.get('note')
    const payment_date = reqFormData.get('payment_date')

    const schema = zfd.formData({
      distributor: zfd.text(),
      amount: zfd.text(),
      screenshot: zfd.file(),
      note: zfd.text().optional(),
      payment_date: zfd.text()
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

    if (!isDistributor?.to_received)
      return NextResponse.json(
        { error: 'The distributor currently has no available received amount.' },
        { status: 400 }
      )
    else if (isDistributor?.to_received < amount!)
      return NextResponse.json({ error: 'Insufficient distributor received amount' }, { status: 400 })

    const photoUrl = await uploadImageFile(screenshot!)

    const newReceivedPayment = new ReceivedPaymentsModel({
      distributor,
      amount,
      screenshot: photoUrl,
      note,
      payment_date
    })

    await DistributorsModel.updateOne(
      { _id: distributor },
      { $inc: { to_received: -amount! }, $set: { last_received: payment_date, last_received_amount: amount } }
    )

    const savedReceivedPayment = await newReceivedPayment.save()

    return NextResponse.json({
      success: true,
      message: 'Received payment created successfully',
      receivedPayment: savedReceivedPayment
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
