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
    const receivedPaymentId = reqFormData.get('receivedPaymentId')
    const distributor = reqFormData.get('distributor')
    const amount = reqFormData.get('amount')
    const screenshot = reqFormData.get('screenshot')
    const note = reqFormData.get('note')
    const payment_date = reqFormData.get('payment_date')

    const schema = zfd.formData({
      receivedPaymentId: zfd.text(),
      distributor: zfd.text(),
      amount: zfd.text(),
      screenshot: zfd.file().optional(),
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

    // Check if receivedPayment exists
    const receivedPayment = await ReceivedPaymentsModel.findById(receivedPaymentId)
    const isDistributor = await DistributorsModel.findById(distributor)

    if (!receivedPayment) {
      return NextResponse.json({ error: 'Received payment does not exist' }, { status: 400 })
    }

    if (!isDistributor) {
      return NextResponse.json({ error: 'Distributor does not exist' }, { status: 400 })
    }

    if (receivedPayment.distributor.toString() !== distributor) {
      if (!isDistributor?.to_received || isDistributor?.to_received < Number(amount)) {
        return NextResponse.json(
          { error: 'Insufficient received amount for the selected distributor.' },
          { status: 400 }
        )
      }

      const isLastReceivedPayment = await ReceivedPaymentsModel.find({ distributor: receivedPayment.distributor })
        .sort({ updatedAt: -1 })
        .limit(2)

      const lastReceivedPayment = isLastReceivedPayment.length > 0 ? isLastReceivedPayment[1] : null

      await DistributorsModel.updateOne(
        { _id: receivedPayment.distributor },
        {
          $inc: { to_received: receivedPayment.amount },
          $set: {
            last_received: lastReceivedPayment?.payment_date || null,
            last_received_amount: lastReceivedPayment?.amount || 0
          }
        }
      )

      await DistributorsModel.updateOne(
        { _id: distributor },
        {
          $inc: { to_received: -Number(amount) },
          $set: { last_received: payment_date, last_received_amount: amount }
        }
      )
    } else {
      const total_balance = Number(isDistributor?.to_received) + receivedPayment.amount

      if (!total_balance || total_balance < Number(amount)) {
        return NextResponse.json(
          { error: 'Insufficient received amount for the selected distributor.' },
          { status: 400 }
        )
      }

      const to_received = receivedPayment.amount - Number(amount)

      await DistributorsModel.updateOne(
        { _id: distributor },
        { $inc: { to_received: to_received }, $set: { last_received: payment_date, last_received_amount: amount } }
      )
    }

    // Create an object to store the fields that need to be updated
    const updates: any = {
      distributor: receivedPayment.distributor,
      amount: receivedPayment.amount,
      screenshot: receivedPayment.screenshot,
      note: receivedPayment.note,
      payment_date: receivedPayment.payment_date
    }

    if (distributor) {
      updates.distributor = distributor
    }

    if (amount) {
      updates.amount = amount
    }

    if (screenshot) {
      const photoUrl = await uploadImageFile(screenshot)

      updates.screenshot = photoUrl
    }

    if (note) {
      updates.note = note
    }

    if (payment_date) {
      updates.payment_date = payment_date
    }

    // Update receivedPayment
    const updated = await ReceivedPaymentsModel.updateOne({ _id: receivedPaymentId }, { $set: updates })

    if (updated) {
      const receivedPayment = await ReceivedPaymentsModel.findById(receivedPaymentId).populate('distributor')

      return NextResponse.json({
        success: true,
        receivedPayment
      })
    } else {
      return NextResponse.json({ error: 'Something went wrong' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
