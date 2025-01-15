import { NextResponse, type NextRequest } from 'next/server'

import { z } from 'zod'

import { connect } from '@/configs/dbconfig'

import PaidPaymentsModel from '@/models/paidPayment.model'
import VendorsModel from '@/models/vendor.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const paidPaymentId = request.nextUrl.searchParams.get('paidPaymentId')

    const schema = z.object({
      paidPaymentId: z.string()
    })

    const validationRules = schema.safeParse({ paidPaymentId: request.nextUrl.searchParams.get('paidPaymentId') })

    if (!validationRules.success) {
      const { errors } = validationRules.error

      return NextResponse.json(
        {
          error: { message: 'Invalid request', errors }
        },
        { status: 400 }
      )
    }

    const paidPayment = await PaidPaymentsModel.findById(paidPaymentId)

    if (!paidPayment) {
      return NextResponse.json({ error: 'Paid payment does not exist' }, { status: 400 })
    }

    const paidPaymentDeleted = await PaidPaymentsModel.findByIdAndDelete(paidPaymentId)

    if (paidPaymentDeleted) {
      const isLastPaidPayment = await PaidPaymentsModel.find({ vendor: paidPayment.vendor })
        .sort({ updatedAt: -1 })
        .limit(1)

      const lastPaidPayment = isLastPaidPayment.length > 0 ? isLastPaidPayment[0] : null

      await VendorsModel.updateOne(
        { _id: paidPayment.vendor },
        {
          $inc: { balance_amount: paidPayment.amount },
          $set: {
            last_paid: lastPaidPayment?.payment_date || null,
            last_paid_amount: lastPaidPayment?.amount || 0
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
