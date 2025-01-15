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
    const vendor = reqFormData.get('vendor')
    const amount = reqFormData.get('amount')
    const screenshot = reqFormData.get('screenshot')
    const note = reqFormData.get('note')
    const payment_date = reqFormData.get('payment_date')

    const schema = zfd.formData({
      vendor: zfd.text(),
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

    const isVendor = await VendorsModel.findById(vendor)

    if (!isVendor) {
      return NextResponse.json({ error: 'Vendor does not exist' }, { status: 400 })
    }

    if (!isVendor?.balance_amount)
      return NextResponse.json({ error: 'The vendor currently has no available balance.' }, { status: 400 })
    else if (isVendor?.balance_amount < amount!)
      return NextResponse.json({ error: 'Insufficient vendor balance' }, { status: 400 })

    const photoUrl = await uploadImageFile(screenshot!)

    const newPaidPayment = new PaidPaymentsModel({
      vendor,
      amount,
      screenshot: photoUrl,
      note,
      payment_date
    })

    await VendorsModel.updateOne(
      { _id: vendor },
      { $inc: { balance_amount: -amount! }, $set: { last_paid: payment_date, last_paid_amount: amount } }
    )

    const savedPaidPayment = await newPaidPayment.save()

    return NextResponse.json({
      success: true,
      message: 'Payment created successfully',
      paidPayment: savedPaidPayment
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
