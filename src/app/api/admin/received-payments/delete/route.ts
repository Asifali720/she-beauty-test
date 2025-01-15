import { NextResponse, type NextRequest } from 'next/server'

import { z } from 'zod'

import { connect } from '@/configs/dbconfig'

import ReceivedPaymentsModel from '@/models/receivedPayment.model'
import DistributorsModel from '@/models/distributors.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const receivedPaymentId = request.nextUrl.searchParams.get('receivedPaymentId')

    const schema = z.object({
      receivedPaymentId: z.string()
    })

    const validationRules = schema.safeParse({
      receivedPaymentId: request.nextUrl.searchParams.get('receivedPaymentId')
    })

    if (!validationRules.success) {
      const { errors } = validationRules.error

      return NextResponse.json(
        {
          error: { message: 'Invalid request', errors }
        },
        { status: 400 }
      )
    }

    const receivedPayment = await ReceivedPaymentsModel.findById(receivedPaymentId)

    if (!receivedPayment) {
      return NextResponse.json({ error: 'Received payment does not exist' }, { status: 400 })
    }

    const receivedPaymentDeleted = await ReceivedPaymentsModel.findByIdAndDelete(receivedPaymentId)

    if (receivedPaymentDeleted) {
      const isLastReceivedPayment = await ReceivedPaymentsModel.find({ distributor: receivedPayment.distributor })
        .sort({ updatedAt: -1 })
        .limit(1)

      const lastReceivedPayment = isLastReceivedPayment.length > 0 ? isLastReceivedPayment[0] : null

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

      return NextResponse.json({
        success: true,
        message: 'It is deleted successfully.'
      })
    } else {
      return NextResponse.json({ error: 'Something went wrong' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
