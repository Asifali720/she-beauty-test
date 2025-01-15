import { NextResponse, type NextRequest } from 'next/server'

import { zfd } from 'zod-form-data'

import { connect } from '@/configs/dbconfig'
import PaidPaymentsModel from '@/models/paidPayment.model'
import { uploadImageFile } from '@/helpers/upload-image'
import VendorsModel from '@/models/vendor.model'

connect()

export async function POST(request: NextRequest) {
  try {
    const reqFormData = await request.formData()
    const paidPaymentId = reqFormData.get('paidPaymentId')
    const vendor = reqFormData.get('vendor')
    const amount = reqFormData.get('amount')
    const screenshot = reqFormData.get('screenshot')
    const note = reqFormData.get('note')
    const payment_date = reqFormData.get('payment_date')

    const schema = zfd.formData({
      paidPaymentId: zfd.text(),
      vendor: zfd.text(),
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

    // Check if paidPayment exists
    const paidPayment = await PaidPaymentsModel.findById(paidPaymentId)
    const isVendor = await VendorsModel.findById(vendor)

    if (!paidPayment) {
      return NextResponse.json({ error: 'Paid payment does not exist' }, { status: 400 })
    }

    if (!isVendor) {
      return NextResponse.json({ error: 'Vendor does not exist' }, { status: 400 })
    }

    if (paidPayment.vendor.toString() !== vendor) {
      if (!isVendor?.balance_amount || isVendor?.balance_amount < Number(amount)) {
        return NextResponse.json(
          { error: 'Insufficient balance or no available balance for the selected vendor.' },
          { status: 400 }
        )
      }

      const isLastPaidPayment = await PaidPaymentsModel.find({ vendor: paidPayment.vendor })
        .sort({ updatedAt: -1 })
        .limit(2)

      const lastPaidPayment = isLastPaidPayment.length > 0 ? isLastPaidPayment[1] : null

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

      await VendorsModel.updateOne(
        { _id: vendor },
        {
          $inc: { balance_amount: -Number(amount) },
          $set: { last_paid: payment_date, last_paid_amount: amount }
        }
      )
    } else {
      const total_balance = Number(isVendor?.balance_amount) + paidPayment.amount

      if (!total_balance || total_balance < Number(amount)) {
        return NextResponse.json(
          { error: 'Insufficient balance or no available balance for the selected vendor.' },
          { status: 400 }
        )
      }

      const balance_amount = paidPayment.amount - Number(amount)

      await VendorsModel.updateOne(
        { _id: vendor },
        { $inc: { balance_amount: balance_amount }, $set: { last_paid: payment_date, last_paid_amount: amount } }
      )
    }

    // Create an object to store the fields that need to be updated
    const updates: any = {
      vendor: paidPayment.vendor,
      amount: paidPayment.amount,
      screenshot: paidPayment.screenshot,
      note: paidPayment.note,
      payment_date: paidPayment.payment_date
    }

    if (vendor) {
      updates.vendor = vendor
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

    // Update paidPayment
    const updated = await PaidPaymentsModel.updateOne({ _id: paidPaymentId }, { $set: updates })

    if (updated) {
      const paidPayment = await PaidPaymentsModel.findById(paidPaymentId).populate('vendor')

      return NextResponse.json({
        success: true,
        paidPayment
      })
    } else {
      return NextResponse.json({ error: 'Something went wrong' }, { status: 400 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
